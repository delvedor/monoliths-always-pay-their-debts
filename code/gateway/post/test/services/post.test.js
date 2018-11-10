'use strict'

const { test } = require('tap')
const { build, close, createUser, basicAuth } = require('../helper')
const App = require('../../app')

test('Should be able to create a post', async t => {
  const fastify = await build(App)
  await createUser(fastify, 'delvedor', 'winteriscoming')

  const time = new Date().toISOString()
  const response = await fastify.inject({
    method: 'POST',
    url: '/post/create',
    headers: {
      authorization: basicAuth('delvedor', 'winteriscoming')
    },
    payload: {
      text: 'May the force be with you',
      time
    }
  })

  t.strictEqual(response.statusCode, 201)
  const payload = JSON.parse(response.payload)
  t.is(typeof payload.id, 'string')

  const post = await fastify.mongo.db.collection('post')
    .findOne({ id: payload.id }, { _id: 0 })

  delete post._id
  t.deepEqual(post, {
    time,
    text: 'May the force be with you',
    author: 'delvedor',
    id: payload.id
  })

  await close(fastify)
})

test('Get a post by id', async t => {
  const fastify = await build(App)
  await createUser(fastify, 'delvedor', 'winteriscoming')

  const time = new Date().toISOString()
  var response = await fastify.inject({
    method: 'POST',
    url: '/post/create',
    headers: {
      authorization: basicAuth('delvedor', 'winteriscoming')
    },
    payload: {
      text: 'May the force be with you',
      time
    }
  })

  t.strictEqual(response.statusCode, 201)
  const { id } = JSON.parse(response.payload)

  response = await fastify.inject({
    method: 'GET',
    url: `/post/${id}`,
    headers: {
      authorization: basicAuth('delvedor', 'winteriscoming')
    }
  })

  t.strictEqual(response.statusCode, 200)
  t.deepEqual(JSON.parse(response.payload), {
    time,
    id,
    text: 'May the force be with you',
    author: 'delvedor'
  })

  await close(fastify)
})

test('Get a post by id (404)', async t => {
  const fastify = await build(App)
  await createUser(fastify, 'delvedor', 'winteriscoming')

  const response = await fastify.inject({
    method: 'GET',
    url: '/post/abcd',
    headers: {
      authorization: basicAuth('delvedor', 'winteriscoming')
    }
  })

  t.strictEqual(response.statusCode, 404)
  t.deepEqual(JSON.parse(response.payload), {
    error: 'Not Found',
    message: 'The post with id \'abcd\' does not exists',
    statusCode: 404
  })

  await close(fastify)
})
