const LeagueType = {
  Round: 'ROUND',
  GroupTournament: 'GROUP_TOURNAMENT',
  SeasonTournament: 'SEASON_TOURNAMENT',
  Tournament: 'TOURNAMENT',
  NationalQualifiers: 'NATIONAL_QUALIFIERS',
  Friendly: 'FRIENDLY'
}

const MatchStatus = {
  UpComing: 17,
  FirstTime: 1,
  HalfTime: 2,
  SecondHalf: 3,
  Finished: 4,
  ExtraTimeFirstHalf: 5,
  ExtraTimeHalfTime: 6,
  ExtraTimeSecondTime: 7,
  ExtraTimeFinished: 8,
  Postponed: 13,
  Undecided: 15
}

module.exports = {
  LeagueType,
  MatchStatus
}