'use strict'

const bcrypt = require('bcrypt')
const saltRounds = 10

module.exports = async function (fastify, opts) {
  const { assert, mongo } = fastify
  const usersCol = mongo.db.collection('users')

  fastify.route({
    method: 'POST',
    url: '/signup',
    schema: {
      description: 'Endpoint to register a new user',
      body: 'user-login#'
    },
    handler: onSignup
  })

  async function onSignup (req, reply) {
    const { username, password } = req.body

    const user = await usersCol.findOne({ username })
    assert(user === null, 400, `The user '${username}' already exists`)

    const hashedPassword = await bcrypt.hash(password, saltRounds)
    await usersCol.insertOne({ username, password: hashedPassword })

    reply.code(201)
    return { status: 'ok' }
  }
}
