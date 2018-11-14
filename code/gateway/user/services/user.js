'use strict'

module.exports = async function (fastify, opts) {
  const { elasticsearch } = fastify

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
    const result = await elasticsearch.search({
      index: 'moos',
      body: {
        query: { term: { 'author.keyword': username } }
      }
    })

    return result.hits.hits.map(h => h._source)
  }
}
