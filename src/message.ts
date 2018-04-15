require('dotenv').config()

import {WebClient} from '@slack/client';

const web = new WebClient(process.env.SLACK_BOT_TOKEN);

const sendMessage = function (channel: string, text: string) {
    web.chat.postMessage({
        channel: channel,
        text: text
    })
};

const sendProduct = function (channel: string, product: any) {
    web.chat.postMessage({
        channel: channel,
        text: 'Qual o preço deste produto?',
        attachments: [{
            title: product.title,
            image_url: product.imageUrl,
            text: product.description
        }]
    })
};

export {sendMessage}
