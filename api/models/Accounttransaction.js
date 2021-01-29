const { DataTypes } = require('sequelize');


module.exports = (sequelize) => {

    const Accounttransaction = sequelize.define('accounttransaction', {

        cvu: {
            type: DataTypes.REAL,
            allowNull: false
        },
        number: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        type: {
            type: DataTypes.ENUM("sender", "receiver"),
            defaultValue: "sender",
            allowNull: false
        }
    })
};