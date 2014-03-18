//p = debug()

var canvas = d3.select('canvas').call(pathgl)
var physics = pathgl.sim.force(300)

physics.repeat()

canvas
.selectAll("circle")
.data(d3.range(300))
.enter()
.append("circle")
.attr('r', 10)
.attr('fill', 'red')
.attr('cx', physics.x())
.attr('cy', physics.y())

function readback(physics) {
  gl = physics.gl

  var fb = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, physics.data, 0)
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE) {
    var pixels = new Uint8Array(10 *10 * 4)
    gl.readPixels(0, 0,10,10, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
  }
  return pixels
}

function debug () {
  var canvas = d3.select('canvas').call(pathgl)

  var physics = pathgl.texture()

  d3.select(physics)
  .selectAll('circle')
  .data(d3.range(100), function (d) { return d })
  .enter()
  .append('rect')
  .attr('width', 30)
  .attr('height', 30)
  .attr('x', function (d) { return 100 * (d % 10) })
  .attr('y', function (d) { return 60 * ~~(d / 10) })
  .attr('fill', function () { return 'hsl(' + Math.random() * 360 + ',100%, 50%)' })

  physics.repeat()
  canvas
  .selectAll("circle")
  .data(d3.range(100), function (d) { return d })
  .enter().append("circle")
  .attr('r', 50)
  .attr('cx', function (d) { return 100 * (d % 10) })
  .attr('cy', function (d) { return 100 * ~~(d / 10) })
  .attr('fill', physics)

  return physics
}