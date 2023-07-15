'use strict';
import {
  Model
} from 'sequelize';

interface ContactAttributes {
  id: Number;
  phoneNumber: BigInt;
  email: string;
  linkedPrecedence: "primary" | "secondary";
  linkedId: Number;
  deletedAt: Date;
}

module.exports = (sequelize: any, DataTypes: any) => {
  class contact extends Model<ContactAttributes>
    implements ContactAttributes {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    id: Number;
    phoneNumber: BigInt;
    email: string;
    linkedPrecedence: "primary" | "secondary";
    linkedId: Number;
    deletedAt: Date;
    static associate(models: any) {
      // define association here
    }
  }
  contact.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    phoneNumber: {
      type: DataTypes.BIGINT,
    },
    email: {
      type: DataTypes.STRING,
    },
    linkedPrecedence: {
      type: DataTypes.STRING,
      allowNull: false
    },
    linkedId: {
      type: DataTypes.INTEGER,
      defaultValue: null,
    },
    deletedAt: {
      type: DataTypes.DATE,
      defaultValue: null
    }
  }, {
    sequelize,
    modelName: 'contact',
    freezeTableName: true
  });
  return contact;
};