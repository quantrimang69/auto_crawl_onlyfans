const i18n = require('../i18n');

const getMessage = (key, code) => {
  code = code || 'en';
  return i18n[code.toLowerCase()].messages[key];
};

module.exports = { getMessage };
