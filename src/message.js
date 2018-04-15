require('dotenv').config()

const {WebClient} =
  process.env.NODE_ENV === 'test'
    ? require('./mock-slack-client')
    : require('@slack/client')

let web = new WebClient()

const sendMessage = function (channel, text) {
  web.chat.postMessage({
    channel: channel,
    text: text
  })
}

const sendProduct = function (channel, product, gameTimeout) {
  const message = {
    token: process.env.SLACK_BOT_TOKEN,
    channel: channel,
    text: `Qual o preço deste magnífico produto?\nA ronda de palpites dura ${formatTime(gameTimeout)}.`,
    attachments: [{
      title: product.name,
      image_url: `https:${product.imageUrl}`
    }]
  }

  web.chat.postMessage(message)
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
  web.oauth.access({
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    code: code
  }).then((res) => {
    process.env.SLACK_BOT_TOKEN = res.bot.bot_access_token
    web = new WebClient(res.bot.bot_access_token)
    console.log(res)
    console.log(res.access_token)
  })
}

const notify = function (channelId, timeLeft) {
  const message = `Faltam ${formatTime(timeLeft)} para o final da ronda de palpites!`

  sendMessage(channelId, message)
}

const formatTime = function (time) {
  const hours = Math.trunc(time / (1000 * 60 * 60))
  time = time % (1000 * 60 * 60)
  const minutes = Math.trunc(time / (1000 * 60))
  time = time % (1000 * 60)
  const seconds = Math.trunc(time / 1000)

  let result = ''

  if (hours) {
    result += `${hours}h`
  }

  if (minutes) {
    result += ` ${minutes}m`
  }

  if (seconds) {
    result += ` ${seconds}s`
  }

  return result.trim()
}

// Send initial Hello World message
sendMessage('CA69HJNN5', 'Hello World!')

module.exports = {
  sendMessage,
  sendProduct,
  sendEphemeral,
  oauthAccess,
  notify,
  formatTime
}
