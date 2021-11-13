const Team = require('../models/team');
const Joi = require('joi');
const Boom = require('boom');
const { sendError } = require('../../../service/send-email');

module.exports = {
  method: 'GET',
  path: '/team/{teamId}/history/{season}',
  config: {
    tags: ['api'],
    description: 'This api for get all history of team in season',
    notes: 'Get team history',
    validate: {
      options: { allowUnknown: true },
      params: {
        teamId: Joi.number().required()
          .description('Team Id')
          .example('300'),
        season: Joi.string().required()
          .description('History')
          .example('14')
      }
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
      const { server: { logger, host, version, dbCon }, params: { teamId, season } } = req;
      try {
        const team = new Team({ logger, host, version, dbCon });
        
        return await team.history(teamId, season);
      } catch ({ stack }) { 
        sendError(req, stack);
        throw Boom.notImplemented(stack);
      }
    }
  }
};

