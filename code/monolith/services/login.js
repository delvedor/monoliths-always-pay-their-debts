'use strict'

const saltRounds = 10

module.exports = async function (fastify, opts) {
  const { assert, elasticsearch, bcrypt } = fastify

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

    const result = await elasticsearch.search({
      index: 'users',
      size: 1,
      ignore: [404],
      body: {
        query: { term: { 'username.keyword': username } }
      }
    })
    assert(
      result.hits == null || result.hits.total === 0, 400,
      `The user '${username}' already exists`
    )

    const hashedPassword = await bcrypt.hash(password, saltRounds)
    await elasticsearch.index({
      index: 'users',
      type: '_doc',
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
