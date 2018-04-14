const getRandomProduct = require('./randomproduct')

const MAX_PLAYERS = 4
const GAME_TIMEOUT = 60 * 1000 // in ms

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
    this.onGameFinished = onGameFinished
    this.answers = {}
    this.state = GameState.STARTED
    this.product = getRandomProduct()

    setTimeout(this.finish, GAME_TIMEOUT)
  }

  numAnswers () {
    return Object.keys(this.answers).length
  }

  answer (userId, price) {
    // If the price is unique, then consider the answer. Otherwise, discard it.
    if (this.answers.filter(answer => answer.price === price).length === 0) {
      this.answers[userId] = {
        price,
        userId
      }
    }

    if (this.numAnswers() > MAX_PLAYERS) {
      this.finish()
    }
  }

  getProduct () {
    return this.product
  }

  getState () {
    return this.state
  }

  finish () {
    if (this.state === GameState.FINISHED) {
      return
    }

    if (this.numAnswers() < 2) {
      this.onGameFinished(this.channelId, GameFinishStatus.NOT_ENOUGH_PLAYERS, this.winner, this.product.price)
      return
    }

    let answersBelowPrice = this.answers.filter(answer => answer.price < this.product.price)
    let noAnswer = {price: 0}

    let bestAnswer = answersBelowPrice.entries().reduce((prev, curr) => prev.price > curr.price ? prev : curr, noAnswer)

    let gameFinishStatus = GameFinishStatus.WINNER

    if (bestAnswer !== noAnswer) {
      this.winner = bestAnswer.userId
      gameFinishStatus = GameFinishStatus.DRAW
    }

    this.state = GameState.FINISHED

    this.onGameFinished(this.channelId, gameFinishStatus, this.winner, this.product.price)
  }

  getWinner () {
    return this.winner
  }
}

module.exports = {
  Game,
  GameState
}
