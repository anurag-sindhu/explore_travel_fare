const { createClient } = require('redis');
const utils = require('../../util');

let client = createClient();
client.connect();

exports.setDataToRedis = async ({ key, data }) => {
  if (typeof data !== 'string') {
    data = JSON.stringify(data);
  }
  return await client.set(key, data);
};

exports.getDataFromRedis = async ({ key }) => {
  let resp = await client.get(key);
  return utils.isParsable({ data: resp }) || resp;
};
