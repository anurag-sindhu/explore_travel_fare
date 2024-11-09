const service = require('../../../services/communication/textMessage/index');

const funcs = {};

funcs.sendTextMessage = async ({ message }) => {
  return await service.sendTextMessage({ message });
};

module.exports = funcs;
