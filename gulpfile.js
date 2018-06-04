'use strict'

const gulp = require('gulp')
const plumber = require('gulp-plumber')
const rename = require('gulp-rename')
const livereload = require('gulp-livereload')
const browserify = require('gulp-browserify')
const uglify = require('gulp-uglify')
const pug = require('gulp-pug')
const stylus = require('gulp-stylus')
const autoprefixer = require('gulp-autoprefixer')
const csso = require('gulp-csso')
const del = require('del')
const through = require('through')
const opn = require('opn')
const ghpages = require('gh-pages')
const path = require('path')
const http = require('http')
const serveStatic = require('serve-static')
const final = require('finalhandler')
const spawn = require('child_process').spawn
const isDist = process.argv.indexOf('serve') === -1

var server

gulp.task('clean', function () {
  return del('dist')
})

gulp.task('js', function () {
  return gulp.src('src/scripts/main.js')
    .pipe(isDist ? through() : plumber())
    .pipe(browserify({ debug: !isDist }))
    .pipe(isDist ? uglify() : through())
    .pipe(rename('build.js'))
    .pipe(gulp.dest('dist/build'))
    .pipe(livereload())
})

gulp.task('html', () => {
  return gulp.src('src/index.pug')
    .pipe(isDist ? through() : plumber())
    .pipe(pug({ pretty: true }))
    .pipe(rename('index.html'))
    .pipe(gulp.dest('dist'))
    .pipe(livereload())
})

gulp.task('css', function () {
  return gulp.src('src/styles/main.styl')
    .pipe(isDist ? through() : plumber())
    .pipe(stylus({
      // Allow CSS to be imported from node_modules and bower_components
      'include css': true,
      'paths': ['./node_modules']
    }))
    .pipe(autoprefixer('last 2 versions', { map: false }))
    .pipe(isDist ? csso() : through())
    .pipe(rename('build.css'))
    .pipe(gulp.dest('dist/build'))
    .pipe(livereload())
})

gulp.task('images', function () {
  return gulp.src('src/images/**/*')
    .pipe(gulp.dest('dist/images'))
    .pipe(livereload())
})

gulp.task('copy-html', function () {
  return gulp.src('src/*.html')
    .pipe(gulp.dest('dist/'))
    .pipe(livereload())
})

gulp.task('font-awesome', function () {
  return gulp.src('./node_modules/font-awesome/fonts/*')
    .pipe(gulp.dest('dist/fonts'))
    .pipe(livereload())
})

gulp.task('build', gulp.series('clean', gulp.parallel(['js', 'html', 'css', 'images', 'copy-html', 'font-awesome'])))

gulp.task('watch', function (done) {
  livereload.listen({ basePath: 'dist' })
  gulp.watch('src/**/*.pug', gulp.parallel('html'))
  gulp.watch('src/styles/**/*.styl', gulp.parallel('css'))
  gulp.watch('src/images/**/*', gulp.parallel('images'))
  gulp.watch('src/*.html', gulp.parallel('copy-html'))
  gulp.watch('src/scripts/**/*.js', gulp.parallel('js'))
  gulp.watch('bespoke-theme-*/dist/*.js', gulp.parallel('js')) // Allow themes to be developed in parallel
  done()
})

gulp.task('open', gulp.series('watch', function realOpen () {
  return opn('http://localhost:8080')
}))

gulp.task('server', (done) => {
  var serve = serveStatic('dist/', {'index': ['index.html', 'index.htm']})
  server = http.createServer(function (req, res) {
    serve(req, res, final(req, res))
  })

  server.listen(8080, done)
})

gulp.task('serve', gulp.series('build', 'server'))

gulp.task('open', gulp.series('serve', 'watch', 'open'))

gulp.task('default', gulp.series('build'))

gulp.task('deploy', gulp.series(['build', function _deploy (done) {
  ghpages.publish(path.join(__dirname, 'dist'), done)
}]))

gulp.task('pdf', gulp.series('build', 'server', function print () {
  return spawn(path.join(__dirname, 'node_modules', '.bin', 'decktape'), ['bespoke', 'http://localhost:8080', 'slides.pdf', '--size', '1280x720'], { stdio: 'inherit' })
}, function shutdown (done) {
  if (server) {
    server.close()
  }
  done()
}))
