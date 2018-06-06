'use strict'

module.exports = async function (fastify, opts) {
  const postCol = fastify.mongo.db.collection('post')

  fastify.route({
    method: 'GET',
    url: '/:username/post',
    schema: {
      description: 'Get post created by the user',
      params: 'username#',
      response: {
        200: {
          type: 'array',
          items: 'post-response#'
        }
      }
    },
    handler: onGetPost
  })

  async function onGetPost (req, reply) {
    return postCol
      .find({ author: req.params.username })
      .toArray()
  }
}

module.exports.autoPrefix = '/user'
