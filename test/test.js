var canvas = d3.select('canvas')
  , svg = d3.select('svg')
  , dim = { height: 500, width: innerWidth * .499 }

canvas.attr(dim)
svg.style(dim)

var data = [ 'm 0 0 l 10 10 60 60 70 400 z'
           , 'm 50 60 l 60 50 50 60 40 50 50 40 60 50 z'
           , 'M 536.9357503463519 310L554.2562584220407'

           + ' 320L554.2562584220407 340L536.9357503463519 '
           + '350L519.6152422706631 340L519.6152422706631 320Z'
           // , 'M8.572244476756641e-15 -140A140 140 0 1 1 -135.22961568046955 36.23466631435288'
           // + 'L-96.59258262890683 25.881904510252056A100 100 0 1 0 6.123031769111886e-15 -100Z'
           ].map(function (d) { return d.toUpperCase() })

var strokes = data.map(function () { return [1, 1, 1].map(Math.random) })

svg.selectAll('path').data(data).enter().append('path')
.attr('d', function (d) { return d })
.attr('stroke', '#333')
.attr('fill', 'none')

var gl = pathgl.stroke(stroke)
canvas.datum(data)
.transition().duration(500)
.each('end', function () { strokes.reverse() })
.call(gl)
.transition().call(gl)

function stroke(d, i) {
  return strokes[i]
}
