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
  // Basic authentication plugin
  fastify.register(require('fastify-basic-auth'), { validate })
  async function validate (username, password, req, reply) {
    // search the username inside the database
    const result = await this.elasticsearch.search({
      index: 'users',
      size: 1,
      ignore: [404],
      body: {
        query: { term: { 'username.keyword': username } }
      }
    })

    fastify.assert(result.hits !== null && result.hits.total > 0, 401)
    const user = result.hits.hits[0]._source

    // get the hashed password
    const hashedPassword = user.password
    this.assert(hashedPassword != null, 401)

    // verify if the given password is valid
    const valid = await this.bcrypt.compare(password, hashedPassword)
    this.assert(valid, 401)

    // store the authenticated user inside the headers
    req.headers['x-username'] = username
  }

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins')
  })

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'services')
  })
}
