const mailer = require('nodemailer');
const { isProd } = require('../../config/config');
const { setInvalidMatch, getInvalidMatchById } = require('../utils/redis');
const { isExpired, nowInTimeStamp } = require('../utils/time');

const transporter = mailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  ignoreTLS: false,
  secure: false,
  auth: {
    user: "xxx@xxx.com',
    pass: "xxx"
  }
});

const checkMailer = () => {
  return new Promise((resolve) => {
    transporter.verify(function(error, success) {
      if (error) {
        console.log('MAILER NOT READY =', error);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  })
}

const sendError = async (request, errorMessage) => {
  const verify = await checkMailer();
  if (!verify) { return; }

  const { path, payload = {}, query = {}, params = {} } = request;
  const env = isProd === true ? "Production" : "Dev";

  var message = {
    from: 'not-reply@85neighbors.com',
    to: 'liubei.bbfootball@gmail.com',
    subject: `[BBF BOT API][Error] ${path}`,
    html: `
      <p>Created date: ${new Date()}</p>
      <p>Environment: ${env}</p>

      <p>Payload: ${JSON.stringify(payload)}</p>
      <p>Query: ${JSON.stringify(query)}</p>
      <p>Params: ${JSON.stringify(params)}</p>
      <p>Error message: ${errorMessage}</p>
    `
  };

  await transporter.sendMail(message);
}

const sendInvalidMatchData = async (matchId, matchTitle, errorMessage) => {
  const verify = await checkMailer();
  if (!verify) { return; }

  const json = await getInvalidMatchById(matchId);
  if (json) {
    const invalidMatch = JSON.parse(json);
    if (!isExpired(invalidMatch.latestTime, 60 * 60) && errorMessage === invalidMatch.errorMessage) {
      return false;
    }
    await setInvalidMatch(matchId, {
      latestTime: nowInTimeStamp(),
      errorMessage
    });
  }

  const env = isProd === true ? "Production" : "Dev";

  const message = {
    from: 'not-reply@85neighbors.com',
    to: 'liubei.bbfootball@gmail.com',
    subject: `[BBF][Invalid Match Data]`,
    html: `
      <p>Created date: ${new Date()}</p>
      <p>Environment: ${env}</p>
      
      <p>Match ID: ${matchId}</p>
      <p>Match Title: ${matchTitle}</p>
      <p>Error: ${errorMessage}</p>
    `
  };
  const sent = await transporter.sendMail(message);
  return sent;
}

module.exports = { 
  sendError,
  sendInvalidMatchData
};
