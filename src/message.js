require('dotenv').config()

const randomProduct = require('./randomproduct')
const { WebClient } = require('@slack/client')
const web = new WebClient(process.env.SLACK_BOT_TOKEN)

const sendMessage = function (channel, text) {
  web.chat.postMessage({
    channel: channel,
    text: text
  })
}

const sendProduct = function (channel, product) {
  web.chat.postMessage({
    channel: channel,
    text: 'Qual o preço deste produto?',
    attachments: [{
      title: product.title,
      image_url: product.imageUrl,
      text: product.description
    }]
  })
}

// Send initial Hello World message
// sendMessage('CA69HJNN5', 'Hello World!')
// sendProduct('CA69HJNN5', randomProduct.mockProduct)

module.exports = {
  sendMessage,
  sendProduct
}
