const {formatTime} = require('./time')
const {WebClient} =
  process.env.NODE_ENV === 'test'
    ? require('./mock-slack-client')
    : require('@slack/client')

module.exports = class Messenger {
  constructor (workspaceId) {
    this.workspaceId = workspaceId
  }

  /**
   * Sets the WebClient to allow for message sending
   * @param webClient
   */
  setWebClient (webClient) {
    this.webClient = webClient
  }

  /**
   * Posts a message using the Slack API, if there is a WebClient. Otherwise it sends the error to the console.
   * @param message Message object to send
   */
  postMessage (message) {
    if (this.webClient) {
      this.webClient.chat.postMessage(message)
    } else {
      console.error(`Error sending message to channel ${message.channel} in workspace ${this.workspaceId}.\nThe message was:\n\n${message.text}`)
    }
  }

  /**
   * Posts a ephemeral message using the Slack API, if there is a WebClient. Otherwise it sends the error to the console.
   * @param message Message object to send
   */
  postEphemeral (message) {
    if (this.webClient) {
      this.webClient.chat.postEphemeral(message)
    } else {
      console.error(`Error sending ephemeral message to user ${message.user} in channel ${message.channel} in workspace ${this.workspaceId}.\nThe message was:\n\n${message.text}`)
    }
  }

  /**
   * Sends a message if the WebClient is initialized. Otherwise report the error to the console.
   * @param channelId Channel ID
   * @param text Text to send
   */
  sendMessage (channelId, text) {
    this.postMessage({
      channel: channelId,
      text
    })
  }

  /**
   * Sends a product to the appropriate channel
   * @param channelId Channel ID
   * @param product Product to send information about
   * @param gameTimeout Game timeout to send in the message
   */
  sendProduct (channelId, product, gameTimeout) {
    const message = {
      channel: channelId,
      text: `Qual o preço deste magnífico produto?\nA ronda de palpites dura ${formatTime(gameTimeout)}.`,
      attachments: [{
        title: product.name,
        image_url: `https:${product.imageUrl}`
      }]
    }

    this.postMessage(message)
  }

  /**
   * Sends an ephemeral message to the user in the channel, if WebClient exists.
   * @param channelId Channel ID
   * @param userId User ID
   * @param text Text to send
   */
  sendEphemeral (channelId, userId, text) {
    this.postEphemeral({
      channel: channelId,
      user: userId,
      text: text
    })
  }

  /**
   * Notifies the users in the channel about how much time there is left.
   * @param channelId Channel ID
   * @param timeLeft Time left in milliseconds
   */
  notifyTimeLeft (channelId, timeLeft) {
    const text = `Faltam ${formatTime(timeLeft)} para o final da ronda de palpites!`

    this.sendMessage(channelId, text)
  }

  /**
   * Function called when the OAuth endpoint is activated.
   * It receives a code with which to authenticate the app and
   * creates a WebClient to allow for message sending
   * @param code Slack code from the endpoint
   * @return {Promise<{workspaceId: Number, webClient: WebClient}>} * Promise that, if successful, resolves to an object containing the workspace ID and WebClient
   */
  static oauthAccess (code) {
    return new WebClient().oauth.access({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code: code
    }).then((res) => {
      const botAccessToken = res.bot.bot_access_token
      const workspaceId = res.team_id

      // TODO: Save botAccessToken
      const webClient = new WebClient(botAccessToken)

      console.log('Created webclient for workspace ' + this.workspaceId)

      return {
        workspaceId,
        webClient
      }
    })
  }
}
