var RTT = pathgl.texture().repeat()

var disco = d3.select(RTT)
.selectAll('circle')
.data(d3.range(200), function (d) { return d })
.enter()
.append('rect')
.attr('width', 30)
.attr('height', 30)
.attr('x', function (d) { return 60 * (d % 20) })
.attr('y', function (d) { return 60 * ~~(d / 20) })
.attr('fill', function () { return 'hsl(' + Math.random() * 360 + ',100%, 50%)' })

// d3.timer(function () {
//   return
//   disco.filter(function (d, i) { return Math.random() > .99  }).transition()
//   .attr('fill', function () { return 'hsl(' + Math.random() * 360 + ',100%, 50%)' })
// })

d3.select('canvas')
.selectAll("circle")
.data(d3.range(100), function (d) { return d })
.enter().append("circle")
.attr('r', 50)
.attr('cx', function (d) { return 100 * (d % 10) })
.attr('cy', function (d) { return 100 * ~~(d / 10) })
.attr('fill', RTT)
