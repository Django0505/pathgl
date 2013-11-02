var compressor = require('uglify-js')
  , fs = require('fs')
  , source = './src/'
  , main = 'main.js'

Array.prototype.tap = function (fn) {
  fn.call(this)
  return this
}

build()
fs.watch('src', build)

function build(_, file) {
  var blob = fs.readdirSync(source)
             .filter(emacs)
             .sort()
             .tap(head)
             .map(concat)
             .join('')

    , closed = '+ function() {\n' + blob + ' }()'

  console.log('rebuilding ' + (file ? file : ''))

  try {
    fs.writeFileSync('dist/pathgl.js', closed)
    fs.writeFileSync('dist/pathgl.min.js',
                     compressor.minify(closed, { fromString: true }).code
                    )
  } catch (e) { console.log(e) }

}

function concat (file) {
  return '' + fs.readFileSync(source + file)
}


function emacs(file) {
  return ! /#/.test(file)
}

function head () {
  var i = this.indexOf(main)
  var js = this[i]
  this[i] = this[0]
  this[0] = js
}