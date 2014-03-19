pathgl.init('canvas')

d3.select('canvas').selectAll("circle")
.data(pathgl.sim.force(512 * 512).repeat().unwrap())
.enter().append("circle")
.attr('r', function (d,i) { return d.x })
.attr('cx', function (d,i) { return d.x })
.attr('cy', function (d,i) { return d.y })
.attr('fill', function () { return 'hsl(' + (Math.random() * 240 + 120) + ',100%, 50%)' })
