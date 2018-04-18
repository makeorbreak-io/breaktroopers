module.exports.formatTime = function (time) {
  const hours = Math.trunc(time / (1000 * 60 * 60))
  time = time % (1000 * 60 * 60)
  const minutes = Math.trunc(time / (1000 * 60))
  time = time % (1000 * 60)
  const seconds = Math.trunc(time / 1000)

  let result = ''

  if (hours) {
    result += `${hours}h`
  }

  if (minutes) {
    result += ` ${minutes}m`
  }

  if (seconds) {
    result += ` ${seconds}s`
  }

  return result.trim()
}
