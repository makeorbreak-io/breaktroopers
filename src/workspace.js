const Statistics = require('./statistics')
const {Game, GameState} = require('./game')
const Messenger = require('./messenger')

module.exports = class Workspace {
  constructor (workspaceId) {
    this.id = workspaceId
    this.games = {}
    this.stats = new Statistics()
    this.messenger = new Messenger()
  }

  handleMessage (event) {
    if (this.games.hasOwnProperty(event.channel)) {
      this.games[event.channel].handleEvent(event.user, event.text)
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
   * @param event Slack event with information about workspace, channel, etc.
   * @param onGameFinished Callback to pass to Game
   * @return {undefined|Error} Returns Error if the game could not be created. Returns undefined otherwise.
   */
  startGame (event, onGameFinished) {
    if (this.games.hasOwnProperty(event.channel)) {
      const game = this.games[event.channel]

      if (game.getState() !== GameState.FINISHED) {
        return new Error('game_not_finished')
      }
    }

    const game = new Game(this.messenger, event.channel, onGameFinished)
    this.games[event.channel] = game
    game.start()
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
