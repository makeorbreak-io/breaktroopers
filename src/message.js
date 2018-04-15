require('dotenv').config()

const {WebClient} = require('@slack/client')
const web = new WebClient()

const sendMessage = function (channel, text) {
  web.chat.postMessage({
    channel: channel,
    text: text
  })
}

const sendProduct = function (channel, product) {
  const message = {
    token: process.env.SLACK_BOT_TOKEN,
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

const sendEphemeral = function (channel, user, text) {
  web.chat.postEphemeral({
    token: process.env.SLACK_BOT_TOKEN,
    channel: channel,
    user: user,
    text: text
  })
}

const oauthAccess = function (code) {
  web.oauth.access({client_id: process.env.CLIENT_ID, client_secret: process.env.CLIENT_SECRET, code: code}).then((res) => { 
    process.env.SLACK_BOT_TOKEN = res.bot.bot_access_token
    console.log(res)
    console.log(res.access_token)
  })
}

// Send initial Hello World message
if (process.env.NODE_ENV !== 'test') {
  sendMessage('CA69HJNN5', 'Hello World!')
}

module.exports = {
  sendMessage,
  sendProduct,
  sendEphemeral,
  oauthAccess
}
