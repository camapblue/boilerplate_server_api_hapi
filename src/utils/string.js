const Crypto = require('crypto');

function generateCodeNumber(number = 4) {
  const hex = Crypto.randomBytes(number).toString('hex');
  return parseInt(hex, 16).toString();
}

String.prototype.splice = function(idx, rem, str) {
  return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
}

function toShadowUrl(url) {
  if (url === null) {
    return '';
  }
  const len = url.length;
  return url.splice(len - 4, 0, '_shadow');
}

module.exports = {
  generateCodeNumber,
  toShadowUrl
};
