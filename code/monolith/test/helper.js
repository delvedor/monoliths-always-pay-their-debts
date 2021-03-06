'use strict'

const App = require('../app')
const Fastify = require('fastify')
const fp = require('fastify-plugin')
const bcrypt = require('bcrypt')
const saltRounds = 10

// build the server in the same way as `fastify-cli` is doing
async function build (plugin) {
  // create a  Fastify instance
  const fastify = Fastify()
  fastify
    // register our entire application
    .register(fp(App))
    // if there is some error (eg: database not available)
    // let's crash right away
    .after((err, instance, done) => {
      if (err) throw err
      // for the sake of the test, let's delete everything
      instance.elastic.indices.delete(
        { index: '*' }, { ignore: 404 }, err => {
          if (err) throw err
          done()
        })
    })

  // wait the everything is ready before run the test
  await fastify.ready()
  return fastify
}

async function close (fastify) {
  await fastify.close()
}

async function createUser (fastify, username, password) {
  const hashedPassword = await bcrypt.hash(password, saltRounds)
  await fastify.elastic.index({
    index: 'users',
    refresh: 'wait_for',
    body: { username, password: hashedPassword }
  })
}

function basicAuth (username, password) {
  return 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

module.exports = { build, close, createUser, basicAuth, sleep }
