'use strict'

require('make-promises-safe')

const path = require('path')
const AutoLoad = require('fastify-autoload')
const isDocker = require('is-docker')

module.exports = async function (fastify, opts) {
  // Adds some useful utilities to Fastify
  fastify.register(require('fastify-sensible'))
  // MongoDB connector
  fastify.register(require('fastify-mongodb'), {
    url: `mongodb://${isDocker() ? 'mongo:27017' : '127.0.0.1:27017'}/moo`,
    useNewUrlParser: true
  })

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins')
  })

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'services')
  })
}
