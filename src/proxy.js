var attrDefaults = {
  rotation: [0, 1]
, translate: [0, 0]
, scale: [1, 1]
, cx: 0
, cy: 0
}

function svgDomProxy(el, canvas) {
  if (! (this instanceof svgDomProxy)) return new svgDomProxy(el, this);

  canvas.__scene__.push(this)

  this.tagName = el.tagName
  this.id = canvas.__id__++
  this.attr = Object.create(attrDefaults)
  this.parentElement = canvas
}

function querySelector(query) {
  return this.querySelectorAll(query)[0]
}
function querySelectorAll(query) {
  return this.__scene__
}

var types = []

svgDomProxy.prototype =
    {
      r: function () {
        addToBuffer(this)
        this.path.coords = circlePoints(this.attr.r)
        this.buffer = buildBuffer(this.path.coords)
        drawPolygon.call(this, this.buffer)
      }
    , cx: function (cx) {
        this.buffer && drawPolygon.call(this, this.buffer)
      }
    , cy: function (cy) {
        this.buffer && drawPolygon.call(this, this.buffer)
      }

    , fill: function (val) {
        function integer(i) { return + i }
        function identity(i) { return i }

        if (this.tagName != 'PATH') drawPolygon.call(this, this.buffer)
        else {
          if (! this.buffer) this.buffer = toBuffer(this.path.coords
                                                    .map(function (d) { return d.map(integer).filter(identity) })
                                                    .map(function (d) { d.push(0); return d })
                                                    .filter(function (d) { return d.length == 3 }))
          drawPolygon.call(this, this.buffer)
        }

      }

    , transform: function (d) {
        var parse = d3.transform(d)
          , radians = parse.rotate * Math.PI / 180
          , rotation = { rotation: [ Math.sin(radians), Math.cos(radians) ] }

        extend(this.attr, parse, rotation)

        render()
      }

    , d: function (d) {
        this.path && extend(this.path, { coords: [], length: 0 })

        if (d.match(/NaN/)) return console.warn('path is invalid')

        render()

        parse.call(this, d)
      }

    , stroke: function (d) {
        render()
      }

    , 'stroke-width': function (value) {
        ctx.lineWidth(value)
      }

    , getAttribute: function (name) {
        return this.attr[name]
      }

    , setAttribute: function (name, value) {
        this.attr[name] = value
        this[name](value)
      }

    , removeAttribute: function (name) {
        this.attr[name] = null
      }

    , textContent: noop
    , removeEventListener: noop
    , addEventListener: noop
    }

var circleProto = extend(Object.create(svgDomProxy), {
  r: ''
, cx: ''
, cy: ''
})

var pathProto = extend(Object.create(svgDomProxy), {
  d: ''
})

function buildBuffer(points){
  var buffer = ctx.createBuffer()
  ctx.bindBuffer(ctx.ARRAY_BUFFER, buffer)
  ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(points), ctx.STATIC_DRAW)
  buffer.numItems = points.length / 3
  return buffer
}

function drawPolygon(buffer) {
  if (! this.attr) return console.log('lol')

  applyTransforms(this)

  setStroke(d3.rgb(this.attr.fill))

  ctx.bindBuffer(ctx.ARRAY_BUFFER, buffer)

  ctx.vertexAttribPointer(0, 3, ctx.FLOAT, false, 0, 0)

  ctx.drawArrays(ctx.TRIANGLE_FAN, 0, buffer.numItems)
}

var flatten = function(input) {
  var output = []
  input.forEach(function(value) {
    Array.isArray(value) ? [].push.apply(output, value) : output.push(value)
  })
  return output
}

var memo = {}
function circlePoints(r) {
  if (memo[r]) return memo[r]

  var a = []
  for (var i = 0; i < 360; i+=18)
    a.push(50 + r * Math.cos(i * Math.PI / 180),
           50 + r * Math.sin(i * Math.PI / 180),
           0
          )

  return memo[r] = a
}

function toBuffer (array) {
  return buildBuffer(flatten(array))
}