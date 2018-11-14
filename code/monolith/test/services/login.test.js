'use strict'

const { test } = require('tap')
const { build, close, createUser, basicAuth } = require('../helper')
const bcrypt = require('bcrypt')

test('Should create a new user', async t => {
  const fastify = await build()
  const response = await fastify.inject({
    method: 'POST',
    url: '/signup',
    payload: {
      username: 'delvedor',
      password: 'winteriscoming'
    }
  })

  t.strictEqual(response.statusCode, 201)
  t.deepEqual(
    JSON.parse(response.payload),
    { status: 'ok', token: basicAuth('delvedor', 'winteriscoming') }
  )

  const result = await fastify.elasticsearch.search({
    index: 'users',
    size: 1,
    ignore: [404],
    body: {
      query: { term: { 'username.keyword': 'delvedor' } }
    }
  })
  const user = result.hits.hits[0]._source

  t.ok(user !== null)
  t.is(typeof user.username, 'string')
  t.is(typeof user.password, 'string')
  t.true(await bcrypt.compare('winteriscoming', user.password))

  await close(fastify)
})

test('If a user already exists, should return a 400', async t => {
  const fastify = await build()
  await createUser(fastify, 'delvedor', 'winteriscoming')

  const response = await fastify.inject({
    method: 'POST',
    url: '/signup',
    payload: {
      username: 'delvedor',
      password: 'winteriscoming'
    }
  })

  t.strictEqual(response.statusCode, 400)
  t.deepEqual(JSON.parse(response.payload), {
    error: 'Bad Request',
    message: 'The user \'delvedor\' already exists',
    statusCode: 400
  })

  await close(fastify)
})

test('Should return a 400 on bad parameters', async t => {
  const fastify = await build()
  var response = await fastify.inject({
    method: 'POST',
    url: '/signup',
    payload: {
      username: 'delvedor'
    }
  })
  t.strictEqual(response.statusCode, 400)
  t.deepEqual(JSON.parse(response.payload), {
    error: 'Bad Request',
    message: 'body should have required property \'password\'',
    statusCode: 400
  })

  response = await fastify.inject({
    method: 'POST',
    url: '/signup',
    payload: {
      username: 'delvedor',
      password: 'a'
    }
  })
  t.strictEqual(response.statusCode, 400)
  t.deepEqual(JSON.parse(response.payload), {
    error: 'Bad Request',
    message: 'body.password should NOT be shorter than 3 characters',
    statusCode: 400
  })

  await close(fastify)
})
