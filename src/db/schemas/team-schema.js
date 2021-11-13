/**
 * Class that wrap db team schema
 *
 * @class TeamSchema
 */
class TeamSchema {
  constructor(db) {
    const Schema = db.Schema;
    return new Schema({
      teamId: Number,
      name: String,
      shortName: String,
      shortcut: String,
      logoURL: String,
      stadium: String,
      city: String,
      color: String,
      numberFans: Number,
      numberAntiFans: Number,
      numberFavorites: Number,
    });
  }
}

module.exports = TeamSchema;
