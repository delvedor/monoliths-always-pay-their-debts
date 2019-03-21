'use strict'

const fp = require('fastify-plugin')
const { Client } = require('@elastic/elasticsearch')

async function elasticsearchPlugin (fastify, opts) {
  const client = new Client({
    node: opts.elasticsearch
  })

  fastify.decorate('elastic', client)

  try {
    await client.ping()
  } catch (err) {
    fastify.log.error(err)
    throw new Error('Cannot connect to Elasticsearch')
  }
}

module.exports = fp(elasticsearchPlugin)
