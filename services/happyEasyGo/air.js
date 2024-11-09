const config = require('config');
const utils = require('../../util');
const redis = require('../../DB/redis/index');
const communicationTextMessageHandler = require('../../handlers/communication/textMessage/index');
const communicationWebNotificationsHandler = require('../../handlers/communication/webNotifications/index');

const funcs = {};

funcs.checkAirFare = async () => {
  const redisKey = 'lowestFare';
  const getDataFromRedis = await redis.getDataFromRedis({ key: redisKey });
  for (const trip of config.get(`happyEasyGo.air.trips`)) {
    const airFareResp = await utils.executeRequest(
      buildRequest({ from: trip.way.from, to: trip.way.to, afterDays: trip.days })
    );
    let tempLowestFare = { value: Infinity };
    const formattedAirFareResp = utils.formatAirFare({ data: airFareResp });
    let afterDays = 1;
    let totalDaysConcerned = trip.days;
    const dateFormat = 'YYYY-MM-DD';
    let date = utils.getDate({ format: dateFormat });
    while (totalDaysConcerned--) {
      if (formattedAirFareResp[date] < tempLowestFare.value) {
        tempLowestFare = {
          url: `https://www.happyeasygo.com/flights/DEL-BLR/${date}?tripType=0&adults=1&childs=0&baby=0&cabinClass=Economy&airline=&carrier=`,
          value: formattedAirFareResp[date]
        };
      }
      date = utils.getDate({ afterDays: afterDays++, format: dateFormat });
    }
    if (!getDataFromRedis || !getDataFromRedis.value) {
      await redis.setDataToRedis({ key: redisKey, data: tempLowestFare });
      console.log({ fare: tempLowestFare.value, url: tempLowestFare.url, time: new Date() });
    } else if (tempLowestFare.value < getDataFromRedis.value) {
      const message = `${tempLowestFare.value}  ${tempLowestFare.url}`;
      const title = `Book Soon`;
      await communicationTextMessageHandler.sendTextMessage({
        message
      });
      await communicationWebNotificationsHandler.sendWebNotification({ title, message });
      console.log({
        fare: message,
        url: tempLowestFare.url,
        time: new Date()
      });
      await redis.setDataToRedis({ key: redisKey, data: tempLowestFare });
    } else if (tempLowestFare.value <= 5000) {
      const message = `${tempLowestFare.value}  ${tempLowestFare.url}`;
      const title = `Book Soon`;
      await communicationTextMessageHandler.sendTextMessage({
        message
      });
      await communicationWebNotificationsHandler.sendWebNotification({ title, message });
      console.log({
        fare: message,
        url: tempLowestFare.url,
        time: new Date()
      });
      await redis.setDataToRedis({ key: redisKey, data: tempLowestFare });
    } else {
      console.log({ fare: tempLowestFare.value, url: tempLowestFare.url, time: new Date() });
    }
    await utils.sleep(config.get('sleep.five_seconds'));
  }
  return;
};

module.exports = funcs;

const buildRequest = ({ from, to }) => {
  return {
    method: 'POST',
    rejectUnauthorized: false,
    url: config.get(`happyEasyGo.air.url`),
    headers: {
      'content-type': 'application/json;charset=UTF-8',
      Cookie: 'acw_tc=95818c0a16523614509525307e2d729ad25612815059dd57caae9f52a54e13'
    },
    body: JSON.stringify({ date: utils.getDate({ format: 'YYYY-MM-DD' }), from, to })
  };
};
