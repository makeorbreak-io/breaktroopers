process.env.NODE_ENV = 'test'

const assert = require('assert')
const {formatTime} = require('../src/time')

describe('Time', function () {
  describe('formatTime', function () {
    it('1h', function () {
      let res = formatTime(60 * 60 * 1000)

      assert.strictEqual(res, '1h')
    })

    it('2h', function () {
      let res = formatTime(2 * 60 * 60 * 1000)

      assert.strictEqual(res, '2h')
    })

    it('2h30m', function () {
      let res = formatTime(2 * 60 * 60 * 1000 + 30 * 60 * 1000)

      assert.strictEqual(res, '2h 30m')
    })

    it('2h30m30s', function () {
      let res = formatTime(2 * 60 * 60 * 1000 + 30 * 60 * 1000 + 30 * 1000)

      assert.strictEqual(res, '2h 30m 30s')
    })

    it('30m', function () {
      let res = formatTime(30 * 60 * 1000)

      assert.strictEqual(res, '30m')
    })

    it('30m30s', function () {
      let res = formatTime(30 * 60 * 1000 + 30 * 1000)

      assert.strictEqual(res, '30m 30s')
    })

    it('30s', function () {
      let res = formatTime(30 * 1000)

      assert.strictEqual(res, '30s')
    })
  })
})
