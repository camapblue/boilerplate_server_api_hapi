const axios = require('axios');
const moment = require('moment');
const { doJobsInParallel } = require('../../../utils/array');

/**
 * @class
 * @name Team
 */
class Team {

  constructor(opts) {
    Object.assign(this, opts);

    // create db model
    this.Team = this.dbCon.db.model('team', this.dbCon.dbSchema.team);
  }

  /**
   * @end-point GET /team/all
   */
  async get() {
    const find = this.Team.find({}).lean();
    const items = await find.exec();

    if (items.length === 0) {
      return { result: true, teams: [] };
    }

    const teams = items.map(t => {
      let team = {
        teamId: t.teamId,
        name: t.name,
        shortName: t.shortName,
        shortcut: t.shortcut,
        logoURL: t.logoURL,
        stadium: t.stadium,
        city: t.city,
        color: t.color,
        numberFans: t.numberFans,
        numberAntiFans: t.numberAntiFans,
        numberFavorites: t.numberFavorites,
      };
      return team;
    });

    return {
      result: true,
      teams
    };
  }

  /**
   * @end-point POST /team/update
   */
  async update() {
    const res = await axios.get(`${this.host}/team/all`)
    const { teams } = res.data;

    const results = await Promise.all(
      teams.map(async (team) => {
        const found = await this.Team.findOne({ teamId: team.teamId }).lean().exec();
        if (found === null) {
          const newTeam = new this.Team({
            teamId: team.teamId,
            name: team.name,
            shortName: team.shortName,
            shortcut: team.shortcut,
            logoURL: team.logoURL,
            stadium: team.stadium,
            city: team.city,
            color: team.color,
            numberFans: team.numberFans,
            numberAntiFans: team.numberAntiFans,
            numberFavorites: team.numberFavorites,
          });

          const result = await newTeam.save();
        } else {
          const update = this.Team.updateOne({ teamId: team.teamId }, {
            $set: {
              name: team.name,
              shortName: team.shortName,
              shortcut: team.shortcut,
              logoURL: team.logoURL,
              stadium: team.stadium,
              city: team.city,
              color: team.color,
              numberFans: team.numberFans,
              numberAntiFans: team.numberAntiFans,
              numberFavorites: team.numberFavorites,
            }
          });

          const result = await update.exec();
        }
        return true;
      })
    );
  
    return { result: true };
  }

  /**
   * @end-point POST /team/{teamId}/performance
   * @param {Number} teamId
   * @param {Number} numberMatches
   */
  async performance({ teamId, numberMatches }) {
    const MatchOfTeam = this.dbCon.db.model(`Team_${teamId}`, this.dbCon.dbSchema.match);

    const find = MatchOfTeam.find().sort({ startTime: -1 }).limit(numberMatches).lean();
    const items = await find.exec();
    let performance = '';
    for (let i = 0 ; i < items.length ; i++) {
      const match = items[i];
      performance += match.result + ' ';   
    }
    return { performance };
  }

  /**
   * @end-point POST /team/{season}/statistic
   * @param {String} season
   */
  async statistic(season) {
    const find = this.Team.find({}).lean();
    const teams = await find.exec();

    const teamIds = teams.map(t => {
      return {
        teamId: t.teamId,
        season
      }
    });
    const results = await Promise.all(
      teamIds.map((teamId) => {
        return this.teamStatisticInSeason(teamId);
      })
    );
    return { statistic: results.filter(team => team.totalMatch > 0) };
  }

  /**
   * @end-point POST /team/{teamId}/history/{season}
   * @param {Number} teamId
   * @param {String} season
   */
  async history(teamId, season) {
    const MatchOfTeam = this.dbCon.db.model(`Team_${teamId}`, this.dbCon.dbSchema.match);

    const find = MatchOfTeam.find({ season }).sort({ startTime: -1 }).lean();
    const items = await find.exec();

    const history = items.map(({ _id, leagueName, homeName, awayName, homeGoals, awayGoals, startTime, matchRound }) => {
      const matchTitle = `${homeName}  ${homeGoals} - ${awayGoals}  ${awayName}`;
      const matchStart = moment.unix(startTime).format('MM DD YYYY, h:mm:ss a Z');
      return {
        matchId: _id,
        league: leagueName,
        result: matchTitle,
        matchStart,
        matchRound
      }
    });

    return { history };
  }

  /**
   * @function get team statistic of particular team in season
   */
  async teamStatisticInSeason({ teamId, season }) {
    const MatchOfTeam = this.dbCon.db.model(`Team_${teamId}`, this.dbCon.dbSchema.match);

    const find = MatchOfTeam.find({ season }).lean();
    const items = await find.exec();
    let scored = 0;
    let conceded = 0;
    let teamName = "";
    let totalMatch = items.length;
    
    for (let i = 0 ; i < totalMatch ; i++) {
      const match = items[i];
      if (match.homeId === teamId) {
        if (teamName.length === 0) {
          teamName = match.homeName;
        }
        scored += match.homeGoals;
        conceded += match.awayGoals;
      } else {
        if (teamName.length === 0) {
          teamName = match.awayName;
        }
        scored += match.awayGoals;
        conceded += match.homeGoals;
      }
    }
    return {
      teamId,
      teamName,
      scored,
      conceded,
      totalMatch
    };
  }

  /**
   * @end-point POST /team/pick
   */
  async pickTeams({ fan, antiFans, favorites }) {
    var jobs = [];
    const updateFan = this.Team.updateOne({ teamId: fan },
      {
        $inc: { 
          'numberFans': 1
        }
      }
    );
    jobs.push(updateFan.exec());

    if (antiFans !== undefined) {
      const antiFanIds = antiFans.split('|').map((id) => parseInt(id));
      const updateAntiFans = this.Team.updateMany({ teamId: { $in: antiFanIds } },
        {
          $inc: { 
            'numberAntiFans': 1
          }
        }
      );
      jobs.push(updateAntiFans.exec());
    }

    if (favorites !== undefined) {
      const favoriteIds = favorites.split('|').map((id) => parseInt(id));
      const updateFavorites = this.Team.updateMany({ teamId: { $in: favoriteIds } },
        {
          $inc: { 
            'numberFavorites': 1
          }
        }
      );
      jobs.push(updateFavorites.exec());
    }

    const results = await doJobsInParallel(jobs);

    return {
      result: true
    };
  }
}

module.exports = Team;
