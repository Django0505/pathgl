! function() {
pathgl.shaderParameters = {
  rgb: [0, 0, 0, 0]
, translate: [0, 0]
, time: [0]
, rotation: [0, 1]
, opacity: [1]
, resolution: [0, 0]
, scale: [1, 1]
, mouse: pathgl.mouse = [0, 0]
}

pathgl.fragment = [ "precision mediump float;"
                  , "uniform vec4 rgb;"
                  , "uniform float time;"
                  , "uniform float opacity;"
                  , "uniform vec2 resolution;"

                  , "void main(void) {"
                  , "  gl_FragColor = vec4(rgb.xyz, opacity);"
                  , "}"
                  ].join('\n')

pathgl.vertex = [ "precision mediump float;"
                , "attribute vec3 aVertexPosition;"
                , "uniform vec2 translate;"
                , "uniform vec2 resolution;"
                , "uniform vec2 rotation;"
                , "uniform vec2 scale;"

                , "void main(void) {"

                , "vec3 pos = aVertexPosition;"
                , "pos.y = resolution.y - pos.y;"

                , "vec3 scaled_position = pos * vec3(scale, 1.0);"

                , "vec2 rotated_position = vec2(scaled_position.x * rotation.y + scaled_position.y * rotation.x, "
                + "scaled_position.y * rotation.y - scaled_position.x * rotation.x);"

                , "vec2 position = vec2(rotated_position.x + translate.x, rotated_position.y - translate.y);"

                , "vec2 zeroToOne = position / resolution;"
                , "vec2 zeroToTwo = zeroToOne * 2.0;"
                , "vec2 clipSpace = zeroToTwo - 1.0;"

                , "gl_Position = vec4(clipSpace, 1, 1);"

                , "}"
                ].join('\n')
;this.pathgl = pathgl

pathgl.supportedAttributes =
  [ 'd'
  , 'stroke'
  , 'strokeWidth'
  , 'fill'
  ]

function pathgl(canvas) {
  var gl, program, programs
  canvas = 'string' == typeof canvas ? document.querySelector(canvas) :
    canvas instanceof d3.selection ? canvas.node() :
    canvas
;function init(c) {
  canvas = c
  programs = canvas.programs = (canvas.programs || {})
  pathgl.shaderParameters.resolution = [canvas.width, canvas.height]
  gl = initContext(canvas)
  initShaders(pathgl.fragment, '_identity')
  override(canvas)
  d3.select(canvas).on('mousemove.pathgl', mousemoved)
  d3.timer(function (elapsed) {
    //if (canvas.__rerender__ || pathgl.forceRerender)
    each(programs, function (program, key) {
      gl.useProgram(program)
      program.time && gl.uniform1f(program.time, pathgl.time = elapsed / 1000)
      program.mouse && gl.uniform2fv(program.mouse, pathgl.mouse)
      //return canvas.stopRendering
    })
    canvas.__scene__.forEach(drawPath)
    canvas.__rerender__ = false
  })
  return gl ? canvas : null
}

function mousemoved() {
  var m = d3.mouse(this)
  pathgl.mouse = [m[0] / innerWidth, m[1] / innerHeight]
}

function override(canvas) {
  return extend(canvas, {
    appendChild: appendChild
  , querySelectorAll: querySelectorAll
  , querySelector: querySelector
  , removeChild: removeChild
  , insertBefore: insertBefore

  , gl: gl
  , __scene__: []
  , __pos__: []
  , __id__: 0
  , __program__: void 0
  })
}

function compileShader (type, src) {
  var shader = gl.createShader(type)
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (! gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw src + ' ' + gl.getShaderInfoLog(shader)
  return shader
}

window.initShaders = initShaders
function initShaders(fragment, name) {
  if (programs[name]) return program = programs[name]

  program = gl.createProgram()

  var vertexShader = compileShader(gl.VERTEX_SHADER, pathgl.vertex)
  var fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragment)

  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)

  gl.linkProgram(program)
  gl.useProgram(program)

  if (! gl.getProgramParameter(program, gl.LINK_STATUS)) throw name + ': ' + gl.getProgramInfoLog(program)

  each(pathgl.shaderParameters, bindUniform)
  program.vertexPosition = gl.getAttribLocation(program, "aVertexPosition")
  gl.enableVertexAttribArray(program.vertexPosition)

  program.name = name

  return programs[name] = program
}

function bindUniform(val, key) {
  program[key] = gl.getUniformLocation(program, key)
  if (val) gl['uniform' + val.length + 'fv'](program[key], val)
}

function initContext(canvas) {
  var gl = canvas.getContext('webgl')
  return gl && extend(gl, { viewportWidth: canvas.width, viewportHeight: canvas.height })
}
;  var methods = { m: moveTo
                , z: closePath
                , l: lineTo

                , h: horizontalLine
                , v: verticalLine
                , c: curveTo
                , s: shortCurveTo
                , q: quadraticBezier
                , t: smoothQuadraticBezier
                , a: elipticalArc
                }

function horizontalLine() {}
function verticalLine() {}
function curveTo() {}
function shortCurveTo() {}
function quadraticBezier() {}
function smoothQuadraticBezier () {}
function elipticalArc(){}

function group(coords) {
  var s = []
  twoEach(coords, function (a, b) { s.push([a, b, 0]) })
  return s
}

function parse (str) {
  var path = addToBuffer(this)

  if (path.length) return render()

  str.match(/[a-z][^a-z]*/ig).forEach(function (segment, i, match) {
    var instruction = methods[segment[0].toLowerCase()]
      , coords = segment.slice(1).trim().split(/,| /g)

    ;[].push.apply(path.coords, group(coords))
    if (! instruction) return
    if (instruction.name == 'closePath' && match[i+1]) return instruction.call(path, match[i+1])

    if ('function' == typeof instruction)
      coords.length == 1 ? instruction.call(path) : twoEach(coords, instruction, path)
    else
      console.error(instruction + ' ' + segment[0] + ' is not yet implemented')
  })
}

function moveTo(x, y) {
  pos = [x, y]
}

var subpathStart
function closePath(next) {
  subpathStart = pos
  lineTo.apply(this, /m/i.test(next) ? next.slice(1).trim().split(/,| /g) : this.coords[0])
}


function lineTo(x, y) {
  addLine.apply(this, pos.concat(pos = [x, y]))
}
;function insertBefore(node, next) {}

function appendChild(el) {
  return new svgDomProxy(el, this)
}

function querySelector(query) {
  return this.querySelectorAll(query)[0]
}

function querySelectorAll(query) {
  return this.__scene__.filter(function (node) { return node.tagName.toLowerCase() === query })
}

function removeChild(el) {
  var i = this.__scene__.indexOf(el)
  this.__scene__.splice(i, 1)
}

var attrDefaults = {
  rotation: [0, 1]
, translate: [0, 0]
, scale: [1, 1]
, fill: 0
, stroke: 0
, 'stroke-width': 1
, cx: 0
, cy: 0
, x: 0
, y: 0
, opacity: 1
}

function lineBuffers(polygon) {
  var shit = [], p = polygon
  for(var i = 0; i < polygon.length + 4; i+= 3)
    addLine.call(shit, polygon[i], polygon[i+1], polygon[i+3], polygon[i+4])

  i = polygon.length - 3;
  addLine.call(shit, polygon[i], polygon[i+1], polygon[0], polygon[1])

  return shit
}

function svgDomProxy(el, canvas) {
  canvas.__scene__.push(this)

  this.tagName = el.tagName
  this.id = canvas.__id__++
  this.attr = Object.create(attrDefaults)
  this.parentNode = this.parentElement = this.canvas = canvas
  this.gl = canvas.gl
}

svgDomProxy.prototype =
  {
    x: function () {}
  , y: function () {}

  , querySelectorAll: noop
  , querySelector: noop
  , createElementNS: noop
  , insertBefore: noop
  , ownerDocument: { createElementNS: noop }
  , nextSibling: function () { canvas.scene[canvas.__scene__.indexOf()  + 1] }

  , height: function () {
      addToBuffer(this)
      this.path.coords = rectPoints(this.attr.width, this.attr.height)
      if (this.attr.stroke) [].push.apply(this.path, lineBuffers(this.path.coords))
      this.buffer = buildBuffer(this.path.coords)
      drawPolygon.call(this, this.buffer)
    }
  , width: function () {

    }

  , r: function () {
      addToBuffer(this)
      this.path.coords = circlePoints(this.attr.r)
      this.buffer = buildBuffer(this.path.coords)
    }

  , cx: function (cx) {
    }

  , cy: function (cy) {
    }

  , fill: function (val) {
      isId(val) && initShaders(d3.select(val).text(), val)
    }

  , transform: function (d) {
      var parse = d3.transform(d)
        , radians = parse.rotate * Math.PI / 180

      extend(this.attr, parse, { rotation: [ Math.sin(radians), Math.cos(radians) ] })

      render()
    }

  , d: function (d) {
      this.path && extend(this.path, { coords: [], length: 0 })

      parse.call(this, d)

      if (! this.buffer) this.buffer = toBuffer(this.path.coords)
    }

  , stroke: function (val) {
      isId(val) && initShaders(d3.select(val).text(), val)
    }

  , 'stroke-width': function (value) {
    }

  , getAttribute: function (name) {
      return this.attr[name]
    }

  , setAttribute: function (name, value) {
      this.attr[name] = value
      this[name] && this[name](value)
    }

  , removeAttribute: function (name) {
      delete this.attr[name]
    }

  , textContent: noop
  , removeEventListener: noop
  , addEventListener: noop
  }

var circleProto = extend(Object.create(svgDomProxy), {
  r: noop
, cx: noop
, cy: noop
})

var pathProto = extend(Object.create(svgDomProxy), {
  d: noop
})

var rect = extend(Object.create(svgDomProxy), {
  height: noop
, width: noop
, rx: noop
, ry: noop
, x: noop
, y: noop
})

//rect, line, group, text, image
;function addToBuffer(datum) {
  return extend(datum.path = [], { coords: [], id: datum.id })
}

function addLine(x1, y1, x2, y2) {
  this.push(toBuffer([x1, y1, 0, x2, y2, 0]))
}

function applyTransforms(node) {
  gl.uniform2f(program.translate, node.attr.translate[0] + node.attr.cx + node.attr.x,
               node.attr.translate[1] + node.attr.cy + node.attr.y)
  gl.uniform2f(program.scale, node.attr.scale[0], node.attr.scale[1])
  gl.uniform2f(program.rotation, node.attr.rotation[0], node.attr.rotation[1])
  gl.uniform1f(program.opacity, node.attr.opacity)
}

function drawPolygon(buffer) {
  setDrawColor(d3.rgb(this.attr.fill))
  buffer && drawBuffer(buffer, gl.TRIANGLE_FAN)
}

function drawBuffer(buffer, type) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.vertexAttribPointer(program.vertexPosition, buffer.itemSize, gl.FLOAT, false, 0, 0)
  gl.drawArrays(type, 0, buffer.numItems)
}

