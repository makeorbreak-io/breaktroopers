const getRandomProduct = require('./randomproduct')
const {sendMessage, sendProduct, sendEphemeral, notify} = require('./message')

const MAX_PLAYERS = 3
const NOTIFICATION_TIMEOUTS =
  process.env.NODE_ENV === 'test'
    ? []
    : [45 * 1000, 30 * 1000, 15 * 1000, 10 * 1000, 5 * 1000]

const GAME_TIMEOUT = // in ms
  process.env.NODE_ENV === 'test'
    ? 1000
    : 60 * 1000

const GameState = Object.freeze({
  STARTED: 0,
  FINISHED: 1
})

const GameFinishStatus = Object.freeze({
  WINNER: 0,
  DRAW: 1,
  NOT_ENOUGH_PLAYERS: 2
})

class Game {
  constructor (channelId, onGameFinished) {
    this.channelId = channelId
    this.answers = {}
    this.state = GameState.STARTED
    this.gameFinishStatus = GameFinishStatus.NOT_ENOUGH_PLAYERS

    this.onGameFinished = onGameFinished || function () {
    }
  }

  async start () {
    this.product = await getRandomProduct()
    sendProduct(this.channelId, this.product, GAME_TIMEOUT)

    this.timeOut = setTimeout(this.finish.bind(this), GAME_TIMEOUT)

    for (let timeout of NOTIFICATION_TIMEOUTS) {
      setTimeout(notify.bind(this, this.channelId, timeout), GAME_TIMEOUT - timeout)
    }
  }

  answer (userId, price) {
    // If the price is unique, then consider the answer. Otherwise, discard it.
    if (this.answers[userId]) {
      return
    }

    if (Object.values(this.answers).filter(p => p === price).length === 0) {
      this.answers[userId] = price
    }

    if (Object.keys(this.answers).length >= MAX_PLAYERS) {
      this.finish()
    }
  }

  handleMessage (userId, message) {
    if (this.state === GameState.FINISHED) {
      sendMessage(this.channelId, userId, 'O jogo já acabou! Para começar um novo, mencione o bot utilizando o simbolo \'@\' seguido da mensagem \'espetáculo\'')
      return
    }

    const value = parseFloat(message.replace(',', '.'))

    if (value && value > 0) {
      this.answer(userId, value)
      sendEphemeral(this.channelId, userId, `O seu palpite de ${value.toFixed(2)}€ foi registado. Espere até ao final da ronda pelos resultados!`)
    } else {
      sendEphemeral(this.channelId, userId, 'Enviou um palpite errado. Os palpites devem ser números decimais. Ex.: \'1\', \'5.7\', \'1,3\'')
    }
  }

  finish () {
    clearTimeout(this.timeOut)

    if (this.state === GameState.FINISHED) {
      return
    }

    this.state = GameState.FINISHED

    if (Object.keys(this.answers).length < 2) {
      this.onGameFinished(this)
      return
    }

    let answersBelowPrice = Object.entries(this.answers).filter(p => p[1] < this.product.price)
    let noAnswer = [null, 0]

    let bestAnswer = Object.entries(answersBelowPrice).reduce((prev, curr) => curr[1][1] > prev[1] ? curr[1] : prev, noAnswer)

    this.gameFinishStatus = GameFinishStatus.DRAW

    if (bestAnswer !== noAnswer) {
      this.winner = bestAnswer[0]
      this.gameFinishStatus = GameFinishStatus.WINNER
    }

    this.onGameFinished(this)
  }

  getChannelId () {
    return this.channelId
  }

  getWinner () {
    return this.winner
  }

  getAnswers () {
    return this.answers
  }

  getProduct () {
    return this.product
  }

  getState () {
    return this.state
  }

  getFinishStatus () {
    return this.gameFinishStatus
  }
}

module.exports = {
  Game,
  GameState,
  GameFinishStatus,
  GAME_TIMEOUT
}
