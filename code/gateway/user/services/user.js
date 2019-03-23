'use strict'

module.exports = async function (fastify, opts) {
  const { elastic } = fastify

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
    const { username } = req.params
    const { body } = await elastic.search({
      index: 'moos',
      body: {
        query: { term: { 'author.keyword': username } }
      }
    })

    return body.hits.hits.map(h => h._source)
  }
}
