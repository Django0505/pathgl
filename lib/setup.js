d3.selectAll('#webgl, #svg').on('change', function () {
  selector = this.id == 'webgl' ? 'canvas' : 'svg'
  cleanup()
  runCode(current_title())
})

var code = CodeMirror(document.querySelector('.right'), {
  matchBrackets: true
, mode:  "javascript"
, value: 'hello...'
, showCursorWhenSelecting: true
, tabSize: 8
, indentUnit: 8

, onChange: _.debounce(function (a, b) {

   try { new Function('+' + a.getValue() + '("canvas")') }
   catch (e) { console.log(e.stack)  }

   cleanup()

   injectScript('+' + a.getValue() + '("' + selector +'")')

  }, 250)
})

code.getWrapperElement().style.display = 'none'
console.log('hey! select the webgl by c.select("circle").attr("r, 1000")')

d3.select('.edit').datum({}).on('click', function (d) {
  if (d.show = ! d.show) {
    code.getWrapperElement().style.display = 'block'
    this.textContent = 'Hide Code'
    code.focus()
    code.refresh()
  } else {
    code.getWrapperElement().style.display = 'none'
    this.textContent = 'Edit Code'
  }
})

var examples = {}
  , selector = 'canvas'
  , size = { width: 960, height: 500 }

function current_title() {
  return window.location.hash.slice(1) || 'point_lighting'
}

this.onload = function () {
  runCode(current_title())

  d3.select('.examples').selectAll('li')
  .data(d3.keys(examples))
  .enter().append('li').append('a')
  .text(function (d) { return d })
  .attr('href', function (d) { return '#' + d })
  .on('click', runCode)
}

function runCode(title) {
  cleanup()
  document.title = 'Pathgl : ' + title
  code.setValue(examples[title].toString())
}

function random_shader () {
  var selection = d3.selectAll('div[id]')[0].map(function (x) { return '#' + x.id })
  return selection[~~ (Math.random() * (selection.length - 1))]
}

function off (el){
  var node = el.node()
    , keys = Object.keys(node)

  keys.forEach(function (key) {
    if (key = key.match(/__on(.+)/)) el.on(key[1], null)
  })
}

function cleanup () {
  pathgl.stop()
  d3.select('svg').selectAll('*').remove()
  off(window.c = d3.select('canvas'))
}

function injectScript (str) {
  d3.select('head').append('script')
  .attr('class', 'temp')
  .text(str)
}
