const redis = require('../../config/redis');
const { isNilOrEmpty } = require('ramda-adjunct');
const { generateCodeNumber } = require('./string');
const { nowInTimeStamp, isExpired } = require('./time');

// generate new code, create key value with code
const setAppFbId = (appFbId, username) => {
  const code = generateCodeNumber();
  const now = nowInTimeStamp();
  const codeNumber = `${username}|${code}`;
  return redis.hmset([
    'BOT_USER',
    codeNumber, `${appFbId}|${now}`
  ]);
};

// check code number with username and code
const checkCodeNumber = (username, code) => {
  const codeNumber = `${username}|${code}`;
  return new Promise((resolve) => {
    redis.hget('BOT_USER', codeNumber, (err, value) => {
      const comps = value.split('|');
      const expired = isExpired(comps[1]);
      resolve({ check: !expired });
    });
  });
};

// get app fb id based on username and code
const getAppFbId = (username, code) => {
  const codeNumber = `${username}|${code}`;
  return new Promise((resolve) => {
    redis.hget('BOT_USER', codeNumber, (err, value) => {
      const comps = value.split('|');
      resolve({ appFbId: comps[0] });
    });
  });
};

// store bot fb id base on app fb id
const setBotFbId = (appFbId, botFbId) => {
  return redis.hmset([
    `BOT_USER_${appFbId}`,
    'botFbId', botFbId
  ]);
};

// get bot fb id by app fb id
const getBotFbId = (appFbId) => {
  return new Promise((resolve) => {
    redis.hget(`BOT_USER_${appFbId}`, 'botFbId', (err, botFbId) => {
      resolve(botFbId);
    });
  });
};

// store league base on league id
const setLeague = (leagueId, data) => {
  return redis.hmset([
    'BBFOOTBALL_LEAGUE',
    leagueId, data
  ]);
};

// store league base on league id
const deleteLeagues = (leagueIds) => {
  return new Promise((resolve) => {
    redis.hdel('BBFOOTBALL_LEAGUE', leagueIds, function (e, r) {
      resolve(true);
    });
  });
};

// get all available league
const getLeagues = () => {
  return new Promise((resolve) => {
    redis.hgetall('BBFOOTBALL_LEAGUE', (err, leagues) => {
      if (isNilOrEmpty(leagues)) {
        resolve(null);
      } else {
        resolve(leagues);
      }
    });
  });
}

const getAllGroupLeagueIds = (tournamenId) => {
  return new Promise((resolve) => {
    redis.hgetall('BBFOOTBALL_LEAGUE', (err, leagues) => {
      if (isNilOrEmpty(leagues)) {
        resolve([]);
      } else {
        let leagueIds = [];
        Object.keys(leagues).forEach(leagueId => {
          const { parentId } = JSON.parse(leagues[leagueId]);
          if (parentId === tournamenId) {
            leagueIds.push(leagueId);
          }          
        });
        
        resolve(leagueIds);
      }
    });
  });
}

// get league data by league id
const getLeagueById = (leagueId) => {
  return new Promise((resolve) => {
    redis.hget('BBFOOTBALL_LEAGUE', leagueId, (err, data) => {
      resolve(data);
    });
  });
};

// set match 
const clearLiveMatches = () => {
  return new Promise((resolve) => {
    redis.hdel('BBFOOTBALL_MATCH', 'LIVE', function (e, r) {
      resolve(true);
    });
  });
};

const setLiveMatches = (matches) => {
  const string = JSON.stringify(matches);
  return redis.hmset([
    'BBFOOTBALL_MATCH',
    'LIVE', string
  ]);
};

const getLiveMatches = () => {
  return new Promise((resolve) => {
    redis.hget('BBFOOTBALL_MATCH', 'LIVE', (err, data) => {
      if (isNilOrEmpty(data)) {
        resolve(null);
      } else {
        const json = JSON.parse(data);
        resolve(json);
      }
    });
  });
};

const setInvalidMatch = (matchId, invalidMatch) => {
  const string = JSON.stringify(invalidMatch);
  return redis.hmset([
    'BBFOOTBALL_INVALID_MATCH',
    matchId, string
  ]);
};

const getInvalidMatchById = (matchId) => {
  return new Promise((resolve) => {
    redis.hget('BBFOOTBALL_INVALID_MATCH', matchId, (err, data) => {
      resolve(data);
    });
  });
};

module.exports = {
  setAppFbId,
  checkCodeNumber,
  getAppFbId,
  setBotFbId,
  getBotFbId,
  setLeague,
  deleteLeagues,
  getLeagueById,
  getLeagues,
  getAllGroupLeagueIds,
  clearLiveMatches,
  setLiveMatches,
  getLiveMatches,
  setInvalidMatch,
  getInvalidMatchById
};
