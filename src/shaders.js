pathgl.vertexShader = [
  'uniform float clock;'
, 'uniform vec2 mouse;'
, 'uniform vec2 resolution;'
, 'uniform vec2 dates;'
, 'uniform float logo;'

, 'attribute vec2 xy;'
, 'attribute vec2 r;'
, 'attribute vec2 color;'
, 'attribute vec2 fugue;'

, 'varying float type;'
, 'varying vec4 v_stroke;'
, 'varying vec4 v_fill;'
, 'varying vec4 dim;'

, 'uniform sampler2D texture0;'

, 'vec4 tex(vec2 get) { '
, '  return texture2D(texture0, abs(get));'
, '}'

, 'vec4 unpack_color(float col) {'
, '    return vec4(mod(col / 256. / 256., 256.),'
, '                mod(col / 256. , 256.),'
, '                mod(col, 256.),'
, '                256. - fugue.x)'
, '                / 256.;'
, '}'

, 'vec2 clipspace(vec2 pos) { return vec2(2. * (pos.x / resolution.x) - 1., 1. - ((pos.y / resolution.y) * 2.)); }'


, 'vec4 light (vec2 pos, float factor) {'
, '   float value = 0.0;'
// , '   const int NUM_RAYS = 80;'
// , '   float num = float(NUM_RAYS);'
// , '   float sinT1 = sin(clock * 0.002) * 0.2;'
// , '   float sinT2 = sin(2.0 + clock * 0.0013) * 0.3;'
// , '   for(int i = 0; i < NUM_RAYS; i+=8) {'
//  , '     float fi = float(i + 2) / num;'
// , '     float rad = float(i) * 0.2 + (1.0 + clock * 0.001) * 0.3;'

// , '     float m = sin(fi * 13.3 + clock * 0.0002 + sin(fi * 13.3 + clock * 0.0005)) * 0.1 + 0.8;'
// , '     vec2 light = vec2(m, cos(fi * 18.0 + clock * 0.0001) * 0.1 + 1.2);'

// , '     float ld1 = sin(fi * 0.9 * (1.0 + 0.9 * sin(clock * 0.0001 + 2.0)) + sin(clock * 0.00005 + 3.0) * 0.1 + 0.3);'
// , '     float ld2 = cos(0.3 + fi * 0.8 + sin(1.0 + clock * 0.0003) * 0.1);'
// , '     vec2 lightDir = normalize(vec2(ld2, ld1));'
// , '     float lightAngle = dot(lightDir, normalize(light - pos));'

// , '     if (lightAngle > 0.0) {'
// , '         float dist = distance(light, pos);'
// , '         float xd1 = sin(fi * 30.0 + sinT1 + sinT2);'
// , '         float xd2 = sin(fi * 10.0 + sinT1 + sinT2 + 3.0);'
// , '         float radius = (xd1 + 1.0) * 600.0 + 100.0;'
// , '         float aa = pow(lightAngle, radius * dist * dist) * (0.4 + xd1 * 0.3);'
// , '         float bb = pow(1.0 + dist, 9.5 + xd2 * 8.0);'
// , '         value += clamp(aa / bb, 0.0, 1.0);'
// , '     }'
// , '  }'
// , '   value = clamp(value * factor, 0.1, 2.0);'
, '  float v = max(.5 - pow(distance(tex(xy).xy, vec2(mouse.x, mouse.y)), 2.), .1) * factor;'
//(1. + sin(clock / 1000.))/ 2.
, '  return vec4(v , v , v , 1.);'
, '}'

, 'void main() {'
, '    float time = clock / 1000.;'
, '    float pointSize = replace_r;'
, '    float x = replace_x;'
, '    float y = replace_y;'
, '    float fill = color.x;'
, '    float stroke = color.x;'

, '    type = float(pointSize > 0.);'
, '    gl_PointSize =  pointSize;'
, '    v_fill = unpack_color(fill);'

, '    dim = vec4(x, y, pointSize, -pointSize);'
, '    v_stroke = replace_stroke;'
, '    gl_Position = vec4(clipspace(vec2(x, y)),  1., 1.);'
, '}'
].join('\n')

