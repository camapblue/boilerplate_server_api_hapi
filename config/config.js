const dotenv = require('dotenv');

dotenv.config();

console.log('BB FOOTBALL HOST = ', process.env.BBFOOTBALL_HOST);
console.log('REDIS URL = ', process.env.REDIS_URL);
console.log('MONGODB URL = ', process.env.MONGODB_URI);

module.exports = {
  bbfMatchServiceHost: process.env.BBFOOTBALL_HOST,
  isProd: process.env.IS_PROD === 'true',
  standingLeagues: process.env.STANDING_LEAGUES
}
