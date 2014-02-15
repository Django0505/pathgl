


var selector = 'svg'
var width = size.width,
    height = size.height,
    rotate = [10, -10],
    velocity = [.03, -.001],
    time = Date.now();

var proj = d3.geo.equirectangular().scale(158).translate([size.width / 2, size.height / 2])
  , path = d3.geo.path().projection(proj)

var svg = d3.select(selector)
          .attr("width", width)
          .attr("height", height)
          .call(pathgl)

var webgl = d3.select('canvas').attr(size).call(pathgl).attr('class', 'no-click')
var p = d3.select('.right').append('div')
        .attr('class', 'event_text')
        .style({
          position: 'absolute'
        , left: document.querySelector('canvas').clientLeft + size.width / 2  + 'px'
        , top: '5px'
        })

d3.json('data/world-50m.json', draw_world)
d3.csv('data/hist.csv', draw_history)

function mouseover(d) {
  d3.select('.title').text(d.title + ' ' + d.year + ', '  + d.event);
}

function draw_world(err, world) {
  svg.append('path')
  .attr('class', 'graticule noclick')
  .datum(d3.geo.graticule())
  .attr('d', path)
  .attr('dashed-array', '10 5 7 3')
  .attr('stroke', '#999')

  svg.selectAll("path")
  .data(topojson.feature(world, world.objects.countries).features)
  .enter().append("path")
  .attr({ class: 'world'
        , d: path
        , fill: '#333'
        })
}

function draw_history(err, hist) {
  var dates, m, to
    , from = -500

  d3.select('body')
  .append('div')
  .attr('class', 'current_year')

  var num = {}

  hist.forEach(function (d) {
    num[d.year] = (num[d.year] || 0) + 1
  })

  var x = d3.scale.linear()
          .domain([-500, 2030])
          .range([0, size.width])

  var y = d3.scale.linear()
          .domain([0, d3.max(d3.values(num))])
          .range([size.height, 0])


  var area = d3.svg.area()
             .x(function (d) { return x(+d.year) })
             .y0(size.height)
             .y1(function (d) { return y(num[+d.year]) })

  svg
  .append('path').datum(hist)
  .attr('class', 'slider')
  .attr('fill', 'indianred')
  .attr('stroke', 'indianred')
  .attr('d', area)

  svg
  .on('click', function () { from = ~~ x.invert(+d3.mouse(this)[0]) })
  .on('mousemove', function () {
    d3.select('line').attr('stroke-width', 2)
    .attr('transform','translate('+d3.mouse(this)[0]+',0)')
  })
  .on('mouseout', function ( ){ d3.select('line').attr('stroke-width',1) })

  var b = svg.append("g")
          .attr("class", "brush")
          .call(d3.svg.brush().x(x).on("brush", brushmove).extent([-500, -400]))
          .attr('transform', 'translate(' + [0, height * .9] +  ')')
          .selectAll("rect")
          .attr('fill', 'blue')
          .attr('opacity', '.7')
          .attr("height", height * .1);

  function brushmove() {
    adnan(d3.event.target.extent());
  }

  function adnan (s) {
    pathgl.uniform('dates', s)
    document.title = s.map(Math.round)
    d3.select('.current_year').text(from < 0 ? '' + Math.abs(+from) + ' BC' : from)
    svg.on('click', function () {
      var x = d3.event.x, y = d3.event.y

      var event = hist.filter(function (event) {
                    return s[0] < (+ event.year)  && (+ event.year) < s[1]
                  }).map(function (e) {
                    var c = e.node
                      e.dist = distance(c.attr.cx, c.attr.cy, x, y)
                      return e
                    })
                    .sort(function (a, b) { return a.dist - b.dist })
        p.text(event.length && event[0].event)
      })
    }
    adnan([-500, -400])
    p.text('click on circles you filthy animal. brush the histogram at the bottom to scroll through time')

    d3.select('.right').insert('p', '*')
    .attr('class', 'title')
    .style({ color: 'white'
           , position: 'absolute'
           , top: 475 + 'px'
           , left: 150 + 'px'
           , width: "35%"
           , 'font-size': '10px'
           , 'text-anchor': 'end'
           })

    hist = hist.sort(function(a, b) { return a.year - b.year })

    //hist.forEach(function (d) { d.location[0] += 20 * Math.random(); d.location[1] += 20 *Math.random() })
    hist.forEach(function(d) {
      d.location = proj(d.location.split(' ').map(parseFloat).reverse()) || d
            })

    pathgl.uniform('dates', [0, 1])

    webgl
    .selectAll('.nil')
    .data(hist)
    .enter()
    .append('circle')
    .attr({ class:'point'
          , fill: function(d){ return d3.hsl(Math.random()*120 + 120, .9, 0.5) }
          , cx: function(d){ return d.location[0] }
          , cy: function(d){ return d.location[1] }
          , cz: function(d){ return + d.year }
          , r: 15
          })
    .shader({
      'radius': '(pos.w < dates.y && pos.w > dates.x) ? 10. : 10. - (max(distance(pos.w, dates.y), distance(pos.w, dates.x)) / 20.);'
    })
    .each(function (d) {
      return d.node = this
    })
  }


function distance (x1, y1, x2, y2) {
  var xd = x2 - x1, yd = y2 - y1
  return xd * xd + yd * yd
}