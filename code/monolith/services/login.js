'use strict'

const saltRounds = 10

module.exports = async function (fastify, opts) {
  const { assert, elastic, bcrypt } = fastify

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
    const { statusCode } = await elastic.search({
      index: 'users',
      size: 1,
      body: {
        query: { term: { 'username.keyword': username } }
      }
    }, {
      ignore: [404]
    })

    assert(
      statusCode === 404, 400,
      `The user '${username}' already exists`
    )

    const hashedPassword = await bcrypt.hash(password, saltRounds)
    await elastic.index({
      index: 'users',
      refresh: 'wait_for',
      body: { username, password: hashedPassword }
    })

    reply.code(201)
    return { status: 'ok', token: basicAuth(username, password) }
  }

  function basicAuth (username, password) {
    return 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')
  }
}
