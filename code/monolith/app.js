'use strict'

require('make-promises-safe')

const path = require('path')
const AutoLoad = require('fastify-autoload')
const bcrypt = require('bcrypt')

// This is our entry point, but we are exporting a functon
// and we are never calling `.listen`, why?
// Because `fastify-cli` is doing the legwork for us!
module.exports = async function (fastify, opts) {
  fastify
    .decorate('bcrypt', bcrypt)
    // Adds some useful utilities to Fastify
    .register(require('fastify-sensible'))
    // Basic authentication utility
    // it exposes a function to run the authentication
    // in `fastify.basicAuth`
    .register(require('fastify-basic-auth'), { validate })
    // Loads everything declared inside the plugins folder
    .register(AutoLoad, {
      dir: path.join(__dirname, 'plugins'),
      options: {
        elasticsearch: 'http://localhost:9200'
      }
    })
    // Loads everything declared inside the services folder
    .register(AutoLoad, {
      dir: path.join(__dirname, 'services')
    })
}

// `this` is the Fastify instance
async function validate (username, password, req, reply) {
  // search the username inside the database
  const { body, statusCode } = await this.elastic.search({
    index: 'users',
    size: 1,
    body: {
      query: { term: { 'username.keyword': username } }
    }
  }, {
    ignore: [404]
  })

  this.assert(statusCode === 200, 401)
  this.assert(body.hits.hits.length > 0, 401)
  const user = body.hits.hits[0]._source

  // get the hashed password
  const hashedPassword = user.password
  this.assert(hashedPassword != null, 401)

  // verify if the given password is valid
  const valid = await this.bcrypt.compare(password, hashedPassword)
  this.assert(valid, 401)

  // store the authenticated user inside the headers
  req.headers['x-username'] = username
}
