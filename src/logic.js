const getRandomProduct = require('./randomproduct')

const MAX_PLAYERS = 4

const State = Object.freeze({
  STARTED: 0,
  FINISHED: 1
})

class Game {
  Game (channelId, onGameFinished) {
    this.channelId = channelId
    this.onGameFinished = onGameFinished
    this.answers = {}
    this.state = State.STARTED
    this.product = getRandomProduct()
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

    let answersBelowPrice = this.answers.filter(answer => answer.price < this.product.price)
    let noAnswer = {price: 0}

    let bestAnswer = answersBelowPrice.entries().reduce((prev, curr) => prev.price > curr.price ? prev : curr, noAnswer)

    if (bestAnswer !== noAnswer) {
      this.winner = bestAnswer.userId
    }

    this.state = State.FINISHED

    this.onGameFinished(this.channelId, this.winner)
  }

  getWinner () {
    return this.winner
  }
}

module.exports = {
  Game,
  State
}
