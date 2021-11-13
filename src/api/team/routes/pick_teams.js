const Team = require('../models/team');
const Boom = require('boom');
const Joi = require('joi');
const { sendError } = require('../../../service/send-email');

module.exports = {
  method: 'POST',
  path: '/team/pick',
  config: {
    tags: ['api'],
    description: 'This api for update teams after user picking teams',
    notes: 'Update all teams',
    validate: {
      options: { allowUnknown: true },
      payload: Joi.object().keys({
        fan: Joi.number().required()
          .description('Idol team')
          .example('34'),
        antiFans: Joi.string()
          .description('Anti-fan teams')
          .example('34|344|343'),
        favorites: Joi.string()
          .description('Favorites teams')
          .example('134|44|43'),
      }).label('Update teams payload')
    },
    plugins: {
      'hapi-swagger': {
        responses: {
          200: { description: 'Success' },
          400: { description: 'Bad Request' },
          500: { description: 'Internal Error' }
        }
      }
    },
    handler: async (req, h) => {
      const { server: { logger, host, version, dbCon }, payload: { fan, antiFans, favorites} } = req;
      try {
        const team = new Team({ logger, host, version, dbCon });
        
        return await team.pickTeams({ fan, antiFans, favorites });
      } catch ({ stack }) { 
        sendError(req, stack);
        throw Boom.notImplemented(stack);
      }
    }
  }
};

