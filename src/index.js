require('dotenv').config()

const Workspace = require('./workspace')
const Messenger = require('./messenger')
const bodyParser = require('body-parser')
const {GameFinishStatus} = require('./game')
const {createSlackEventAdapter} = require('@slack/events-api')
const express = require('express')

// Initialize using verification token from environment variables
const slackEvents = createSlackEventAdapter(process.env.SLACK_VERIFICATION_TOKEN)
const port = process.env.PORT || 3000

const mentionRegex = /.*?<@.*?>.*?/i
const helpRegex = /help|h|ajuda/i
const espetaculoRegex = /espetáculo|espetaculo|esbedáculo|esbedaculo/i
const HELP_STRING = 'Bem vindo ao *\'O SLACK CERTO\'*!! \n > Para jogar com o mítico Mernando Fendes adiciona o bot a um canal público e menciona-o utilizando o simbolo \'@\' seguido da mensagem \'esbetáculo\' \n > O Mernando Fendes vai mostrar um producto ao qual os participantes devem-se juntar enviando apenas uma mensagem no canal com o valor que acham que o producto vale. \n > Ganha aquele que ficar mais perto do valor *sem o ultrapassar*. _Espetáááááculo_! \n > As _triggers words_ disponíveis são: espetáculo, qual, alheira, stats.'

/**
 * Map with workspace IDs as keys and the Workspace class as value
 */
const workspaces = {}

const app = express()

// You must use a body parser for JSON before mounting the adapter
app.use(bodyParser.json())

// Default route for verification
app.post('/', (req, res) => {
  if (req.body.challenge) {
    res.send({challenge: req.body.challenge})
  }
})

app.get('/oauth/', async (req, res) => {
  if (req.query.code) {
    try {
      const result = await Messenger.oauthAccess(req.query.code)
      const webClient = result.webClient
      const workspaceId = result.workspaceId

      getOrCreateWorkspace(workspaceId).setWebClient(webClient)

      res.send('Ok')
    } catch (e) {
      console.error(e)
      res.status(500).send('Error')
    }
  }
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

  const workspace = getOrCreateWorkspace(event.teamId)

  workspace.handleMessage(event)
})

// Handle event triggered on @Bot_name
slackEvents.on('app_mention', (event) => {
  const workspace = getOrCreateWorkspace(event.teamId)
  let text = event.text.toLowerCase()

  if (text.includes('qual')) {
    workspace.sendMessage(event.channel, 'o preço desta montra final é!!!!!!')
  }

  if (text.includes('alheira')) {
    workspace.sendMessage(event.channel, `Esbedáculooooo <@${event.user}>`)
  }

  if (text.includes('stats')) {
    handleStats(event)
  }

  if (text.match(helpRegex)) {
    workspace.sendMessage(event.channel, HELP_STRING)
  }

  if (text.match(espetaculoRegex)) {
    const error = workspace.startGame(event, onGameFinished)

    if (error) {
      workspace.sendMessage(event.channel, 'Já está um jogo a decorrer.')
    }
  }
})

// Handle errors (see `errorCodes` export)
slackEvents.on('error', console.error)

app.listen(port, () => {
  console.log(`App listening on port ${port}!`)
})

function getOrCreateWorkspace (workspaceId) {
  if (!workspaces.hasOwnProperty(workspaceId)) {
    workspaces[workspaceId] = new Workspace(workspaceId)
  }

  return workspaces[workspaceId]
}

const onGameFinished = function (game) {
  const playAgainMessage = '\nPara jogar novamente, mencione o bot utilizando o simbolo \'@\' seguido da mensagem \'espetáculo\' '

  const channelId = game.getChannelId()
  const status = game.getFinishStatus()
  const winner = game.getWinner()
  const price = game.getProduct().price
  const teamId = game.getTeamId()

  const workspace = getOrCreateWorkspace(teamId)

  workspace.addGameToStatistics()

  switch (status) {
    case GameFinishStatus.WINNER:
      workspace.sendMessage(channelId, `E o preço deste produto éééé: ${price.toFixed(2)}€! Parabéns <@${winner}>! Ganhaste!${playAgainMessage}`)
      break
    case GameFinishStatus.DRAW:
      workspace.sendMessage(channelId, `O preço deste produto é: ${price.toFixed(2)}€, ninguem ganhou :sob:.${playAgainMessage}`)
      break
    case GameFinishStatus.NOT_ENOUGH_PLAYERS:
      workspace.sendMessage(channelId, `O jogo acabou sem jogadores suficientes.${playAgainMessage}`)
      break
  }
}

const handleStats = function (teamId, event) {
  const workspace = getOrCreateWorkspace(teamId)
  const userStats = workspace.getUserStats(event.user)

  const min = (userStats.minimumOffset === Number.POSITIVE_INFINITY) ? 'N/A' : userStats.minimumOffset

  workspace.sendEphemeral(
    event.channel,
    event.user,
    `<@${event.user}>:\n > Jogos Ganhos: ${userStats.gamesWon}\n > Jogos Totais: ${userStats.gamesPlayed}\n > Preço Certo: ${userStats.exactPriceMatches}\n > Diferença Mínima: ${min}`)
}
