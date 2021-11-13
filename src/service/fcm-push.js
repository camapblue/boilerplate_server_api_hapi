const FCM = require('fcm-node');

const serverKey = 'xxx';
const fcm = new FCM(serverKey);

const sendPush = (recipient, text, options = []) => {
  const message = {
    to: recipient === null ? '/topics/all' : recipient,

    notification: {
      title: 'Jeni Bot',
      body: text,
      options
    }
  };

  fcm.send(message, (err, response) => {
    if (err) {
      console.log('Something has gone wrong!');
    } else {
      console.log(`Successfully sent with response: ${response}`);
    }
  });
};

module.exports = { sendPush };
