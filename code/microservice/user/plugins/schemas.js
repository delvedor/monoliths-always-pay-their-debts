'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, opts) {
  fastify.addSchema({
    $id: 'user-login',
    type: 'object',
    properties: {
      username: {
        type: 'string',
        minLength: 3,
        maxLength: 50
      },
      password: {
        type: 'string',
        minLength: 3,
        maxLength: 50
      }
    },
    required: ['username', 'password']
  })

  fastify.addSchema({
    $id: 'post-id',
    type: 'object',
    properties: {
      id: {
        type: 'string',
        minLength: 3,
        maxLength: 50
      }
    },
    required: ['id']
  })

  fastify.addSchema({
    $id: 'username',
    type: 'object',
    properties: {
      username: {
        type: 'string',
        minLength: 3,
        maxLength: 50
      }
    },
    required: ['username']
  })

  fastify.addSchema({
    $id: 'post-response',
    type: 'object',
    properties: {
      id: { type: 'string' },
      text: { type: 'string' },
      time: { type: 'string' },
      author: { type: 'string' }
    }
  })

  fastify.addSchema({
    $id: 'create-post',
    type: 'object',
    properties: {
      text: {
        type: 'string',
        maxLength: 1000
      },
      time: {
        type: 'string'
      }
    },
    required: ['text', 'time']
  })
})
