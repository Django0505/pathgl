var textures = { null: [] }

//texture data - img,canv,vid, url, 
//tetxure target - construct render target
//texture shader - construct render target & add mesh


pathgl.texture = function (image, options, target) {
  var self = Object.create(Texture)
  var tex = gl.createTexture()

  self.gl = gl

  if (null == image) image = false
  if (isShader(image)) {
    var program = createProgram(gl, simulation_vs, image, ['uv', 'pos'])
    tex.program = program
    image = false
  }

  if ('string' == typeof image) image = parseImage(image)

  extend(self, options, {
    image: image
  , data: tex
  , width: image.width || 512
  , height: image.height || 512
  , update: image ? self.update : drawTo.bind(null, tex, RenderTarget(self, gl.createFramebuffer(), tex).update)
  })

  initTexture.call(self)

  target = target || null
  ;(textures[target] || (textures[target] = [])).push(self)

  return self.load()
}

var Texture = {
  update: initTexture
, forEach: function () {}
, load: function ()  {
    var image = this.image

    if (image.complete || image.readyState == 4) this.update()
    else image.addEventListener && image.addEventListener('load', this.update.bind(this))

    return this
  }
, unfold: function (attrList) {
    return pathgl.shader()
  }
, repeat: function () {
    setInterval(this.update.bind(this), 15)
  }
, appendChild: function (el) {
    return (this.types[el.toLowerCase()] || noop)(el)
  }
, valueOf: function () {
    return - 1
  }
, querySelectorAll: querySelectorAll
, __scene__: []
, ownerDocument: { createElementNS: function (_, x) { return x } }
}

Texture = extend(Object.create(appendable), Texture)

function updateTexture() {
  gl.bindTexture(gl.TEXTURE_2D, this.data)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image || null)
  gl.bindTexture(gl.TEXTURE_2D, null)
}

function initTexture() {
  gl.bindTexture(gl.TEXTURE_2D, this.data)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)


  if (! this.image) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
  else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image || null)

  //if (powerOfTwo(this.width) && powerOfTwo(this.height)) gl.generateMipmap(gl.TEXTURE_2D)
}

function parseImage (image) {
  var query = document.querySelector(image)
  if (query) return query
  return extend(isVideoUrl ? new Image : document.createElement('video'), { src: image })
}

function isShader(str) {
  return str.length > 100
}

function drawTo(texture, callback) {
  var width = 512, height = 512
  var v = gl.getParameter(gl.VIEWPORT)
  var framebuffer = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)

  framebuffer.width = width
  framebuffer.height = height

  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)

  callback()
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
}

  function d3_selection_selector(selector) {
    return typeof selector === "function" ? selector : function() {
      return d3_select(selector, this);
    };
  }