'use strict'

const isDocker = require('is-docker')

module.exports = async function (fastify, opts) {
  fastify.register(require('fastify-http-proxy'), {
    upstream: `http://${isDocker() ? 'moo-login' : 'localhost'}:3030`,
    prefix: '/signup'
  })
}