pathgl.fragmentShader = [
  'uniform vec2 resolution;'
, 'uniform vec2 dates;'
, 'uniform sampler2D texture0;'
, 'uniform sampler2D texture1;'

, 'varying float type;'

, 'varying vec4 v_stroke;'
, 'varying vec4 v_fill;'
, 'varying vec4 dim;'


, 'vec4 chos(vec2 get, float n) { '
, '  if (n == -1.)return texture2D(texture1, abs(get));'
, '  if (n == -2.) return texture2D(texture0, abs(get));'
, '}'

, 'vec2 clipspace(vec2 pos) { return vec2(2. * (pos.x / resolution.x) - .5, 1. - ((pos.y / resolution.y))); }'

, 'void main() {'
, '    float dist = distance(gl_PointCoord, vec2(0.5));'
, '    if (type == 1. && dist > 0.5) discard;'
, '    gl_FragColor = (v_stroke.x < 0.) ? chos(clipspace(dim.xy) * 2., -1.0)  : v_stroke;'
, '}'
].join('\n')

function createProgram(gl, vs_src, fs_src, attributes) {
  var src = vs_src + '\n' + fs_src
  program = gl.createProgram()

  var vs = compileShader(gl, gl.VERTEX_SHADER, vs_src)
    , fs = compileShader(gl, gl.FRAGMENT_SHADER, fs_src)

  gl.attachShader(program, vs)
  gl.attachShader(program, fs)

  gl.deleteShader(vs)
  gl.deleteShader(fs)

  ;(attributes || ['xy', 'color', 'r', 'fugue']).forEach(function (d, i){
     gl.bindAttribLocation(program, i, d)
   })

  gl.linkProgram(program)
  gl.useProgram(program)
  if (! gl.getProgramParameter(program, gl.LINK_STATUS)) throw name + ': ' + gl.getProgramInfoLog(program)

  var re = /uniform\s+(\S+)\s+(\S+)\s*;/g, match = null
  while ((match = re.exec(src)) != null) bindUniform(match[2], match[1])

  program.merge = mergify(vs, fs)
  program.gl = gl

  return program

  function bindUniform(key, type) {
    var loc = gl.getUniformLocation(program, key)
      , method = 'uniform' + glslTypedef(type)
      , keep

    program[key] = function (data) {
      //if (keep == data || ! arguments.length) return

      if (data.map && data.length > 4)
        gl[method](loc, gl.FALSE, Array.isArray(data) ? data : [data])
      else
        gl[method](loc, Array.isArray(data) ? data : [data])

      keep = data
    }
  }
}

function build_vs(src, subst) {
  each(subst || {}, function (v, k, o) {
    if (k == 'cx') o['x'] = v
    if (k == 'cy') o['y'] = v
  })

    var defaults = extend({
      stroke: '(stroke < 0.) ? vec4(stroke)  : unpack_color(stroke)'
    , r: '(r.x < 0.) ? clamp(abs(tex(xy.xy).w) + abs(tex(xy.xy).z) * 4., 2., 10.): (2. * r.x)'
    , x: '(xy.x < 1.) ? tex(xy.xy).x * resolution.x : xy.x'
    , y: '(xy.y < 1.) ? tex(xy.xy).y * resolution.y : xy.y'
    }, subst)

  for(var attr in defaults)
    src = src.replace('replace_'+attr, defaults[attr])

  return src
}

function compileShader (gl, type, src) {
  var header = 'precision mediump float;\n'
  var shader = gl.createShader(type)
  gl.shaderSource(shader, header + src)
  gl.compileShader(shader)
  if (! gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    var log = (gl.getShaderInfoLog(shader) || '')
      , line = + log.split(':')[2]
    return console.error((src || '').split('\n').slice(line-5, line + 5).join('\n'), log)
  }
  return shader
}

function glslTypedef(type) {
  if (type == 'sampler2D') return '1i'
  if (type.match('mat')) return 'Matrix' + type[type.length - 1] +'fv'
  if (type.match('vec')) return type[type.length - 1] + 'fv'
  return '1fv'
}

function mergify(vs1, fs1, subst1) {
  return function (vs2, fs2, subst2) {
    fs2 = fs2 || pathgl.fragmentShader
    vs2 = build_vs(vs2, subst2)
    return createProgram(this.gl, vs2, fs2)
  }
}



var dist = ['float distLight(vec2 pt1, vec2 pt2, vec2 testPt) {'
    , 'vec2 lineDir = pt2 - pt1;'
  , 'vec2 perpDir = vec2(lineDir.y, -lineDir.x);'
  , 'vec2 dirToPt1 = pt1 - testPt;'
  , 'return abs(dot(normalize(perpDir), dirToPt1));'
, '}'
]
