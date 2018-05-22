'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _jssNested = require('jss-nested');

var _jssNested2 = _interopRequireDefault(_jssNested);

var _jssDefaultUnit = require('jss-default-unit');

var _jssDefaultUnit2 = _interopRequireDefault(_jssDefaultUnit);

var _jssPropsSort = require('jss-props-sort');

var _jssPropsSort2 = _interopRequireDefault(_jssPropsSort);

var _jssIsolate = require('jss-isolate');

var _jssIsolate2 = _interopRequireDefault(_jssIsolate);

var _jss = require('jss');

var JSS = _interopRequireWildcard(_jss);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(function () {
  var enterModule = require('react-hot-loader').enterModule;

  enterModule && enterModule(module);
})();

const jss = JSS.create();

jss.use((0, _jssNested2.default)(), (0, _jssDefaultUnit2.default)(), (0, _jssPropsSort2.default)(), (0, _jssIsolate2.default)({ isolate: false }));

const _default = jss;
exports.default = _default;
;

(function () {
  var reactHotLoader = require('react-hot-loader').default;

  var leaveModule = require('react-hot-loader').leaveModule;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(jss, 'jss', 'src/stylesheet.js');
  reactHotLoader.register(_default, 'default', 'src/stylesheet.js');
  leaveModule(module);
})();

;
//# sourceMappingURL=stylesheet.js.map