'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _stcPlugin = require('stc-plugin');

var _stcPlugin2 = _interopRequireDefault(_stcPlugin);

var _stcHelper = require('stc-helper');

var _cluster = require('cluster');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CSSCombinePlugin = function (_Plugin) {
  (0, _inherits3.default)(CSSCombinePlugin, _Plugin);

  function CSSCombinePlugin() {
    (0, _classCallCheck3.default)(this, CSSCombinePlugin);
    return (0, _possibleConstructorReturn3.default)(this, _Plugin.apply(this, arguments));
  }

  /**
   * run
   */

  CSSCombinePlugin.prototype.run = function () {
    var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
      var tokens;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return this.getAst();

            case 2:
              tokens = _context.sent;


              console.log(tokens);

              return _context.abrupt('return', '123');

            case 5:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function run() {
      return ref.apply(this, arguments);
    }

    return run;
  }();
  /**
   * update
   */


  CSSCombinePlugin.prototype.update = function update(data) {
    this.setContent(data);
  };
  /**
   * use cluster
   */


  CSSCombinePlugin.cluster = function cluster() {
    return true;
  };
  /**
   * use cache
   */


  CSSCombinePlugin.cache = function cache() {
    return true;
  };

  return CSSCombinePlugin;
}(_stcPlugin2.default);

exports.default = CSSCombinePlugin;