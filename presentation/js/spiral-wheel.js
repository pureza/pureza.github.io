'use strict';

function spiralSimulation(world, m) {

// Main simulation parameters
  var y0 = 30,
      Ox = 50,
      Oy = 150,
      totalX = 430,
      speed = 20;


// Simulation constants
  var POINTS = 300, // Number of points to use when drawing the spiral
      Ox, // Initial center x
      Oy, // Initial center y
      m;


  var world, // The world (SVG element containing the staircase and wheels)
      w1; // First wheel


// Auxiliar math definitions
  var π = Math.PI,
      exp = Math.exp,
      log = Math.log;


  /**
   * Converts from polar to cartesian coordinates.
   */
  function polar2x(r, θ) {
    return Math.cos(θ) * r;
  }

  function polar2y(r, θ) {
    return Math.sin(θ) * r;
  }


  /**
   * Converts from radians to degrees.
   */
  function rad2deg(θ) {
    return θ * 180 / π;
  }


  function init() {
    w1 = wheel();
  }


  var wheel = function () {

    /**
     * Calculates the radius of the wheel at angle θ
     */
    function r(θ) {
      return y0 * exp(m * (θ + π / 2));
    }


    /**
     * Calculates the angle of rotation of the wheel at time t
     */
    function θ(t) {
      var x = t * totalX
      return rad2deg(log(m * x / y0 + 1) / m);
    }


    function animate(wheel) {
      wheel.transition()
          .attrTween('transform', tween)
          .duration((110 - speed) * 100) // When speed = 100, it takes 1 second
          .ease('linear')
          .transition()
          .attrTween('transform', reverse(tween))
          .duration((110 - speed) * 100)
          .ease('linear')
          .each('end', function () {
            animate(wheel);
          });

      function tween(d, i, a) {
        return function (t) {
          return 'translate(' + (t * totalX + Ox) + ',' + (Oy) + '), rotate(' + (θ(t)) + ')';
        };
      }

      function reverse(f) {
        var tween = f();
        return function (d, i, a) {
          return function (t) {
            return tween(1 - t);
          }
        }
      }
    }

    return {

      draw: function (world) {
        var angle = d3.scale.linear()
            .domain([0, POINTS - 1])
            .range([-π / 2, 3 * π]);

        var petalGenerator = d3.svg.line()
            .x(function (d, i) {
              return polar2x(r(angle(i)), angle(i));
            })
            .y(function (d, i) {
              return -polar2y(r(angle(i)), angle(i));
            })
            .interpolate('linear');

        // Translate the wheel to its initial position
        var wheel =
            world.append('g')
                .attr('id', 'wheel');

        wheel
            .append('path')
            .datum(d3.range(POINTS))
            .attr('d', petalGenerator)
            .attr('stroke', 'blue')
            .attr('stroke-width', 2)
            .attr('shape-renedring', 'crispEdges')
            .attr('fill', 'none');

        wheel
            .attr('transform', 'translate(' + (Ox) + ', ' + (Oy) + ')');

        // Draw the center
        wheel.append('circle')
            .attr({
              cx: 0,
              cy: 0,
              r: 2,
              stroke: 'red',
              'stroke-width': 2
            });


        // Animate the wheel.
        animate(wheel);
      }
    }
  };


  function drawRoad(world) {

    var road = world
        .append('g')
        .attr('id', 'road')
        .attr('transform', function () {
          return 'translate(' + Ox + ', ' + Oy + ')'
        });

    road
        .append('line')
        .attr({
          x1: 0,
          x2: totalX,
          y1: -(-y0),
          y2: -(-m * totalX - y0),
          stroke: 'darkgray',
          'stroke-width': 2
        });

    //// Handrail
    //road
    //    .append('line')
    //    .attr({
    //      x1: 0,
    //      x2: totalX,
    //      y1: 0,
    //      y2: 0,
    //      stroke: 'lightgray'
    //    });
  }


  function drawAxis(world) {
    world
        .append('line')
        .attr({
          x1: 0,
          x2: 600,
          y1: Oy,
          y2: Oy,
          stroke: 'black'
        });


    world
        .append('line')
        .attr({
          x1: 300,
          x2: 300,
          y1: 0,
          y2: 400,
          stroke: 'black'
        });


    world
        .append('text')
        .attr({
          x: 550,
          y: 175,
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
          'font-size': '0.8em'
        }).text("y");

    world
        .append('text')
        .attr({
          x: 450,
          y: 100,
          stroke: 'darkgray',
          'font-family': 'serif',
          'font-style': 'italic',
          'font-size': '0.5em',
          'font-weight': '100'
        }).text("m = " + m);
  }


  function draw(world) {
    world.selectAll('*').remove();

    init();

    w1.draw(world);

    drawAxis(world);
    drawRoad(world);
  }

  return {
    start: function () {
      draw(world);
    },

    stop: function () {
      world.selectAll('*').remove();
    }
  }
}
