'use strict'

const isDocker = require('is-docker')

module.exports = async function (fastify, opts) {
  fastify.register(require('fastify-http-proxy'), {
    upstream: `http://${isDocker() ? 'moo-user' : 'localhost'}:3032`,
    prefix: '/user',
    beforeHandler: fastify.basicAuth
  })
}
