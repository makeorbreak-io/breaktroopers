const MAX_PLAYERS = 4

const State = Object.freeze({
  STARTED: 0,
  FINISHED: 1
})

class Game {
  gameFinished

  Game (channelId, gameFinished) {
    this.channelId = channelId
    this.gameFinished = gameFinished
    this.answers = {}
    this.players = {}
    this.product = Game.getRandomProduct()
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

  finish () {

    let answersBelowPrice = this.answers.filter(answer => answer.price < this.product.price)
    let noAnswer = {price: 0}

    let bestAnswer = answersBelowPrice.entries().reduce((prev, curr) => prev.price > curr.price ? prev : curr, noAnswer)

    if (bestAnswer !== noAnswer) {
      this.winner = bestAnswer.userId
    }

    this.state = State.FINISHED

    this.gameFinished(this.channelId, this.winner)
  }

  getWinner () {
    return this.winner
  }

  static getRandomProduct () {
    return {
      title: 'Low Profile Special Cotton Mesh Cap-Black W40S62B',
      imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/61WvsfC3EIL._UX522_.jpg',
      summary: '- Cotton\n- Black Low Profile Special Cotton Mesh Cap',
      description: 'Low profile unstructured Herringbone cotton twill/mesh cap with panels and eyelets, contrasting stitches and under bill, a frayed bill, and self-fabric strap with velcro adjustable. Available in many colors. One size fits most. ',
      price: 6.46
    }
  }
}
