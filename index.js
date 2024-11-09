const express = require('express'),
  app = express(),
  config = require('config'),
  path = require('path'),
  fs = require('fs'),
  bodyParser = require('body-parser'),
  cors = require('cors'),
  fileUpload = require('express-fileupload'),
  { handleError } = require('./helpers/error'),
  utils = require('./util'),
  environmentVariablesPath = './env.json';

app.use(fileUpload());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((err, req, res, next) => {
  handleError(err, res);
});
if (fs.existsSync(path.join(__dirname, environmentVariablesPath))) {
  const environmentVariables = require(environmentVariablesPath);
  for (const key in environmentVariables) {
    if (!process.env) {
      process.env = {};
    }
    if (!process.env[key]) {
      process.env[key] = environmentVariables[key];
    }
  }
}
const port = process.env.PORT || config.get('port');
const happyEasyGoAir = require('./services/happyEasyGo/air');

var server = app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);

async function onStart() {
  let resp = null;
  let sleep = config.get('sleep.four_minute');
  console.log(`On Start Iterations has started`);
  while (true) {
    try {
      resp = await happyEasyGoAir.checkAirFare();
      await utils.sleep(config.get('sleep.five_seconds'));
      console.log(
        `--------------------------------------------------------------------------------------------` +
          `--------------------------------------------------------------------------------------------`
      );
    } catch (e) {
      console.log({ e });
    }
    await utils.sleep(sleep);
  }
  return resp;
}

exports.handler = async (event) => {
  return await onStart();
};
