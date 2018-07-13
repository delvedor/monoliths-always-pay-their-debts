'use strict'

const Fastify = require('fastify')
const bcrypt = require('bcrypt')
const mongoClean = require('mongo-clean')
const saltRounds = 10

async function build (plugin) {
  const fastify = Fastify()

  fastify
    // register our application
    .register(plugin)
    // register the databse connector so we can use it inside the test
    .register(require('fastify-mongodb'), {
      url: 'mongodb://127.0.0.1:27017/moo',
      useNewUrlParser: true
    })
    // clean the database before run the test
    .after((err, instance, done) => {
      if (err) throw err
      mongoClean(instance.mongo.db, done)
    })

  // wait the everything is ready before run the test
  await fastify.ready()
  return fastify
}

async function close (fastify) {
  await fastify.close()
}

async function createUser (fastify, username, password) {
  const usersCol = fastify.mongo.db.collection('users')
  const hashedPassword = await bcrypt.hash(password, saltRounds)
  await usersCol.insertOne({ username, password: hashedPassword })
}

function basicAuth (username, password) {
  return 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')
}

module.exports = { build, close, createUser, basicAuth }
