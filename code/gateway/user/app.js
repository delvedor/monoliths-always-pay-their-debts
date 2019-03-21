'use strict'

require('make-promises-safe')

const path = require('path')
const AutoLoad = require('fastify-autoload')
const bcrypt = require('bcrypt')
const isDocker = require('is-docker')

module.exports = async function (fastify, opts) {
  fastify
    .decorate('bcrypt', bcrypt)
    // Adds some useful utilities to Fastify
    .register(require('fastify-sensible'))
    // Loads everything declared inside the plugins folder
    .register(AutoLoad, {
      dir: path.join(__dirname, 'plugins'),
      options: {
        elasticsearch: `http://${isDocker() ? 'elasticsearch' : 'localhost'}:9200`
      }
    })
    // Loads everything declared inside the services folder
    .register(AutoLoad, {
      dir: path.join(__dirname, 'services')
    })
}
