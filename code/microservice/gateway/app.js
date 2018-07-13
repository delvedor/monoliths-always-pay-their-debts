'use strict'

require('make-promises-safe')

const path = require('path')
const AutoLoad = require('fastify-autoload')
const bcrypt = require('bcrypt')
const isDocker = require('is-docker')

module.exports = async function (fastify, opts) {
  // Adds some useful utilities to Fastify
  fastify.register(require('fastify-sensible'))

  // MongoDB connector
  fastify.register(require('fastify-mongodb'), {
    url: `mongodb://${isDocker() ? 'mongo:27017' : '127.0.0.1:27017'}/moo`,
    useNewUrlParser: true
  })

  // Basic authentication plugin
  fastify.register(require('fastify-basic-auth'), { validate })
  async function validate (username, password, req, reply) {
    // search the username inside the database
    const user = await fastify.mongo.db.collection('users')
      .findOne({ username })
    fastify.assert(user !== null, 401)

    // get the hashed password
    const hashedPassword = user.password
    fastify.assert(hashedPassword != null, 401)

    // verify if the given password is valid
    const valid = await bcrypt.compare(password, hashedPassword)
    fastify.assert(valid, 401)

    // store the authenticated user inside the headers
    req.headers['x-username'] = username
  }

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'services')
  })
}
