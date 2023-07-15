import { Request, Response } from 'express';
const { Op } = require("sequelize");
import sequelize from 'sequelize';
import db from '../db/models/index';

interface responseAttributes {
    primaryContactId: Number;
    emails: string[];
    phoneNumbers: string[];
    secondaryContactIds: number[];
}

const transformResult = (contacts: any) => {
    let result: responseAttributes = {
        primaryContactId: null,
        emails: [],
        phoneNumbers: [],
        secondaryContactIds: []
    }
    contacts.forEach((contact: any) => {
        if (contact.dataValues.linkedPrecedence == 'primary') {
            result.primaryContactId = contact.dataValues.id;
        }
        else {
            result.secondaryContactIds.push(contact.dataValues.id);
        }
        result.emails.push(contact.dataValues.email);
        result.phoneNumbers.push(contact.dataValues.phoneNumber);

    });
    result.emails = [... new Set(result.emails)];
    result.phoneNumbers = [... new Set(result.phoneNumbers)];
    return { "contact": result }
}

const updateContacts = async (txn: sequelize.Transaction, primaryContact: any, restOfContacts: any) => {
    for (let contact of restOfContacts) {
        await db.contact.update(
            {
                linkedPrecedence: 'secondary',
                linkedId: primaryContact.id
            }, {
            where: { id: contact.id }
        }, { transaction: txn })
    }
}


const findSimilarContacts = async (txn: sequelize.Transaction, email: string, phoneNumber: Number, linkedId?: number) => {
    // Function to find contacts having email or phone number same
    const res: any = await db.contact.findAll({
        where: {
            [Op.or]: [
                { id: linkedId },
                { email: email },
                { phoneNumber: phoneNumber },
                { linkedId: linkedId }]
        },
        order: [
            ['createdAt', 'ASC']
        ]
    }, { transaction: txn });
    return res;
}

const simplifyContacts = async (txn: sequelize.Transaction, contacts: any, email: string, phoneNumber: number, linkedId: number) => {
    // Function to link multiple contacts of the same user to the first contact.
    if (contacts.length == 0) {
        return [];
    }
    const primaryContact: any = contacts[0].dataValues;
    const restOfContacts = contacts.slice(1);
    await updateContacts(txn, primaryContact, restOfContacts);
    return await findSimilarContacts(txn, email, phoneNumber, linkedId);
}

const getPrimaryContact = async (txn: sequelize.Transaction, email: string, phoneNumber: number) => {
    const res: any = await db.contact.findAll({
        attributes: ['id', 'linkedId', 'linkedPrecedence'],
        where: {
            [Op.or]: [
                { email: email },
                { phoneNumber: phoneNumber }
            ]
        },
        order: [
            ['createdAt', 'ASC']
        ]
    }, { transaction: txn });
    return res;
}

const handleContacts = async (req: Request, res: Response) => {
    const email: string = req.body?.email;
    const phoneNumber: number = req.body?.phoneNumber;
    if (phoneNumber == null && email == null) {
        res.status(404).send("Please ender valid emails and phone number");
        return;
    }
    const txn: sequelize.Transaction = await db.sequelize.transaction();
    try {
        if (email !== null && phoneNumber !== null) {
            const contactsFound = await db.contact.findAll({
                where: {
                    [Op.and]: [
                        { email: email },
                        { phoneNumber: phoneNumber }]
                }
            }, { transaction: txn });
            if (contactsFound.length == 0) {
                // If not contact found with the given email & phone number create one
                await db.contact.create({
                    phoneNumber: phoneNumber,
                    email: email,
                    linkedPrecedence: 'primary'
                });
            }
            const primaryContact: any = await getPrimaryContact(txn, email, phoneNumber)
            if (primaryContact.length == 0) {
                res.status(200).send("No Contacts found");
                return;
            }
            console.log(primaryContact[0].dataValues);
            let linkedId: number = null;
            if (primaryContact[0].dataValues.linkedPrecedence == 'primary') {
                linkedId = primaryContact[0].dataValues.id;
            }
            else {
                linkedId = primaryContact[0].dataValues.linkedId;
            }
            const existingContacts: any = await findSimilarContacts(txn, email, phoneNumber, linkedId);
            const updatedContacts: any = await simplifyContacts(txn, existingContacts, email, phoneNumber, linkedId);
            await txn.commit();
            res.status(200).send(transformResult(updatedContacts));
            return;
        }
        else {
            // Either email is there or phone number is null we cannot create a new contact 
            // so find the primary contact based on phone number and email
            const primaryContact: any = await getPrimaryContact(txn, email, phoneNumber)
            if (primaryContact.length == 0) {
                res.status(200).send("No Contacts found");
                return;
            }
            console.log(primaryContact[0].dataValues);
            let linkedId = null;
            if (primaryContact[0].dataValues.linkedPrecedence == 'primary') {
                linkedId = primaryContact[0].dataValues.id;
            }
            else {
                linkedId = primaryContact[0].dataValues.linkedId;
            }
            const existingContacts: any = await findSimilarContacts(txn, email, phoneNumber, linkedId);
            const updatedContacts = await simplifyContacts(txn, existingContacts, email, phoneNumber, linkedId);
            await txn.commit();
            res.status(200).send(transformResult(updatedContacts));
            return;
        }
    }
    catch (err) {
        await txn.rollback();
        res.status(400).send(transformResult("Bad request"));
    }

}
export default handleContacts;