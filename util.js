const funcs = {};
const request = require('request');
const moment = require('moment');
const fs = require('fs');
const config = require('config');
const path = require('path');
const notificationSentRecently = {};
funcs.executeRequest = (options) => {
  if (!options) {
    return;
  }
  return new Promise((resolve, reject) => {
    request(options, function (error, response) {
      if (error) {
        return reject(error);
      }
      let resp = response.body ? response.body : response;

      return resolve(typeof resp === 'string' && isParsable(resp) ? JSON.parse(resp) : resp);
    });
  });
};


funcs.sleep = (time_in_min = null) => {
  if (!time_in_min) {
    return;
  }
  return new Promise((resolve) => setTimeout(resolve, time_in_min * 60 * 1000));
};

funcs.getUniqueCarData = (data, accordingTo = null) => {
  if (!data || !accordingTo) return data;
  const obj = {};
  for (let index = 0; index < data.length; index++) {
    if (obj[data[index][accordingTo]]) {
      data[index] = undefined;
    } else {
      obj[data[index][accordingTo]] = true;
    }
  }
  let resp = data.filter((value) => {
    if (value) {
      return true;
    }
    return false;
  });
  fs.writeFileSync(path.join(__dirname, `data.json`), JSON.stringify(resp));
  return resp;
};

funcs.addQueryParams = (params) => {
  let str = '';
  if (!params) {
    return str;
  }
  for (const key in params) {
    if (str.length) {
      str += '&';
    }
    str += key + '=' + params[key];
  }
  return str;
};

funcs.getFlattenObject = ({ obj, response = {} }) => {
  for (const key in obj) {
    if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      funcs.getFlattenObject({ obj: obj[key], response });
    } else {
      response[key] = obj[key];
    }
  }
  return response;
};

this.formatDate = ({ date = new Date(), format }) => {
  return moment(date).format(format);
};

funcs.getDate = ({ afterDays, format, date = new Date() }) => {
  if (afterDays) {
    date.setDate(date.getDate() + afterDays);
  }
  if (format) {
    return this.formatDate({ date, format });
  }
  return date;
};

funcs.isParsable = ({ data }) => {
  if (!data) {
    return false;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return false;
  }
};

funcs.formatAirFare = ({ data }) => {
  const resp = {};
  const dataElement = data.data;
  if (dataElement) {
    for (const monthYear in dataElement) {
      for (const date in dataElement[monthYear]) {
        resp[`${monthYear}-${date}`] = parseInt(dataElement[monthYear][date]);
      }
    }
  }

  return resp;
};

module.exports = funcs;
function isParsable(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (err) {
    return false;
  }
}

function canWeSendNotification(carId) {
  if (!carId) {
    return true;
  }
  if (!notificationSentRecently[carId]) {
    notificationSentRecently[carId] = 0;
  }
  if (notificationSentRecently[carId] >= config.get(`notification_limit`)) {
    return false;
  }
  notificationSentRecently[carId] = notificationSentRecently[carId] + 1;
  return true;
}
