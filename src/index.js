require('dotenv').config()

// Initialize using verification token from environment variables
const createSlackEventAdapter = require('@slack/events-api').createSlackEventAdapter
const slackEvents = createSlackEventAdapter(process.env.SLACK_VERIFICATION_TOKEN)
const mentionRegex = /.*?<@.*?>.*?/i
const port = process.env.PORT || 3000
const message = require('./message')

// Initialize an Express application
const express = require('express')
const bodyParser = require('body-parser')
const {Game, GameState} = require('./logic')

const app = express()

// Map for games associated with channels
const channelToGame = {}

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

  console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`)
  console.log('%o', event)
  message.sendMessage(event.channel, `You sent: ${event.text}`)
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

  if (text.includes('espetáculo')) {
    if (channelToGame[event.channel]) {
      if (channelToGame[event.channel].getState() !== GameState.FINISHED) {
        message.sendMessage(event.channel, 'A game is already in progress')
        return
      }
    }

    // start game
    channelToGame[event.channel] = new Game(event.channel, onGameFinished)
  }
})

// Handle errors (see `errorCodes` export)
slackEvents.on('error', console.error)

app.listen(port, () => {
  console.log(`App listening on port ${port}!`)
})

const onGameFinished = function (channelID, status, winner, price) {
  if (winner) {
    message.sendMessage(channelID, `The price is ${price}! Congrulations <@${winner}>! You won!`)
  } else {
    message.sendMessage(channelID, `The price is ${price}, nobody won :(.`)
  }
}
