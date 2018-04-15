const getRandomProduct = require('./randomproduct')
const message = require('./message')

const MAX_PLAYERS = 3
const GAME_TIMEOUT = 30 * 1000 // in ms

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
  constructor (channelId, onGameFinished, stats) {
    this.stats = stats
    this.channelId = channelId
    this.onGameFinished = onGameFinished
    this.answers = {}
    this.state = GameState.STARTED
    this.startGame()
  }

  async startGame () {
    this.product = await getRandomProduct()
    message.sendProduct(this.channelId, this.product)
    this.timeOut = setTimeout(this.finish.bind(this), GAME_TIMEOUT)
  }

  answer (userId, price) {
    // If the price is unique, then consider the answer. Otherwise, discard it.
    if (this.answers[userId]) { return }

    if (Object.values(this.answers).filter(p => p === price).length === 0) {
      this.answers[userId] = price
    }

    if (Object.keys(this.answers).length >= MAX_PLAYERS) {
      this.finish()
    }
  }

  getProduct () {
    return this.product
  }

  getState () {
    return this.state
  }

  handleMessage (userId, message) {
    if (this.state === GameState.FINISHED) {
      return
    }

    const value = parseFloat(message.replace(',', '.'))

    if (value && value > 0) {
      this.answer(userId, value)
    }
  }

  finish () {
    clearTimeout(this.timeOut)

    if (this.state === GameState.FINISHED) {
      return
    }

    this.state = GameState.FINISHED

    if (Object.keys(this.answers).length < 2) {
      this.onGameFinished(this.channelId, GameFinishStatus.NOT_ENOUGH_PLAYERS, this.winner, this.product.price)
      return
    }

    console.log(this.answers)
    let answersBelowPrice = Object.entries(this.answers).filter(p => p[1] < this.product.price)
    let noAnswer = [null, 0]

    let bestAnswer = Object.entries(answersBelowPrice).reduce((prev, curr) => curr[1][1] > prev[1] ? curr[1] : prev, noAnswer)

    let gameFinishStatus = GameFinishStatus.DRAW

    if (bestAnswer !== noAnswer) {
      this.winner = bestAnswer[0]
      gameFinishStatus = GameFinishStatus.WINNER
    }

    this.onGameFinished(this.channelId, gameFinishStatus, this.winner, this.product.price)
    this.stats.addGame(this)
  }

  getWinner () {
    return this.winner
  }

  getAnswers () {
    return this.answers
  }
}

module.exports = {
  Game,
  GameState,
  GameFinishStatus
}
