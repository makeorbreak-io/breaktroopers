require('dotenv').config()

const {WebClient} =
  process.env.NODE_ENV === 'test'
    ? require('./mock-slack-client')
    : require('@slack/client')

let webClients = {}

const sendMessage = function (teamId, channel, text) {
  webClients[teamId].chat.postMessage({
    channel: channel,
    text: text
  })
}

const sendProduct = function (teamId, channel, product, gameTimeout) {
  const message = {
    token: process.env.SLACK_BOT_TOKEN,
    channel: channel,
    text: `Qual o preço deste magnífico produto?\nA ronda de palpites dura ${formatTime(gameTimeout)}.`,
    attachments: [{
      title: product.name,
      image_url: `https:${product.imageUrl}`
    }]
  }

  webClients[teamId].chat.postMessage(message)
}

const sendEphemeral = function (teamId, channel, user, text) {
  webClients[teamId].chat.postEphemeral({
    token: process.env.SLACK_BOT_TOKEN,
    channel: channel,
    user: user,
    text: text
  })
}

const oauthAccess = function (code) {
  new WebClient().oauth.access({
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    code: code
  }).then((res) => {
    const botAccessToken = res.bot.bot_access_token
    const teamId = res.team_id

    webClients[teamId] = new WebClient(botAccessToken)
    console.log('Created webclient')

    process.env.SLACK_BOT_TOKEN = botAccessToken
  })
}

const notify = function (teamId, channelId, timeLeft) {
  const message = `Faltam ${formatTime(timeLeft)} para o final da ronda de palpites!`

  sendMessage(teamId, channelId, message)
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

module.exports = {
  sendMessage,
  sendProduct,
  sendEphemeral,
  oauthAccess,
  notify,
  formatTime
}
