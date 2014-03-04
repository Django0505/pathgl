//setTimeout(getVideo, 5000)

var size = { width: .8 * innerWidth, height: innerHeight * .9}

var c = d3.select('canvas')
        .attr('height', size.height)
        .attr('width', size.width)
        .call(pathgl)

var col = 20
  , s = size.width / col
  , row = Math.round(size.height / s)

var textures = [].map.call(document.querySelectorAll('img'), pathgl.texture)

r = c.selectAll('rect').data(d3.range(row * col * 2 + 1)).enter().append('rect')
.attr('x', function (d) { return s/2 + s * (d % col) })
.attr('y', function (d) { return s/2 + s * ~~(d / col) })
.attr('width', s / 2)
.attr('fill', function (d, i) {
      return textures[1]
    })

// d3.timer(function () {
//   r.filter(function (d) { return Math.random() > .9 })
//   .attr('fill', function () { return "hsl(" + Math.random() * 360 + ",100%, 50%)" })
// })

function getVideo () {
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia

  var video = document.createElement('video')
  video.height = size.height
  video.height = size.width
  video.autoplay = true
  video.loop = true

  navigator.getUserMedia({ video: true }, function(stream) {
    video.src = window.URL.createObjectURL(stream)
  }, function(error) {})

  //videoTexture = pathgl.texture(video)
  document.body.appendChild(video)
  pathgl.texture('video').repeat()
}
