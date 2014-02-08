var compressor = require('uglify-js')
  , marked = require('marked')

  , fs = require('fs')
  , http = require('http')
  , path = require('path')
  , source = './src/'
  , main = 'main.js'
  , port = 1234

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false
})

var connections = []

build('','')
fs.watch('src', build)
fs.watch('examples', build)
http.createServer(live_reloader).listen(port)
console.log('watching for file save on port ' + port)

;['src', 'examples', 'lib', 'documentation']
 .forEach(function (dir) {
   console.log('watching ' + dir + '/')
   fs.readdirSync(dir).forEach(function (name) {
     var count = 0
     fs.watch(dir + '/' + name, function (type) { (++count % 2) || process.emit('write_file') })
   })
 })

var elapsed = new Date()
function build(_, file) {
  var blob = [ 'start.js'
             , 'color.js'
             , 'shaders.js'
             , 'init.js'
             , 'parse.js'
             , 'points.js'
             , 'lines.js'
             , 'polygons.js'
             , 'queryselector.js'
             , 'proxy.js'
             , 'render.js'
             , 'util.js'
             , 'end.js'
             ].map(read).join(';')
    , closed = '! function() {\n' + blob + ' }()'

  if((Date.now() - elapsed) < 2000) return
  elapsed = Date.now()

  console.log('rebuilding ' + (file ? file : ''))

  try {
    if (! fs.existsSync('dist/')) fs.mkdirSync('dist/')
    fs.writeFileSync('dist/pathgl.js', closed)
    fs.writeFileSync('dist/pathgl.min.js',
                     compressor.minify(closed, { fromString: true }).code
                    )
  } catch (e) { console.log(e) }

  fs.readdirSync('examples').filter(isType('.js')).filter(hash)
  .forEach(function (abc) {
    var file = template('<script>' + fs.readFileSync('examples/' + abc) + '</script>')
    fs.writeFileSync('examples/' + abc.replace('.js', '.html'), file)
  })

  fs.readdirSync('documentation').filter(isType('.md')).filter(hash)
  .forEach(function (abc) {
    var file = template(fs.readFileSync('documentation/' + abc))
    fs.writeFileSync('documentation/' + abc.replace('.md', '.html'), file)
  })
}

function read (file) {
  return '' + fs.readFileSync(source + file)
}

function hash(str) {
  return ! str.match('#')
}

function live_reloader(req, res) {
  console.log('connection received')
  connections.push(res)
}

process.on('write_file', function () {
  while(connections.length) connections.pop().end()
})

function isType(wow) {
  return function (d) {
    return path.extname(d) == wow
  }
}

function template (str) {
  return fs.readFileSync('index.html').toString().replace('<!--xxx-->', str)
}