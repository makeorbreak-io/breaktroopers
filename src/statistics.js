module.exports = class Statistics {
  constructor () {
    this.stats = {}
  }

  addGame (game) {
    const answers = game.getAnswers()

    if (!answers) {
      return
    }

    for (let userId in answers) {
      const isWinner = game.getWinner() === userId
      const productPrice = game.getProduct().price

      this.addStat(userId, answers[userId], isWinner, productPrice)
    }
  }

  addStat (userId, answer, won, productPrice) {
    const baseStat = {
      gamesWon: 0,
      gamesPlayed: 0,
      exactPriceMatches: 0,
      minimumOffset: Number.POSITIVE_INFINITY
    }

    const curStat = this.stats[userId] || baseStat

    if (productPrice === answer) {
      curStat.exactPriceMatches++
    }

    if ((productPrice - answer) < curStat.minimumOffset && (productPrice - answer) > 0) {
      curStat.minimumOffset = (productPrice - answer).toFixed(2)
    }

    if (won) {
      curStat.gamesWon++
    }

    curStat.gamesPlayed++

    this.stats[userId] = curStat
  }

  getUserStats (userId) {
    return this.stats[userId]
  }
}
