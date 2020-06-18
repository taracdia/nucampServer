const express = require("express");
const bodyParser = require("body-parser");
const Favorite = require("../models/favorite");
const authenticate = require("../authenticate");
const cors = require("./cors");

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route("/")
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorite.findById(req.user._id)
            .populate("user")
            .populate("campsites")
            .then(favorites => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorites);
            })
            .catch(err => next(err));
    })

    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Favorite.findById(req.user._id)
            .then(favorite => {
                if (favorite) {
                    req.body.forEach(campsiteId => {
                        if(!favorite.campsites.includes(campsiteId._id)){
                            favorite.campsites.push(campsiteId);
                        }
                    });
                    
                    favorite.save()
                        .then(fave => {
                            res.statusCode = 200;
                            res.setHeader("Content-Type", "application/json");
                            res.json(fave);
                        })
                        .catch(err => next(err));
                } else {
                    Favorite.create({
                        "user": req.user._id,
                        "campsites": req.body,
                        _id: req.user._id
                    })
                        .then(favorite => {
                            console.log("favorite created ", favorite);
                            res.statusCode = 200;
                            res.setHeader("Content-Type", "application/json");
                            res.json(favorite);
                        })
                        .catch(err => next(err));
                }
            })
            .catch(err => next(err));
    })

    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.statusCode = 403;
        res.end("PUT operation not supported on /favorites")
    })

    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Favorite.findByIdAndDelete(req.user._id)
            .then(response => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(response);
            })
            .catch(err => next(err));
    });

favoriteRouter.route("/:campsiteId")
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end("PUT operation not supported on /favorites")
    })

    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findById(req.user._id)
        .then(favorite => {
            const campsiteId = req.params.campsiteId;
            if (favorite && !favorite.campsites.includes(campsiteId)) {
                favorite.campsites.push(campsiteId);
                
                favorite.save()
                    .then(fave => {
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json(fave);
                    })
                    .catch(err => next(err));
            } else if (!favorite) {
                Favorite.create({
                    "user": req.user._id,
                    "campsites": campsiteId,
                    _id: req.user._id
                })
                    .then(favorite => {
                        console.log("favorite created ", favorite);
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json(favorite);
                    })
                    .catch(err => next(err));
            } else {
                err = new Error("That campsite is already in the list of favorites!");
                err.statusCode = 403;
                return next(err);
            }
        })
        .catch(err => next(err));
    })

    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;

        res.end(`Put operation not supported on /favorites/${req.params.campsiteId}`)
    })


    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Favorite.findById(req.user._id)
            .then(favorite => {
                if (favorite && favorite.campsites.includes(req.params.campsiteId)) {
                    favorite.campsites.splice(favorite.campsites.indexOf(req.params.campsiteId), 1);
                    favorite.save()
                        .then(fave => {
                            res.statusCode = 200;
                            res.setHeader("Content-Type", "application/json");
                            res.json(fave);
                        })
                        .catch(err => next(err));

                } else if (!favorite) {
                    err = new Error(`no faves found`);
                    err.statusCode = 404;
                    return next(err);
                } else {
                    err = new Error(`campsite ${req.params.campsiteId} not found`);
                    err.statusCode = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    });

module.exports = favoriteRouter;