'use strict'

const Hyperid = require('hyperid')

module.exports = async function (fastify, opts) {
  const { assert, mongo } = fastify
  const postCol = mongo.db.collection('post')
  const hyperid = Hyperid({ urlSafe: true })

  fastify.addHook('preHandler', fastify.basicAuth)

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

    const post = await postCol.findOne({ id })
    assert(post !== null, 404)

    return post
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
    await postCol.insertOne({ author, id, text, time })
    reply.code(201)
    return { id }
  }
}

// autoload will automtically add this prefix to all the registered routes
// if you want to avoid this, just remove the following line
module.exports.autoPrefix = '/post'
