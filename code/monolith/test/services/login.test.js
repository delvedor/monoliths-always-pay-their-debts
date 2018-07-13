'use strict'

const { test } = require('tap')
const { build, close, createUser, basicAuth } = require('../helper')
const bcrypt = require('bcrypt')
const App = require('../../app')

test('Should create a new user', async t => {
  const fastify = await build(App)
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

  const user = await fastify.mongo.db.collection('users')
    .findOne({ username: 'delvedor' })

  t.ok(user !== null)
  t.is(typeof user.username, 'string')
  t.is(typeof user.password, 'string')
  t.true(await bcrypt.compare('winteriscoming', user.password))

  await close(fastify)
})

test('If a user already exists, should return a 400', async t => {
  const fastify = await build(App)
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
  const fastify = await build(App)
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
