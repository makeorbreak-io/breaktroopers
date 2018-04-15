require('dotenv').config()
const Statistics = require('./statistics')

// Initialize using verification token from environment variables
const createSlackEventAdapter = require('@slack/events-api').createSlackEventAdapter
const slackEvents = createSlackEventAdapter(process.env.SLACK_VERIFICATION_TOKEN)
const mentionRegex = /.*?<@.*?>.*?/i
const helpRegex = /help|h|ajuda/i
const espetaculoRegex = /espetáculo|espetaculo|esbedáculo|esbedaculo/i
const HELP_STRING = "Bem vindo ao *'O SLACK CERTO'*!! \n > Para jogar com o mítico Mernando Fendes mencione o bot utilizando o simbolo '@' seguido da mensagem 'espetáculo' \n > O Mernando Fendes irá mostrar um producto ao qual os participantes devem-se juntar enviando apenas uma mensagem no channel com o valor que acham que o producto vale. \n > Ganha aquele que ficar mais perto do valor *sem o ultrapassar*. Espetáááááculo! \n > As _triggers words_ disponíveis são: espetáculo, qual, alheira."
const port = process.env.PORT || 3000
const message = require('./message')

// Initialize an Express application
const express = require('express')
const bodyParser = require('body-parser')
const {Game, GameState, GameFinishStatus} = require('./logic')

const app = express()

// Map for games associated with channels
const channelToGame = {}

const stats = new Statistics()

// You must use a body parser for JSON before mounting the adapter
app.use(bodyParser.json())

// Default route for verification
app.post('/', (req, res) => {
  if (req.body.challenge) {
    res.send({challenge: req.body.challenge})
  }
})

// Mount the event handler on a route
app.use('/slack/events', slackEvents.expressMiddleware())

// Handle event triggered on messages
slackEvents.on('message', (event) => {
  if (event.bot_id || event.subtype) {
    return
  }

  if (event.text.match(mentionRegex)) {
    return
  }

  // Passing message to the Game object
  if (channelToGame[event.channel]) {
    channelToGame[event.channel].handleMessage(event.user, event.text)
  }

  // console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`)
  // console.log('%o', event)
  // message.sendMessage(event.channel, `You sent: ${event.text}`)
})

// Handle event triggered on @Bot_name
slackEvents.on('app_mention', (event) => {
  let text = event.text.toLowerCase()

  if (text.includes('qual')) {
    message.sendMessage(event.channel, 'o preço desta montra final é!!!!!!')
  }

  if (text.includes('alheira')) {
    message.sendMessage(event.channel, `Uma alheira?! Eheheheh <@${event.user}>`)
  }

  if (text.match(helpRegex)) {
    message.sendMessage(event.channel, HELP_STRING)
  }

  if (text.match(espetaculoRegex)) {
    if (channelToGame[event.channel]) {
      if (channelToGame[event.channel].getState() !== GameState.FINISHED) {
        message.sendMessage(event.channel, 'Já está um jogo a decorrer.')
        return
      }
    }
    // start game
    channelToGame[event.channel] = new Game(event.channel, onGameFinished, stats)
  }
})

// Handle errors (see `errorCodes` export)
slackEvents.on('error', console.error)

app.listen(port, () => {
  console.log(`App listening on port ${port}!`)
})

const onGameFinished = function (channelID, status, winner, price) {
  switch (status) {
    case GameFinishStatus.WINNER:
      message.sendMessage(channelID, `E o preço deste produto éééé: ${price.toFixed(2)}! Parabéns <@${winner}>! Ganhaste! Até a Lenka ficou entusiasmada!`)
      break
    case GameFinishStatus.DRAW:
      message.sendMessage(channelID, `O preço deste produto é: ${price.toFixed(2)}, nobody won :sob:.`)
      break
    case GameFinishStatus.NOT_ENOUGH_PLAYERS:
      message.sendMessage(channelID, 'O jogo acabou sem jogadores suficientes.')
      break
  }
}
