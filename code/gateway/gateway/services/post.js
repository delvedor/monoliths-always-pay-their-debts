'use strict'

const isDocker = require('is-docker')

module.exports = async function (fastify, opts) {
  fastify.register(require('fastify-http-proxy'), {
    upstream: `http://${isDocker() ? 'moo-post' : 'localhost'}:3031`,
    prefix: '/post',
    beforeHandler: fastify.basicAuth
  })
}
