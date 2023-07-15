import { Router } from "express";
import handleContacts from "../controllers/contactController";


export default (router: Router) => {
    router.post('/identify', handleContacts)
};
