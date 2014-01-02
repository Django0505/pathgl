var stopRendering = false
var colorBuffer = new Float32Array(4 * 1e4)

pathgl.shaderParameters = {
  rgb: [0, 0, 0, 0]
, translate: [0, 0]
, time: [0]
, rotation: [0, 1]
, opacity: [1]
, resolution: [0, 0]
, scale: [1, 1]
, stroke: [0]
, mouse: pathgl.mouse = [0, 0]
}

pathgl.stop = function () { stopRendering = true }
function init(c) {
  canvas = c
  pathgl.shaderParameters.resolution = [canvas.width, canvas.height]
  gl = initContext(canvas)
  program = createProgram(pointVertex, pointFragment)
  monkeyPatch(canvas)
  bindEvents(canvas)
  flags(canvas)
  d3.timer(drawLoop)
  return gl ? canvas : null
}

function flags () {
  gl.disable(gl.SCISSOR_TEST)
  gl.colorMask(true, true, true, true)
  gl.stencilMask(1,1,1,1)
  gl.disable(gl.BLEND)
  gl.enable(gl.CULL_FACE)
}

function bindEvents(canvas) {
  d3.select(canvas).on('mousemove.pathgl', mousemoved)
}

function mousemoved() {
  var m = d3.mouse(this)
  pathgl.mouse = [m[0] / innerWidth, m[1] / innerHeight]
}

function monkeyPatch(canvas) {
  return extend(canvas, {
    appendChild: appendChild
  , querySelectorAll: querySelectorAll
  , querySelector: function (s) { return this.querySelectorAll(s)[0] }
  , removeChild: removeChild
  , insertBefore: insertBefore

  , gl: gl
  , __scene__: []
  , __pos__: []
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

function createProgram(vs, fs) {
  program = gl.createProgram()

  vs = compileShader(gl.VERTEX_SHADER, vs)
  fs = compileShader(gl.FRAGMENT_SHADER, fs)

  gl.attachShader(program, vs)
  gl.attachShader(program, fs)

  gl.deleteShader(vs)
  gl.deleteShader(fs)

  gl.linkProgram(program)
  gl.useProgram(program)

  if (! gl.getProgramParameter(program, gl.LINK_STATUS)) throw name + ': ' + gl.getProgramInfoLog(program)

  each(pathgl.shaderParameters, bindUniform)

  program.vPos = gl.getAttribLocation(program, "pos")
  gl.enableVertexAttribArray(program.vPos)

  program.vfill = gl.getAttribLocation(program, "fill")
  gl.enableVertexAttribArray(program.vFill)

  program.vStroke = gl.getAttribLocation(program, "stroke")
  gl.enableVertexAttribArray(program.vStroke)

  return program
}

function bindUniform(val, key) {
  var loc = gl.getUniformLocation(program, key)
  ;(program['set' + key] = function (data) {
    gl['uniform' + val.length + 'fv'](loc, Array.isArray(data) ? data : [data])
  })(val)
}

function initContext(canvas) {
  var gl = canvas.getContext('webgl', { antialias: false }) || canvas.getContext('experimental-webgl')
  return gl && extend(gl, { viewportWidth: canvas.width, viewportHeight: canvas.height })
}