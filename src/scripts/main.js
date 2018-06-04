var bespoke = require('bespoke')
var classes = require('bespoke-classes')
var keys = require('bespoke-keys')
var touch = require('bespoke-touch')
var bullets = require('bespoke-bullets')
var backdrop = require('bespoke-backdrop')
var scale = require('bespoke-scale')
var hash = require('bespoke-hash')
var progress = require('bespoke-progress')
var multimedia = require('bespoke-multimedia')
var run = require('bespoke-run')
var extern = require('bespoke-extern')

// Bespoke.js
bespoke.from('article', [
  classes(),
  keys(),
  touch(),
  run(),
  bullets('li, .bullet'),
  backdrop(),
  scale(),
  hash(),
  progress(),
  multimedia(),
  extern()
])

// Prism syntax highlighting
require('prismjs')
