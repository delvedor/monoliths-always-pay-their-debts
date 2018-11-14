'use strict'

require('make-promises-safe')

const path = require('path')
const AutoLoad = require('fastify-autoload')
const bcrypt = require('bcrypt')
const isDocker = require('is-docker')

module.exports = async function (fastify, opts) {
  // Adds some useful utilities to Fastify
  fastify.register(require('fastify-sensible'))

  // Elasticsearch connector
  fastify.register(require('fastify-elasticsearch'), {
    host: `http://${isDocker() ? 'elasticsearch' : 'localhost'}:9200`,
    apiVersion: '6.4'
  })

  fastify.decorate('bcrypt', bcrypt)

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins')
  })

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'services')
  })
}
