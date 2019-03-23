'use strict'

const Hyperid = require('hyperid')

module.exports = async function (fastify, opts) {
  const { elastic } = fastify
  const hyperid = Hyperid({ urlSafe: true })

  fastify.addHook('preHandler', fastify.basicAuth)

  fastify.route({
    method: 'GET',
    url: '/post/:id',
    schema: {
      description: 'Get a post by its id',
      params: 'post-id#',
      response: {
        200: 'post-response#'
      }
    },
    handler: onGetPost
  })

  async function onGetPost (req, reply) {
    const { body, statusCode } = await elastic.get({
      index: 'moos',
      id: req.params.id
    }, {
      ignore: [404]
    })

    if (statusCode === 404) {
      reply.code(404)
      return new Error('Not Found')
    }

    return body._source
  }

  fastify.route({
    method: 'GET',
    url: '/post',
    schema: {
      description: 'Search a post',
      querystring: 'post-search#',
      response: {
        200: {
          type: 'array',
          items: 'post-response#'
        }
      }
    },
    handler: onSearchPost
  })

  async function onSearchPost (req, reply) {
    const { search } = req.query

    const { body } = await elastic.search({
      index: 'moos',
      body: {
        query: { match: { text: search } }
      }
    })

    return body.hits.hits.map(h => h._source)
  }

  fastify.route({
    method: 'POST',
    url: '/post/create',
    schema: {
      description: 'Create a new post',
      headers: {
        'x-username': {
          type: 'string',
          minLength: 3,
          maxLength: 50
        }
      },
      body: 'create-post#'
    },
    handler: onCreate
  })

  async function onCreate (req, reply) {
    const { text } = req.body
    const author = req.headers['x-username']
    const time = Date.now()
    const id = hyperid()

    await elastic.index({
      index: 'moos',
      id,
      body: { author, id, text, time }
    })

    reply.code(201)
    return { id }
  }
}
