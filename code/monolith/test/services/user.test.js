'use strict'

const { test } = require('tap')
const { build, close, createUser, basicAuth } = require('../helper')
const App = require('../../app')

test('Get the post created by a user', async t => {
  const fastify = await build(App)
  await createUser(fastify, 'delvedor', 'winteriscoming')

  var response = await fastify.inject({
    method: 'POST',
    url: '/post/create',
    headers: {
      authorization: basicAuth('delvedor', 'winteriscoming')
    },
    payload: {
      text: 'May the force be with you'
    }
  })

  t.strictEqual(response.statusCode, 201)
  const { id } = JSON.parse(response.payload)
  t.is(typeof id, 'string')

  response = await fastify.inject({
    method: 'GET',
    url: '/user/delvedor/post',
    headers: {
      authorization: basicAuth('delvedor', 'winteriscoming')
    }
  })

  t.strictEqual(response.statusCode, 200)
  const payload = JSON.parse(response.payload)
  t.is(typeof payload[0].time, 'number')
  delete payload[0].time
  t.deepEqual(payload, [{
    id,
    text: 'May the force be with you',
    author: 'delvedor'
  }])

  await close(fastify)
})

test('Get the post created by a user (multiple post)', async t => {
  const fastify = await build(App)
  await createUser(fastify, 'delvedor', 'winteriscoming')

  var response = await fastify.inject({
    method: 'POST',
    url: '/post/create',
    headers: {
      authorization: basicAuth('delvedor', 'winteriscoming')
    },
    payload: {
      text: 'May the force be with you',
      time: new Date().toISOString()
    }
  })
  t.strictEqual(response.statusCode, 201)

  response = await fastify.inject({
    method: 'POST',
    url: '/post/create',
    headers: {
      authorization: basicAuth('delvedor', 'winteriscoming')
    },
    payload: {
      text: 'They are taking the hobbits to isengard',
      time: new Date().toISOString()
    }
  })
  t.strictEqual(response.statusCode, 201)

  response = await fastify.inject({
    method: 'GET',
    url: '/user/delvedor/post',
    headers: {
      authorization: basicAuth('delvedor', 'winteriscoming')
    }
  })
  t.strictEqual(response.statusCode, 200)
  t.strictEqual(JSON.parse(response.payload).length, 2)

  await close(fastify)
})
