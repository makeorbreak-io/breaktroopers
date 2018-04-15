require('dotenv').config()

const {WebClient} = require('@slack/client')
const web = new WebClient(process.env.SLACK_BOT_TOKEN)

const sendMessage = function (channel, text) {
  web.chat.postMessage({
    channel: channel,
    text: text
  })
}

const sendProduct = function (channel, product) {
  const message = {
    channel: channel,
    text: 'Qual o preço deste magnífico produto?',
    attachments: [{
      title: product.name,
      image_url: `https:${product.imageUrl}`
    }]
  }

  if (process.env.NODE_ENV !== 'test') {
    web.chat.postMessage(message)
  }
}

// Send initial Hello World message
if (process.env.NODE_ENV !== 'test') {
  sendMessage('CA69HJNN5', 'Hello World!')
}

module.exports = {
  sendMessage,
  sendProduct
}
