const express = require("express");
const bodyParser = require("body-parser");
const Partner = require("../models/partner");
const authenticate = require("../authenticate");
const cors = require("./cors");

const partnerRouter = express.Router();

partnerRouter.use(bodyParser.json());

partnerRouter.route("/")
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Partner.find()
    .then(partners => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(partners)
    })
    .catch(err => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Partner.create(req.body)
    .then(partner => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(partner)
    })
    .catch(err => next(err));
})

.put(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /partners")
})

.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Partner.deleteMany()
    .then(response => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(response)
    })
    .catch(err => next(err));
});

partnerRouter.route("/:partnerId")
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Partner.findById(req.params.partnerId)
    .then(partner => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(partner)
    })
    .catch(err => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;

    res.end(`Post operation not supported on /partners/${req.params.partnerId}`)
})

.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Partner.findByIdAndUpdate(req.params.partnerId, {
        $set: req.body
    }, {
        new: true
    })
    .then(partner => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(partner)
    })
    .catch(err => next(err));
})

.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Partner.findByIdAndDelete(req.params.id)
    .then(response => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(response)
    })
    .catch(err => next(err));
});

module.exports = partnerRouter;