'use strict'

const { test } = require('tap')
const { build, close, createUser, basicAuth, sleep } = require('../helper')

test('Should be able to create a post', async t => {
  const fastify = await build()
  await createUser(fastify, 'delvedor', 'winteriscoming')

  const response = await fastify.inject({
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
  const payload = JSON.parse(response.payload)
  t.is(typeof payload.id, 'string')

  const result = await fastify.elasticsearch.get({
    index: 'moos',
    type: '_doc',
    id: payload.id
  })
  const post = result._source

  delete post._id
  t.is(typeof post.time, 'number')
  delete post.time
  t.deepEqual(post, {
    text: 'May the force be with you',
    author: 'delvedor',
    id: payload.id
  })

  await close(fastify)
})

test('Get a post by id', async t => {
  const fastify = await build()
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
  const payload = JSON.parse(response.payload)
  t.is(typeof payload.time, 'number')
  delete payload.time
  t.deepEqual(payload, {
    id,
    text: 'May the force be with you',
    author: 'delvedor'
  })

  await close(fastify)
})

test('Get a post by id (404)', async t => {
  const fastify = await build()
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
    message: 'Not Found',
    statusCode: 404
  })

  await close(fastify)
})

test('Search a post', async t => {
  const fastify = await build()
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

  await sleep(1000)

  response = await fastify.inject({
    method: 'GET',
    url: '/post?search=force',
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
