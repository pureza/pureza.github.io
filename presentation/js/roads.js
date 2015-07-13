'use strict';

function roadsSimulation() {

  var world;

  function drawAxis(world) {
    world
        .append('line')
        .attr({
          x1: 0,
          x2: 600,
          y1: 120,
          y2: 120,
          stroke: 'black'
        });


    world
        .append('line')
        .attr({
          x1: 300,
          x2: 300,
          y1: 0,
          y2: 300,
          stroke: 'black'
        });


    world
        .append('text')
        .attr({
          x: 550,
          y: 155,
          stroke: 'black',
          'font-family': 'serif',
          'font-style': 'italic',
          'font-size': '0.8em'
        }).text("x");

    world
        .append('text')
        .attr({
          x: 270,
          y: 30,
          stroke: 'black',
          'font-family': 'serif',
          'font-style': 'italic',
          'font-size': '0.8em',
        }).text("y");
  }

    function drawStraightRoad(world) {
        var Ox = 0,
            Oy = 100,
            T = 40,
            R = 15,
            POINTS = 800;

        var stepGenerator = d3.svg.line()
            .x(function(d, i) {
                return i;
            })
            .y(function(d, i) {
                return i * 0.2;
            })
            .interpolate('linear');

        var staircase = world
            .append('g')
            .attr('id', 'staircase')
            .attr('transform', function() {
                return 'translate(' + Ox + ', ' + Oy + ')'
            });

        var path = staircase
            .append('path');

        path
            .transition()
            .tween('blah', function (arg) {
                return function (t) {
                    path.datum(d3.range(t * POINTS))
                        .attr('d', stepGenerator)
                        .attr('stroke', 'darkgray')
                        .attr('stroke-width', 2)
                        .attr('fill', 'none')
                        .attr('transform', function() {
                            return 'rotate(' + 0 + ', 0, ' + 50 + '), translate(0, ' + 50 + ')';
                        });
                }
            })
            .duration(5000)
            .ease('linear')
            .each('end', function() {
                path.remove();
                drawStairCase(world);
            });
    }

  function drawStairCase(world) {
    var Ox = 0,
        Oy = 100,
        T = 40,
        R = 15,
        POINTS = 800;

    var stepGenerator = d3.svg.line()
        .x(function(d, i) {
          var currentStep = Math.floor(i / (T + R));
          var stepI = i - currentStep * (T + R);
          if (stepI < T) {
            return currentStep * T + stepI;
          } else {
            return currentStep * T + T;
          }
        })
        .y(function(d, i) {
          var currentStep = Math.floor(i / (T + R));
          var stepI = i - currentStep * (T + R);
          if (stepI > T) {
            return currentStep * R + (stepI - T);
          } else {
            return currentStep * R;
          }
        })
        .interpolate('linear');

    var staircase = world
        .append('g')
        .attr('id', 'staircase')
        .attr('transform', function() {
          return 'translate(' + Ox + ', ' + Oy + ')'
        });

    var path = staircase
        .append('path');

    path
        .transition()
        .tween('blah', function (arg) {
          return function (t) {
            path.datum(d3.range(t * POINTS))
                .attr('d', stepGenerator)
                .attr('stroke', 'darkgray')
                .attr('stroke-width', 2)
                .attr('fill', 'none')
                .attr('transform', function() {
                  return 'rotate(' + 0 + ', 0, ' + 50 + '), translate(0, ' + 50 + ')';
                });
          }
        })
        .duration(5000)
        .ease('linear')
        .each('end', function() {
          path.remove();
          drawSinusoidalRoad(world);
        });
  }


  function drawSinusoidalRoad(world) {
    var Ox = 0,
        Oy = 100,
        T = 40,
        R = 15,
        POINTS = 800;

    var stepGenerator = d3.svg.line()
        .x(function(d, i) {
         return i;
        })
        .y(function(d, i) {
          return Math.sin(i / 10) * 10 + 50;
        })
        .interpolate('linear');

    var staircase = world
        .append('g')
        .attr('id', 'staircase')
        .attr('transform', function() {
          return 'translate(' + Ox + ', ' + Oy + ')'
        });

    var path = staircase
        .append('path');

    path
        .transition()
        .tween('blah', function (arg) {
          return function (t) {
            path.datum(d3.range(t * POINTS))
                .attr('d', stepGenerator)
                .attr('stroke', 'darkgray')
                .attr('stroke-width', 2)
                .attr('fill', 'none')
                .attr('transform', function() {
                  return 'rotate(' + 0 + ', 0, ' + 50 + '), translate(0, ' + 50 + ')';
                });
          }
        })
        .duration(5000)
        .ease('linear')
        .each('end', function() {
          path.remove();

          drawRandomRoad(world);
        });
  }


  function drawRandomRoad(world) {
    var Ox = 0,
        Oy = 100,
        T = 40,
        R = 15,
        POINTS = 800;

    var stepGenerator = d3.svg.line()
        .x(function(d, i) {
          return i;
        })
        .y(function(d, i) {
          return 0.01 * Math.pow(i / 80, 5) + 50;
        })
        .interpolate('linear');

    var staircase = world
        .append('g')
        .attr('id', 'staircase')
        .attr('transform', function() {
          return 'translate(' + Ox + ', ' + Oy + ')'
        });

    var path = staircase
        .append('path');

    path
        .transition()
        .tween('blah', function (arg) {
          return function (t) {
            path.datum(d3.range(t * POINTS))
                .attr('d', stepGenerator)
                .attr('stroke', 'darkgray')
                .attr('stroke-width', 2)
                .attr('fill', 'none')
                .attr('transform', function() {
                  return 'rotate(' + 0 + ', 0, ' + 50 + '), translate(0, ' + 50 + ')';
                });
          }
        })
        .duration(5000)
        .ease('linear')
        .each('end', function() {
          path.remove();

          drawStraightRoad(world);
        });
  }


  function draw(world) {
    world.selectAll('*').remove();

    drawAxis(world);
      drawStraightRoad(world);
  }

  return {
    start: function() {
      world = d3.select('#world5');
      draw(world);
    },

    stop: function() {
      world.selectAll('*').remove();
    }
  }
}
