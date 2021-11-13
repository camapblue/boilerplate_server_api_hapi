const Team = require('../models/team');
const Joi = require('joi');
const Boom = require('boom');
const { sendError } = require('../../../service/send-email');

module.exports = {
  method: 'GET',
  path: '/team/all',
  config: {
    tags: ['api'],
    description: 'This api for get all teams',
    notes: 'Get all teams',
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
      const { server: { logger, host, version, dbCon } } = req;
      try {
        const team = new Team({ logger, host, version, dbCon });
        
        return await team.get();
      } catch ({ stack }) { 
        sendError(req, stack);
        throw Boom.notImplemented(stack);
      }
    }
  }
};

