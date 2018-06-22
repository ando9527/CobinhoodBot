require('dotenv').load()
var _logger = require('./logger')

var _logger2 = _interopRequireDefault(_logger)

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj }
}
var _option = require('../option')

var _option2 = _interopRequireDefault(_option)

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj }
}

console.log(`NODE_ENV ${process.env.NODE_ENV}`)
console.log(`SENTRY_DSN ${process.env.SENTRY_DSN}`)
describe('sentry', () => {
  it('Capture error', done => {
    _logger2.default.getSentry().on('logged', function() {
      console.log('Yay, it worked!')
      done()
    })
    try {
      throw new Error('!!!unit test error!')
    } catch (error) {
      _logger2.default.error(error, _option2.default)
    }
  })
  it('Capture message', done => {
    _logger2.default.getSentry().on('logged', function(e) {
      done()
    })
    _logger2.default.record('testtttt', _option2.default)
  })
})
