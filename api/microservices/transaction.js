const express = require("express");

const bodyParser = require("body-parser");

const {User, Account, Transaction, Accounttransaction } = require("../db");

const server = express();

const morgan = require("morgan");

const { Op } = require("sequelize");

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

server.use(morgan("dev"));


// Create Transaction

server.post("/transaction", (req,res,next) => {

	(async function (){

		try {

            //Account sender
            const balance_sender = await  Account.findOne({
        
                where:{
                    cvu: req.body.cvu_sender
                }

            })

            //Account receiver
            const balance_receiver = await  Account.findOne({
        
                where:{
                    cvu: req.body.cvu_receiver
                }

            })

            //Create transaction
            const transaction = await Transaction.create(req.body);
             
            //Create table Accounttransaction
            const sender = await Accounttransaction.create({
                    
                cvu: req.body.cvu_sender,
                number: transaction.number,
    
            })
            
            const receiver = await Accounttransaction.create({

                cvu: req.body.cvu_receiver,
                number: transaction.number,
                type: "receiver"
    
            })

            //Balance check
            if (balance_sender.dataValues.balance >= req.body.amount){

                //Update balance sender
                const new_balance_sender = await Account.update(

                    {
                        balance: balance_sender.dataValues.balance - req.body.amount
                    },

                    {
                      where: { cvu: req.body.cvu_sender }
                    }
                )

                //Update balancer receiver
                const new_balance_receiver = await Account.update(

                    {
                        balance: parseFloat( req.body.amount ) + parseFloat( balance_receiver.dataValues.balance ) 
                    },

                    {
                        where: { cvu: req.body.cvu_receiver }
                    }
                )

                //Confirmed transaction
                const transactionConfirmed = await Transaction.update(

                    {
                        status: "confirmed" 
                    },

                    {
                        where: { number: transaction.number }
                    }
                )

                res.status(201).send({transaction, sender, receiver});
                
            }else{

            //Cancelled transaction
            const transactionFail = await Transaction.update(

                {
                    status: "cancelled" 
                },

                {
                    where: { number: transaction.number }
                }
            );

            (

                res.status(404).send("error fondos insuficientes")	
    
            ) }
            

		}
		catch (err){

			res.status(404).send(err)	 

		}
	})()
});



// Get specific Transaction for number

server.get("/transaction/:number", (req, res, next) => {

    Transaction.findOne({

        include: [Account],

        where:{
            number: req.params.number
        }
    })
    .then(transaction => res.send(transaction))
    .catch(err => { res.status(404).send(err) });

});

// Get all Transaction for account by cvu

server.get("/transaction/account/:cvu", (req, res, next) => {

    Transaction.findAll({

        include:[{
            
            model: Account,
            include: [User],
            where: { cvu: req.params.cvu }

        }],

    })
    .then(transaction => res.send(transaction))
    .catch(err => { res.status(404).send(err) });

});

// Get all Transaction for account by dni or email

server.get("/transaction/users/:dni_email", (req, res, next) => {

    Transaction.findAll({

        include:[{
            
            model: Account,
            include: [{
            
                model: User,
                where: {
                    [Op.or]: [{ dni: req.params.dni_email }, { email: req.params.dni_email }]
                }
    
            }],
           
        }],

    })
    .then(transaction => res.send(transaction))
    .catch(err => { res.status(404).send(err) });

});

// Get all Transaction status

server.get("/transaction/status/:status", (req, res, next) => {

    Transaction.findAll({

        include:[{
            
            model: Account,
            include: [User],
           
        }],

        where:{
            status: req.params.status
        }
        
    })
    .then(transaction => res.send(transaction))
    .catch(err => { res.status(404).send(err) });

});

server.listen(8001, () => {
    console.log("Transaction running on 8001");
});

module.exports = server;