require('dotenv').config()
const Statistics = require('./statistics')

// Initialize using verification token from environment variables
const createSlackEventAdapter = require('@slack/events-api').createSlackEventAdapter
const slackEvents = createSlackEventAdapter(process.env.SLACK_VERIFICATION_TOKEN)
const mentionRegex = /.*?<@.*?>.*?/i
const helpRegex = /help|h|ajuda/i
const espetaculoRegex = /espetáculo|espetaculo|esbedáculo|esbedaculo/i
const HELP_STRING = 'Bem vindo ao *\'O SLACK CERTO\'*!! \n > Para jogar com o mítico Mernando Fendes adiciona o bot a um canal público e menciona-o utilizando o simbolo \'@\' seguido da mensagem \'esbetáculo\' \n > O Mernando Fendes vai mostrar um producto ao qual os participantes devem-se juntar enviando apenas uma mensagem no canal com o valor que acham que o producto vale. \n > Ganha aquele que ficar mais perto do valor *sem o ultrapassar*. _Espetáááááculo_! \n > As _triggers words_ disponíveis são: espetáculo, qual, alheira, stats.'
const port = process.env.PORT || 3000
const message = require('./message')

// Initialize an Express application
const express = require('express')
const bodyParser = require('body-parser')
const {Game, GameState, GameFinishStatus} = require('./game')

const app = express()

// Map for games associated with channels
const games = {}

const stats = {}

// You must use a body parser for JSON before mounting the adapter
app.use(bodyParser.json())

// Default route for verification
app.post('/', (req, res) => {
  if (req.body.challenge) {
    res.send({challenge: req.body.challenge})
  }
})

app.get('/oauth/', (req, res) => {
  if (req.query.code) {
    message.oauthAccess(req.query.code)
  }
  res.send('Ok')
})

const addTeamId = (req) => {
  req.body.event.teamId = req.body.team_id
}

// Mount the event handler on a route
app.use('/slack/events', addTeamId, slackEvents.expressMiddleware())

// Handle event triggered on messages
slackEvents.on('message', (event) => {
  if (event.bot_id || event.subtype) {
    return
  }

  if (event.text.match(mentionRegex)) {
    return
  }

  if (!games[event.teamId]) {
    games[event.teamId] = {}
  }

  // Passing message to the Game object
  if (games[event.teamId][event.channel]) {
    games[event.teamId][event.channel].handleMessage(event.user, event.text)
  }
})

// Handle event triggered on @Bot_name
slackEvents.on('app_mention', (event) => {
  let text = event.text.toLowerCase()

  if (text.includes('qual')) {
    message.sendMessage(event.teamId, event.channel, 'o preço desta montra final é!!!!!!')
  }

  if (text.includes('alheira')) {
    message.sendMessage(event.teamId, event.channel, `Esbedáculooooo <@${event.user}>`)
  }

  if (text.includes('stats')) {
    handleStats(event)
  }

  if (text.match(helpRegex)) {
    message.sendMessage(event.teamId, event.channel, HELP_STRING)
  }

  if (!games[event.teamId]) {
    games[event.teamId] = {}
  }

  if (text.match(espetaculoRegex)) {
    if (games[event.teamId][event.channel]) {
      if (games[event.teamId][event.channel].getState() !== GameState.FINISHED) {
        message.sendMessage(event.teamId, event.channel, 'Já está um jogo a decorrer.')
        return
      }
    }
    // start game
    const game = new Game(event.teamId, event.channel, onGameFinished)
    games[event.teamId][event.channel] = game
    game.start()
  }
})

// Handle errors (see `errorCodes` export)
slackEvents.on('error', console.error)

app.listen(port, () => {
  console.log(`App listening on port ${port}!`)
})

const onGameFinished = function (game) {
  const playAgainMessage = '\nPara jogar novamente, mencione o bot utilizando o simbolo \'@\' seguido da mensagem \'espetáculo\' '

  const channelId = game.getChannelId()
  const status = game.getFinishStatus()
  const winner = game.getWinner()
  const price = game.getProduct().price
  const teamId = game.getTeamId()

  if (!stats[teamId]) {
    stats[teamId] = new Statistics()
  }

  stats[teamId].addGame(game)

  switch (status) {
    case GameFinishStatus.WINNER:
      message.sendMessage(teamId, channelId, `E o preço deste produto éééé: ${price.toFixed(2)}€! Parabéns <@${winner}>! Ganhaste!${playAgainMessage}`)
      break
    case GameFinishStatus.DRAW:
      message.sendMessage(teamId, channelId, `O preço deste produto é: ${price.toFixed(2)}€, ninguem ganhou :sob:.${playAgainMessage}`)
      break
    case GameFinishStatus.NOT_ENOUGH_PLAYERS:
      message.sendMessage(teamId, channelId, `O jogo acabou sem jogadores suficientes.${playAgainMessage}`)
      break
  }
}

const handleStats = function (teamId, event) {
  if (stats[teamId]) {
    const userStats = stats[teamId].getUserStats(event.user)

    if (userStats) {
      const min = (userStats.minimumOffset === Number.POSITIVE_INFINITY) ? 'N/A' : userStats.minimumOffset
      message.sendEphemeral(teamId, event.channel, event.user, `<@${event.user}>:\n > Jogos Ganhos: ${userStats.gamesWon}\n > Jogos Totais: ${userStats.gamesPlayed}\n > Preço Certo: ${userStats.exactPriceMatches}\n > Diferença Minima: ${min}`)
    } else {
      message.sendEphemeral(teamId, event.channel, event.user, `<@${event.user}> ainda não tens estatisticas.`)
    }
  } else {
    message.sendEphemeral(teamId, event.channel, event.user, `<@${event.user}> ainda não tens estatisticas.`)
  }
}
