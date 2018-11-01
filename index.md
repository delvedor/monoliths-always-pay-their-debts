<!--
bodyclass intro-background
class border-left copyright-right intro-title
-->

# MONOLITHS<br/>ALWAYS<br/>PAY THEIR<br/>DEBTS

[@delvedor](https://twitter.com/delvedor)

---
<!--
class center center-image copyright-right
-->

![delvedor](images/delvedor.png)

[@delvedor](https://twitter.com/delvedor)

---
<!--
class small
-->

![elastic-logo-light](images/elastic-logo-light.png)

---
<!--
class colored-li small
-->

# Roadmap*.*
- Monoliths vs Microservices
- Fastify
- Let's build our new startup!

---
<!--
class center
-->

# Monoliths vs Microservices
![monoliths-vs-microservices](images/monoliths-vs-microservices.png)

---
<!--
bodyclass fastify-background
class copyright-right
-->

![fastify-logo](images/fastify-white-landscape.png)

[fastify.io](http://fastify.io/)


---
<!--
class copyright-right
-->

```js
const fastify = require('fastify')()

fastify.get('/', async (request, reply) => {
  return { hello: 'world' }
})

fastify.listen(3000)
```

[fastify.io](http://fastify.io/)

---
<!--
class center benchmarks-image
-->

![benchmarks](images/benchmarks.png)

---
<!--
class nobreak
-->

# Fastify *Plugins*
A brief overview

---

---

```js
fastify.register(
  require('my-plugin'),
  { options }
)
```

---
<!--
class row async-plugin
-->

```js
function myPlugin (fastify, opts, next) {
  // register other plugins
  fastify.register(...)

  // add hooks
  fastify.addHook(...)

  // add decorator
  fastify.decorate(...)

  // add routes
  fastify.route(...)

  next()
}

module.exports = myPlugin
```

### *async await*<br/>is supported as well!

---
<!--
class center small-image
-->

# Plugins: *Architecture*
![dag](images/dag.png)

---
<!--
class center small-image
-->

# Plugins: *Encapsulation*
![dag-decorate](images/dag-decorate.png)

---

### Exposing functionality to *parents*
```js
const fp = require('fastify-plugin')

async function myPlugin (fastify, options) {
  fastify.decorate('util', yourAwesomeUtility)
  // now you can use it with `fastify.util`
}

module.exports = fp(myPlugin)
```

---
<!--
class center small-image
-->

# Plugins: *Encapsulation*
![dag-fp-encapsulate](images/dag-fp-encapsulate.png)

---
<!--
class center small-image
-->

# Plugins: Real world
![plugin-real-world](images/plugin-real-world.png)

---

### *Encapsulation* enables many great things
### such as custom `log-level` per plugin

<br/>

```js
const fastify = require('fastify')()

fastify.register(require('./api/v1'), {
  prefix: '/v1',
  logLevel: 'error'
})

fastify.register(require('./api/v2'), {
  prefix: '/v2',
  logLevel: 'debug'
})
```
---
<!--
class boxed-em
-->

# *Everything* is a plugin

---
<!--
class small colored-li
-->

# Let's *build* our new startup!
Let's build the next billion dollar startup, *Moo*!

Basically Twitter, but with more characters and *cows*.

A user should be able to:
- Signup!
- Post a new moo
- Get a moo by id
- Get all the moos of a user

---
<!--
class small
-->

### Let's *build* our new startup!
The API will expose three different services, *login*, *moo* and *user*.

```txt
/signup
/moo/:id
/moo/create
/user/:username/moos
```

---
<!--
class small
-->

# A little bit of configuration
Being *consistent* across microservices is a difficult task,<br/>to *help you* Fastify provides a powerful CLI.

```bash
npm install fastify-cli -g

mkdir moo-project
cd moo-project

npm init -y
fastify generate
```

---
<!--
class small
-->

# Project structure
- *app.js*: your entry point;
- *services*: the folder where you will declare all your endpoints;
- *plugins*: the folder where you will store all your custom plugins;
- *test*: the folder where you will declare all your test.

---
<!--
class small
-->

# Scripts
- *`npm start`*: run your server;
- *`npm run dev`*: run your server with pretty logs
(not suitable for production);
- *`npm test`*: run your test suite.

---
<!--
bodyclass hack-background
class white-text nobreak
-->

# “Let's the hack begin”

---
<!--
class small
-->

# Let's take a look at our *monolith*

---

![monolith](images/monolith-infra.png)

---

# From monolith to *microservices*
### Let's begin*!*

---
<!--
class demo center
-->

# DEMO

---

![monolith](images/services-infra.png)

---
<!--
class clients center
-->

# Awesome!
Now update *all your clients* so they know which address to call based on the service they need to use.

![clients](images/clients.gif)

---
<!--
class boxed-em
-->

# *WRONG!*

---
<!--
class small
-->

# The infrastructure<br/>should be *transparent*<br/>to the client.

---
<!--
class small
-->

# Gateway

---
<!--
class gateway-image center
-->

![gateway](images/gateway-infra.png)

---

```bash
npm install fastify-http-proxy
```

```js
fastify.register(require('fastify-http-proxy'), {
  upstream: 'http://localhost:3030',
  prefix: '/post'
})
```

---
<!--
class demo center
-->

# DEMO

---
<!--
class small
-->

# Let's talk about *authentication*

There is *no need to duplicate* the authentication logic across the microservices, you can delegate to the gateway this *responsability*.

---
<!--
class demo center
-->

# DEMO

---
<!--
bodyclass intro-background
class copyright-right small
-->

# Thanks!

[@delvedor](https://twitter.com/delvedor)
