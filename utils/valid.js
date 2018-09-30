var valid = {
  // 验证空类型，空返回true
  isEmputy: function (str) {
    return str == '' ? true : false;
  },
  // 验证长度，长度等于len返回true
  isLength: function (str, len) {
    return str.length == len ? true : false;
  },
  //验证长度范围
  isLengthIn: function (str, minlen, maxlen) {
    return str.length >= minlen && str.length <= maxlen ? true : false
  },
  // 验证手机
  isPhone: function (str) {
    return new RegExp("^1[35678][0-9]{9}$").test(str) ? true : false;
  },
  //去除字符串前后空格
  killSpace: function (str) {
    return str.replace(/(^\s*)|(\s*$)/g, "");
  }
}

module.exports = {
  valid: valid
}