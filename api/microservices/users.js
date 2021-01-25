const express = require("express");

const bodyParser = require("body-parser");

const { User } = require("../db");

const server = express();

const morgan = require("morgan");

const jwt = require("jsonwebtoken");

const { Op } = require("sequelize");



server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

server.use(morgan("dev"));

//Create Users

server.post("/users", (req, res, next) => {
  User.create(req.body)

    .then((users) => {
      res.status(201).send(users);
    })
    .catch((err) => {
      res.status(404).send(err);
    });
});

//Get all Users

server.get("/users", (req, res) => {
  User.findAll()

    .then((users) => {
      return res.send(users);
    })
    .catch((err) => {
      res.status(404).send(err);
    });
});

//Get One Users

server.get("/users/:dni_email", (req, res) => {
  User.findOne({
    where: {
      [Op.or]: [{ dni: req.params.dni_email }, { email: req.params.dni_email }],
    },
  })

    .then((sizes) => {
      if (!sizes) {
        return res.sendStatus(404);
      }

      return res.send(sizes);
    })

    .catch((err) => {
      res.status(404).send(err);
    });
});

server.get("/users/auth/login", (req, res) => {
  res.sendStatus(200);
});

server.listen(8000, () => {
  console.log("Users microservice running on 8000");
});

module.exports = server;
