'use strict'

const App = require('../app')
const Fastify = require('fastify')
const fp = require('fastify-plugin')
const bcrypt = require('bcrypt')
const saltRounds = 10

async function build (plugin) {
  const fastify = Fastify()
  fastify
    .register(fp(App))
    .after((err, instance, done) => {
      if (err) throw err
      instance.elasticsearch.indices.delete({ index: '*', ignore: 404 }, err => {
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
  await fastify.elasticsearch.index({
    index: 'users',
    type: '_doc',
    refresh: 'wait_for',
    body: { username, password: hashedPassword }
  })
}

function basicAuth (username, password) {
  return 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

module.exports = { build, close, createUser, basicAuth, sleep }
