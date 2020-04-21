// 此文件代码无实际意义 只是给webstorm编译器识别别名路径而已
var path = require('path');

function resolve (dir) {
  return path.join(__dirname, dir);
}

module.exports = {
  resolve: {
    alias: {
      '@': resolve('src')
    }
  }
};
