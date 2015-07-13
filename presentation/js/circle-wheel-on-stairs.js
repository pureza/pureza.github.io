'use strict';

function circleWheelOnStairsSimulation() {

// Main simulation parameters
  var y0 = 30,
      m = 0.2,
      Ox = 50,
      Oy = 100,
      totalX = 1000,
      STEPS = 7,
      T = 50,
      R = y0,
      speed = 50;

  var trailPoints = [];

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
      log = Math.log,
      floor = Math.floor,
      cos = Math.cos,
      sin = Math.sin;


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
  function deg2rad(deg) {
    return deg / 180 * π;
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


    function animate(wheel, currentStep) {
      wheel.transition()
          .attrTween('transform', tweenTread)
          .duration((110 - speed) * 10) // When speed = 100, it takes 1 second
          .ease('linear')
          .transition()
          .attrTween('transform', tweenTransfer)
          .duration((110 - speed) * 10)
          .each('end', function () {
            if (currentStep + 3 <= STEPS) {
              animate(wheel, currentStep + 1);
            }
          }); // When speed = 100, it takes 1 second;


      function tweenTread(d, i, a) {
        return function (t) {
          var x = currentStep * T + y0 + t * (T - y0) + Ox;
          var y = Oy + (R - y0) + currentStep * R;
          trailPoints.push([x, y])
          drawTrail(world);
          return 'translate(' + x + ',' + y + ')';
        };
      }

      function tweenTransfer(d, i, a) {
        return function (t) {
          var x = Ox + T + currentStep * T;
          var y = Oy + (R - y0) + currentStep * R;

          // First translate the origin to (0, -y0)
          var x1 = 0;
          var y1 = y0

          var theta = deg2rad(-t * 90);
          var x2 = x1 * cos(theta) - y1 * sin(theta);
          var y2 = x1 * sin(theta) + y1 * cos(theta);


          trailPoints.push([x + x2, y + (y0 - y2)])
          drawTrail(world);
          return 'translate(' + x + ', ' + y + '), rotate(' + (t * 90) + ' , 0,' + y0 + ')';
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

        wheel.append('circle')
            .attr({
              cx: 0,
              cy: 0,
              r: y0,
              stroke: 'blue',
              fill: ' none',
              'stroke-width': 2
            });

        wheel
            .attr('transform', 'translate(' + Ox + ', ' + (Oy) + ')');

        // Draw the center
        wheel.append('circle')
            .attr({
              cx: 0,
              cy: 0,
              r: 2,
              stroke: 'blue ',
              'stroke-width': 2
            });


        // Animate the wheel.
        animate(wheel, 0);
      }
    }
  };


  function drawRoad(world) {
    var stepGenerator = d3.svg.line()
        .x(function (d, i) {
          return T * Math.floor(i / 2);
        })
        .y(function (d, i) {
          return R * Math.ceil(i / 2);
        })
        .interpolate('linear');

    var staircase = world
        .append('g')
        .attr('id', 'staircase')
        .attr('transform', function () {
          return 'translate(' + Ox + ', ' + Oy + ')'
        });

    staircase
        .append('path')
        .datum(d3.range(STEPS * 2 + 1))
        .attr('d', stepGenerator)
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .attr('fill', 'none');
  }


  function drawTrail(world) {
    var trailGenerator = d3.svg.line()
        .x(function (d, i) {
          return trailPoints[i][0];
        })
        .y(function (d, i) {
          return trailPoints[i][1];
        })
        .interpolate('linear');

    var trail = world
        .append('g')
        .attr('id', 'trail');

    trail
        .append('path')
        .datum(d3.range(trailPoints.length))
        .attr('d', trailGenerator)
        .attr('stroke', 'darkgray')
        .attr('stroke-width', 2)
        .attr('fill', 'none');
  }


  function draw(world) {
    world.selectAll('*').remove();

    init();

    w1.draw(world);

    drawRoad(world);
  }

  return {
    start: function () {
      world = d3.select('#world3');
      draw(world);
    },

    stop: function () {
      world.selectAll('*').remove();
      trailPoints = [];
    }
  }
}