const notifier = require('node-notifier');
this.sendWebNotification = async ({ title, message, sound = true }) => {
  return notifier.notify({
    title,
    message,
    sound,
    wait: true
  });
};
