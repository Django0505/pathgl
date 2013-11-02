var canvas
function init(c) {
  canvas = c
  pathgl.shaderParameters.resolution = [canvas.width, canvas.height]
  gl = initContext(canvas)
  initShaders()
  override(canvas)
  d3.select(canvas).on('mousemove.pathgl', mousemoved)
  d3.timer(run_loop)

  return gl ? canvas : null
}

function mousemoved() {
  //set scene hover here
  var m = d3.mouse(this)
  pathgl.mouse = [m[0] / innerWidth, m[1] / innerHeight]
}

function run_loop(elapsed) {
  if (canvas.__rerender__ || pathgl.forceRerender)
    gl.uniform1f(program.time, pathgl.time = elapsed / 1000),
    pathgl.mouse && gl.uniform2fv(program.mouse, pathgl.mouse),
    canvas.__scene__.forEach(drawPath)
  canvas.__rerender__ = false
}

function override(canvas) {
  return extend(canvas,
                { appendChild: svgDomProxy
                , querySelectorAll: querySelectorAll
                , querySelector: querySelector
                , __scene__: []
                , __pos__: []
                , __program__: void 0
                , __id__: 0
                })
}

function compileShader (type, src) {
  var shader = gl.createShader(type)
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (! gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader))
  return shader
}

function initShaders() {
  var vertexShader = compileShader(gl.VERTEX_SHADER, pathgl.vertex)
  var fragmentShader = compileShader(gl.FRAGMENT_SHADER, pathgl.fragment)
  program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)

  gl.linkProgram(program)
  gl.useProgram(program)

  if (! gl.getProgramParameter(program, gl.LINK_STATUS)) return console.error("Shader is broken")

  each(pathgl.shaderParameters, bindUniform)

  program.vertexPosition = gl.getAttribLocation(program, "aVertexPosition")
  gl.enableVertexAttribArray(program.vertexPosition)

  program.uPMatrix = gl.getUniformLocation(program, "uPMatrix")
  gl.uniformMatrix4fv(program.uPMatrix, 0, projection(0, innerWidth / 2, 0, 500, -1, 1))
}

function bindUniform(val, key) {
  program[key] = gl.getUniformLocation(program, key)
  if (val) gl['uniform' + val.length + 'fv'](program[key], val)
}

function initContext(canvas) {
  var gl = canvas.getContext('webgl')
  if (! gl) return
  gl.viewportWidth = canvas.width || innerWidth
  gl.viewportHeight = canvas.height || innerHeight
  return gl
}


function each(obj, fn) {
  for(var key in obj) fn(obj[key], key, obj)
}