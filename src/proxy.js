function SVGProxy () {
  return types.reduce(function (a, type) {
           a[type.name] = function x() {
             var self = Object.create(type.prototype)
             extend(self, x)
             self.init(x.mesh.alloc() - 1)
             self.attr = {}
             return self
           }
           extend(type.prototype, baseProto, proto[type.name], {tagName: type.name})
           return a
         }, {})
}

var proto = {
  circle: { init: function (i) {
              this.fBuffer[i * 4] = 1
              this.indices = [i * 4]
            }
          , cx: function (v) {
              this.posBuffer[this.indices[0] + 0] = v
            }
          , cy: function (v) {
              this.posBuffer[this.indices[0] + 1] = v
            }
          , r: function (v) {
              this.posBuffer[this.indices[0] + 2] = v
            }
          , cz: function (v) {
              this.posBuffer[this.indices[0] + 3] = v
            }
          , fill: function (v) {
              this.colorBuffer[this.indices[0]] = v < 0 ? v : parseColor(v)
            }
          , stroke: function (v) {
              this.colorBuffer[this.indices[0]] = parseColor(v)
            }
          }
, ellipse: { init: function () {}, cx: noop, cy: noop, rx: noop, ry: noop }
, rect: { init: function (i) {
            this.indices = []//Quad().map
            //this.posBuffer[this.indices[0] + 1] = v
          }
        , fill: function (v) {
            this.colorBuffer[this.indices[0]] = v < 0 ? v : parseColor(v)
          }
        , x: function (v){
            this.posBuffer[this.indices[0] + 0] = v
          }
        , y: function (v) {
            this.posBuffer[this.indices[0] + 1] = v
          }
        , width: function (v) {
            this.posBuffer[this.indices[0] + 2] = v
          }
        , height: function (v) {
            this.posBuffer[this.indices[0] + 3] = v
          }
        , rx: noop,
          ry:  noop
        }
, image: { init: function () { }
         , 'xlink:href': noop, height: noop, width: noop, x: noop, y: noop }

, line: { init: function (i) {
            this.indices = [i * 2, i * 2 + 1]
          }
        , x1: function (v) { this.posBuffer[this.indices[0] * 2] = v }
        , y1: function (v) { this.posBuffer[this.indices[0] * 2 + 1] = v }
        , x2: function (v) { this.posBuffer[this.indices[1] * 2] = v }
        , y2: function (v) { this.posBuffer[this.indices[1] * 2  + 1] = v }
        , stroke: function (v) {
            var fill = parseColor(v)
            this.indices.forEach(function (i) {
              this.colorBuffer[i * 4] = fill
            }, this)
          }
        }
, path: { init: function () {
            this.indices = []
          }
        , d: buildPath
        , pathLength: noop
        , fill: function (v) {
            var fill = parseColor(v)
            this.indices.forEach(function (i) {
              this.colorBuffer[i * 4] = fill
            }, this)
          }
        }
, polygon: { init: function () {
             }
           , points: noop }
, polyline: { init: function (i) {
                this.indices = [i * 2, i * 2 + 1]
              }
          , points: noop }
, g: { init: function () { }
     , appendChild: function (tag) { this.children.push(appendChild(tag)) }
     ,  ctr: function () { this.children = [] } }
, text: { init: function () {}, x: noop, y: noop, dx: noop, dy: noop }
}

var baseProto = {
  gl: gl
, children: Object.freeze([])
, querySelector: querySelector
, querySelectorAll: querySelectorAll
, createElementNS: identity
, insertBefore: noop
, ownerDocument: { createElementNS: function (_, x) { return x } }
, previousSibling: function () { canvas.__scene__[canvas.__scene__.indexOf(this) - 1] }
, nextSibling: function () { canvas.__scene__[canvas.__scene__.indexOf()  + 1] }
, parentNode: false //delegate to self
, removeChild: function (child) {
    var s = canvas.__scene__
    s.splice(s.indexOf(child), 1)
  }
, opacity: function (v) {
    this.fBuffer[this.indices[0] + 1] = 256 - (v * 256)
  }
, transform: function (d) {}
, getAttribute: function (name) {
    return this.attr[name]
  }
, setAttribute: function (name, value) {
    this.attr[name] = value
    this[name] && this[name](value)
    if (value && value.texture) this.mesh.bindMaterial(name, value)
  }
, removeAttribute: function (name) {
    delete this.attr[name]
  }
, textContent: noop
, removeEventListener: noop
, addEventListener: addEventListener
, style: { setProperty: noop }
, ownerSVGElement: { createSVGPoint: function () { return { y: 0, x: 0, matrixTransform: nyi } }}
, getScreenCTM: getScreenCTM
, getBBox: getBBox
, trigger: function (evt) {
    var fn = this['__on' + evt]
    if(fn) fn.call(this, new proxyEvent(this))
  }
}

baseProto.parentNode = baseProto
var types = [
  function circle () {}
, function rect() {}
, function ellipse() {}
, function line() {}
, function path() {}
, function polygon() {}
, function polyline() {}
, function image() {}
, function text() {}
, function g() {}
]

function buildPath (d) {
  parsePath.call(this, d)
  this.fill(this.attr.stroke)
}

function insertBefore(node, next) {
  var scene = canvas.__scene__
    , i = scene.indexOf(next)
  reverseEach(scene.slice(i, scene.push(0)),
              function (d, i) { scene[i] = scene[i - 1] })
  scene[i] = node
}

function appendChild(el) {
  return this.__scene__[this.__scene__.length] = this.__renderTarget__.append(el.tagName)
}

function removeChild(el) {
  var i = this.__scene__.indexOf(el)

  el = this.__scene__.splice(i, 1)[0]
  el && el.mesh.free(i)
  //el.buffer.changed = true
  //el.buffer.count -= 1
}

var attrDefaults = {
  rotation: [0, 1]
, translate: [0, 0]
, scale: [1, 1]
, fill: 0
, stroke: 0
, 'stroke-width': 2
, cx: 0
, cy: 0
, x: 0
, y: 0
, opacity: .999
}

function getScreenCTM(){
  return { a: 1
         , b: 0
         , c: 0
         , d: 1
         , e: this.attr.cx
         , f: this.attr.cy
         }
}
function getBBox(){
  return { height: 10
         , width: 10
         , y: this.attr.cy
         , x: this.attr.cx
         }
}
