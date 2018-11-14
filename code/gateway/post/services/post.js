'use strict'

const Hyperid = require('hyperid')

module.exports = async function (fastify, opts) {
  const { elasticsearch } = fastify
  const hyperid = Hyperid({ urlSafe: true })

  fastify.route({
    method: 'GET',
    url: '/:id',
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
    const { id } = req.params

    const result = await elasticsearch.get({
      index: 'moos',
      type: '_doc',
      id
    })

    return result._source
  }

  fastify.route({
    method: 'GET',
    url: '/',
    schema: {
      description: 'Get a post by its id',
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

    const result = await elasticsearch.search({
      index: 'moos',
      type: '_doc',
      body: {
        query: { match: { text: search } }
      }
    })

    return result.hits.hits.map(h => h._source)
  }

  fastify.route({
    method: 'POST',
    url: '/create',
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
    await elasticsearch.index({
      index: 'moos',
      type: '_doc',
      id,
      body: { author, id, text, time }
    })

    reply.code(201)
    return { id }
  }
}
