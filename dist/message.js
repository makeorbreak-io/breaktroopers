"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
var client_1 = require("@slack/client");
var web = new client_1.WebClient(process.env.SLACK_BOT_TOKEN);
var sendMessage = function (channel, text) {
    web.chat.postMessage({
        channel: channel,
        text: text
    });
};
exports.sendMessage = sendMessage;
var sendProduct = function (channel, product) {
    web.chat.postMessage({
        channel: channel,
        text: 'Qual o preço deste produto?',
        attachments: [{
                title: product.title,
                image_url: product.imageUrl,
                text: product.description
            }]
    });
};
exports.sendProduct = sendProduct;
