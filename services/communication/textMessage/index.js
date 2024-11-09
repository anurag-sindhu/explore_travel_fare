const accountSid = process.env.twilioAccountSid;
const authToken = process.env.twilioAuthToken;
const client = require('twilio')(accountSid, authToken);

const funcs = {};

funcs.sendTextMessage = async ({ message }) => {
  console.log(`Sending message '${message}' to ${process.env.twilioTextTo}`);
  return await client.messages.create({
    body: message,
    from: process.env.twilioTextFrom,
    to: process.env.twilioTextTo
  });
};

module.exports = funcs;
