require('dotenv').config()
const Statistics = require('./statistics')

// Initialize using verification token from environment variables
const createSlackEventAdapter = require('@slack/events-api').createSlackEventAdapter
const slackEvents = createSlackEventAdapter(process.env.SLACK_VERIFICATION_TOKEN)
const mentionRegex = /.*?<@.*?>.*?/i
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
    message.sendMessage(event.channel, `Uma alheira?!? Bambora <@${event.user}>`)
  }

  if (text.includes('help')) {
    message.sendMessage(event.channel, 'Bem vindo ao slack certo \n Para jogar com o grande Mernando Fendes mencione o bot seguido da mensagem \'espetáculo\' \n O Mernando Fendes irá mostrar um producto ao qual os participantes devem-se juntar enviando apenas uma mensagem no channel com o valor que acham que o producto vale \n Quando todos os participantes do channel tiverem enviado o seu palpite ou passado o tempo de máximo, o vencedor é anunciado. Espetáááááculo!')
  }

  if (text.includes('espetáculo')) {
    if (channelToGame[event.channel]) {
      if (channelToGame[event.channel].getState() !== GameState.FINISHED) {
        message.sendMessage(event.channel, 'A game is already in progress')
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
      message.sendMessage(channelID, `The price is ${price.toFixed(2)}€! Congrulations <@${winner}>! You won!`)
      break
    case GameFinishStatus.DRAW:
      message.sendMessage(channelID, `The price is ${price.toFixed(2)}€, nobody won :(.`)
      break
    case GameFinishStatus.NOT_ENOUGH_PLAYERS:
      message.sendMessage(channelID, 'Game ended! Not enough players')
      break
  }
}
