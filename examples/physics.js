var particles = pathgl.sim.force(16).repeat()

d3.select('canvas').selectAll("circle")
.data(particles.unwrap())
.enter().append("circle")
.attr('r', 5)
.attr('cx', function (d,i) { return d.x })
.attr('cy', function (d,i) { return d.y })
.attr('fill', function () { return 'hsl(' + (Math.random() * 240 + 120) + ',100%, 50%)' })

d3.select('canvas').on('mousemove', particles.emit)