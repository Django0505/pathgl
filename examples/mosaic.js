var c = d3.select('canvas')
        .attr(size)
        .call(pathgl)

c.selectAll('rect').data(d3.range(100))
.enter().append('rect')
.attr('stroke', 'blue')
.attr('fill', 'pink')
//.attr('stroke', '#water')
//.attr('fill', '#rgb')
.attr('height', 30)
.attr('width', 30)
.attr({
  x: function (d) { return d * 10 }
, y: function (d) { return d * 10 }
})