function swapProgram(name) {
  gl.useProgram(program = programs[name])
  program.vertexPosition = gl.getAttribLocation(program, "aVertexPosition")
  gl.enableVertexAttribArray(program.vertexPosition)
}


function drawPath(node) {
  if (program.name !== node.attr.fill)
    swapProgram(isId(node.attr.fill) ? node.attr.fill : '_identity')

  node.buffer && drawPolygon.call(node, node.buffer)

  //this check can cause race conditions when using multiple shaders
  //but speeds up single shader code a lot. keeping it in until
  //precompute order and batch up shader switches
  //may have to concat shaders together like threejs
  gl.lineWidth(node.attr['stroke-width'])

  if (program.name !== node.attr.stroke)
    swapProgram(isId(node.attr.stroke) ? node.attr.stroke : '_identity')

  setDrawColor(d3.rgb(node.attr.stroke))
  if (node.path) //this should be impossible
    for (var i = 0; i < node.path.length; i++)
      drawBuffer(node.path[i], gl.LINE_STRIP)

  applyTransforms(node)
}

function render() {
  canvas.__rerender__ = true
}

function setDrawColor (c) {
  gl.uniform4f(program.rgb,
               c.r / 256,
               c.g / 256,
               c.b / 256,
               1.0)
}

function buildBuffer(points) {
  var buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW)
  buffer.itemSize = 3
  buffer.numItems = points.length / buffer.itemSize
  return buffer
}

