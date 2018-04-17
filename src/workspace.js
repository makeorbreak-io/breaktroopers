const Statistics = require('./statistics')
const {Game, GameState} = require('./game')
const Messenger = require('./messenger')

module.exports = class Workspace {
  constructor (workspaceId) {
    this.id = workspaceId
    this.games = {}
    this.stats = new Statistics()
    this.messenger = new Messenger(workspaceId)
  }

  handleEvent (channelId, userId, text) {
    if (this.games.hasOwnProperty(channelId)) {
      this.games[channelId].handleEvent(userId, text)
    }
  }

  /**
   * Sets the WebClient to allow for message sending.
   * @param webClient WebClient
   */
  setWebClient (webClient) {
    this.messenger.setWebClient(webClient)
  }

  /**
   * Starts a game in a workspace
   * @param channelId Channel ID
   * @param onGameFinished Callback to pass to Game
   * @return {Error|Promise<void>} Returns Error if the game could not be created. Otherwise, returns the game.start() promise.
   */
  startGame (channelId, onGameFinished) {
    if (this.games.hasOwnProperty(channelId)) {
      const game = this.games[channelId]

      if (game.getState() !== GameState.FINISHED) {
        return new Error('game_not_finished')
      }
    }

    const game = new Game(this, channelId, onGameFinished)
    this.games[channelId] = game
    return game.start()
  }

  /**
   * Updates statistics with a new game
   * @param game Game to update statistics with
   */
  addGameToStatistics (game) {
    this.stats.addGame(game)
  }

  /**
   * Returns user statistics
   * @param userId User ID
   * @return {*} User statistics
   */
  getUserStats (userId) {
    return this.stats.getUserStats(userId)
  }

  /**
   * Forwards the message to the Messenger
   * @param channelId Channel ID
   * @param text Text to send
   */
  sendMessage (channelId, text) {
    this.messenger.sendMessage(channelId, text)
  }

  /**
   * Forwards the ephemeral message to the Messenger
   * @param channelId Channel ID
   * @param userId User ID
   * @param text Text to send
   */
  sendEphemeral (channelId, userId, text) {
    this.messenger.sendEphemeral(channelId, userId, text)
  }
}
