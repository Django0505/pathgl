var pointBuffer = new Uint16Array(8e4)
var pointPosBuffer = new Float32Array(8e4)
pointBuffer.count = 0
pb = pointBuffer
ppb = pointPosBuffer
cb = colorBuffer
var buff
var points = {
    pos: {
      buffer: 0
    , vLoc: 0
    }
  , fill: {}
  , stroke: {}
}

var p1, p2, p3, p4

var oncep = _.once(function initBuffersp() {
  p1 = gl.createBuffer(), p2 = gl.createBuffer(), p3 = gl.createBuffer(), p4 = gl.createBuffer()
})
function drawPoints(elapsed) {
  oncep()
  if (! pointBuffer.count) return
  // for(var attr in pointAttr) {
  //   gl.bindBuffer(gl.ARRAY_BUFFER, points[attr].buffer)
  //   gl.enableVertexAttribArray(points[attr].vLoc)
  //   if (points[attr].changed) gl.bufferSubData(gl.ARRAY_BUFFER, points[attr].list, gl.DYNAMIC_DRAW)
  //   gl.vertexAttribPointer(points[attr].vLoc, points[attr].length, gl.FLOAT, false, 0, 0)
  // }

  gl.bindBuffer(gl.ARRAY_BUFFER, p1)
  gl.enableVertexAttribArray(program.vPos)
  gl.bufferData(gl.ARRAY_BUFFER, pointPosBuffer, gl.DYNAMIC_DRAW)
  gl.vertexAttribPointer(program.vPos, 4, gl.FLOAT, false, 0, 0)

  gl.bindBuffer(gl.ARRAY_BUFFER, p2)
  gl.enableVertexAttribArray(program.vStroke)
  gl.bufferData(gl.ARRAY_BUFFER, colorBuffer, gl.DYNAMIC_DRAW)
  gl.vertexAttribPointer(program.vStroke, 1, gl.FLOAT, false, 0, 0)

  gl.bindBuffer(gl.ARRAY_BUFFER, p3)
  gl.enableVertexAttribArray(program.vFill)
  gl.bufferData(gl.ARRAY_BUFFER, colorBuffer, gl.DYNAMIC_DRAW)
  gl.vertexAttribPointer(program.vFill, 1, gl.FLOAT, false, 0, 0)

  pathgl.uniform('type', 1)

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, p4)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, pointBuffer, gl.DYNAMIC_DRAW)
  gl.drawElements(gl.POINTS, pointBuffer.count * 4, gl.UNSIGNED_SHORT, 0)
}