function toBuffer (array) {
  return buildBuffer(flatten(array))
}

function circlePoints(r) {
  var a = []
  for (var i = 0; i < 360; i+=18)
    a.push(50 + r * Math.cos(i * Math.PI / 180),
           50 + r * Math.sin(i * Math.PI / 180),
           0)
  return a
}

function rectPoints(h, w) {
  return [0,0,0,
          0,h,0,
          w,h,0,
          w,0,0,
         ]
}
;pathgl.shaderParameters = {
  rgb: [0, 0, 0, 0]
, translate: [0, 0]
, time: [0]
, rotation: [0, 1]
, opacity: [1]
, resolution: [0, 0]
, scale: [1, 1]
, mouse: pathgl.mouse = [0, 0]
}

pathgl.fragment = [ "precision mediump float;"
                  , "uniform vec4 rgb;"
                  , "uniform float time;"
                  , "uniform float opacity;"
                  , "uniform vec2 resolution;"

                  , "void main(void) {"
                  , "  gl_FragColor = vec4(rgb.xyz, opacity);"
                  , "}"
                  ].join('\n')

pathgl.vertex = [ "precision mediump float;"
                , "attribute vec3 aVertexPosition;"
                , "uniform vec2 translate;"
                , "uniform vec2 resolution;"
                , "uniform vec2 rotation;"
                , "uniform vec2 scale;"

                , "void main(void) {"

                , "vec3 pos = aVertexPosition;"
                , "pos.y = resolution.y - pos.y;"

                , "vec3 scaled_position = pos * vec3(scale, 1.0);"

                , "vec2 rotated_position = vec2(scaled_position.x * rotation.y + scaled_position.y * rotation.x, "
                + "scaled_position.y * rotation.y - scaled_position.x * rotation.x);"

                , "vec2 position = vec2(rotated_position.x + translate.x, rotated_position.y - translate.y);"

                , "vec2 zeroToOne = position / resolution;"
                , "vec2 zeroToTwo = zeroToOne * 2.0;"
                , "vec2 clipSpace = zeroToTwo - 1.0;"

                , "gl_Position = vec4(clipSpace, 1, 1);"

                , "}"
                ].join('\n')
;function noop () {}

function extend (a, b) {
  if (arguments.length > 2) [].forEach.call(arguments, function (b) { extend(a, b) })
  else for (var k in b) a[k] = b[k]
  return a
}

function twoEach(list, fn, gl) {
  var l = list.length - 1, i = 0
  while(i < l) fn.call(gl, list[i++], list[i++])
}

function flatten(input) {
  return input.reduce(function (a, b) { return (b && b.map ? [].push.apply(a, b) : a.push(b)) && a },
                      [])
}

function isId(str) {
  return str[0] == '#' && isNaN(parseInt(str.slice(1), 16))
}

function each(obj, fn) {
  for (var key in obj) fn(obj[key], key, obj)
}
;  return init(canvas)
} }()