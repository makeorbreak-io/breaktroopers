"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
require('dotenv').config();
var Statistics = require('./statistics');
// Initialize using verification token from environment variables
var createSlackEventAdapter = require('@slack/events-api').createSlackEventAdapter;
var slackEvents = createSlackEventAdapter(process.env.SLACK_VERIFICATION_TOKEN);
var mentionRegex = /.*?<@.*?>.*?/i;
var port = process.env.PORT || 3000;
var message = require('./message');
// Initialize an Express application
//const express = require('express');
var bodyParser = require('body-parser');
var _a = require('./logic'), Game = _a.Game, GameState = _a.GameState;
var app = express_1.default();
// Map for games associated with channels
var channelToGame = {};
var stats = new Statistics();
// You must use a body parser for JSON before mounting the adapter
app.use(bodyParser.json());
// Default route for verification
app.post('/', function (req, res) {
    if (req.body.challenge) {
        res.send({ challenge: req.body.challenge });
    }
});
// Mount the event handler on a route
app.use('/slack/events', slackEvents.expressMiddleware());
// Handle event triggered on messages
slackEvents.on('message', function (event) {
    if (event.bot_id || event.subtype) {
        return;
    }
    if (event.text.match(mentionRegex)) {
        return;
    }
    console.log("Received a message event: user " + event.user + " in channel " + event.channel + " says " + event.text);
    console.log('%o', event);
    message.sendMessage(event.channel, "You sent: " + event.text);
});
// Handle event triggered on @Bot_name
slackEvents.on('app_mention', function (event) {
    var text = event.text.toLowerCase();
    if (text.includes('qual')) {
        message.sendMessage(event.channel, 'o preço desta montra final é!!!!!!');
    }
    if (text.includes('alheira')) {
        message.sendMessage(event.channel, "Uma alheira?!? Bambora <@" + event.user + ">");
    }
    if (text.includes('espetáculo')) {
        if (channelToGame[event.channel]) {
            if (channelToGame[event.channel].getState() !== GameState.FINISHED) {
                message.sendMessage(event.channel, 'A game is already in progress');
                return;
            }
        }
        // start game
        channelToGame[event.channel] = new Game(event.channel, onGameFinished, stats);
    }
});
// Handle errors (see `errorCodes` export)
slackEvents.on('error', console.error);
app.listen(port, function () {
    console.log("App listening on port " + port + "!");
});
var onGameFinished = function (channelID, status, winner, price) {
    if (winner) {
        message.sendMessage(channelID, "The price is " + price + "! Congrulations <@" + winner + ">! You won!");
    }
    else {
        message.sendMessage(channelID, "The price is " + price + ", nobody won :(.");
    }
};
