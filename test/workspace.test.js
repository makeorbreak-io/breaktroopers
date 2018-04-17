process.env.NODE_ENV = 'test'

const assert = require('assert')
const Workspace = require('../src/workspace')
const Statistics = require('../src/statistics')
const Messenger = require('../src/messenger')

const {WebClient} = require('../src/mock-slack-client')

describe('Workspace', function () {

  const messenger = new Messenger('123')
  messenger.setWebClient(new WebClient())

  const workspaceId = '12345'

  describe('is created', function () {
    it('with correct initial configuration', function () {
      const workspace = new Workspace(workspaceId)

      assert.strictEqual(workspace.id, workspaceId)
      assert.deepStrictEqual(workspace.games, {})
      assert.deepStrictEqual(workspace.stats, new Statistics())
      assert.deepStrictEqual(workspace.messenger, new Messenger())
    })

    it('gets user stats', function () {
      const workspace = new Workspace(workspaceId)
      assert.deepStrictEqual(workspace.stats.getUserStats(0), workspace.getUserStats(0))
    })

    it('sets WebClient', function () {
      const workspace = new Workspace(workspaceId)
      const webClient = new WebClient()

      workspace.setWebClient(webClient)
      const workspaceSetWebClient = workspace.messenger.webClient

      workspace.messenger.setWebClient(webClient)
      const directlySetWebClient = workspace.messenger.webClient

      assert.deepStrictEqual(workspaceSetWebClient, directlySetWebClient)
    })
  })
})
