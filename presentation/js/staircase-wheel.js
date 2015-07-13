'use strict';

function staircaseWheelSimulation(world, N) {

// Main simulation parameters
var T = 80, // Staircase tread (horizontal) length
  R = 50, // Staircase riser (vertical) length
  speed = 50; // Simulation speed (1-100)


// Simulation constants
var POINTS = 30, // Number of points to draw for each petal
  STEPS = 100, // Number of steps
  Ox, // Initial center x
  Oy, // Initial center y
  m, mm1, θ0, h, x1, x2, maxY0;


var world, // The world (SVG element containing the staircase and wheels)
  w1, // First wheel
  w2; // Second wheel


// Auxiliar math definitions
var π = Math.PI,
  exp = Math.exp,
  log = Math.log,
  sqrt = Math.sqrt,
  floor = Math.floor,
  max = Math.max;


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
  // Staircase slope
  m = R / T;

  mm1 = m * m + 1;

  // Initial angle of rotation of the wheel, due to the inclination of the
  // staircase (in the paper the staircase is horizontal)
  θ0 = rad2deg(Math.atan(m));

  // Hypoteneuse of each step
  h = sqrt(T * T + R * R);
 
  // Length of the x component of the tread (this is -x1 in the paper)
  x1 = 1/sqrt(mm1) * T;

  // Length of the x component of the riser
  x2 = h - x1;

  // The first wheel
  w1 = wheel(T, R, N, 'blue');

  maxY0 = w1.y0;

  Ox = 100;
  Oy = 200;
}


var wheel = function(T, R, N, color) {

  // Initial height of the wheel
  var y0 = R / (sqrt(mm1) * (exp((2 * π * m) / (mm1 * N)) - 1)),

    // θ1 and θ2 angle definitions, as in the paper.
    θ1 = 1 / m * log(R / (y0 * sqrt(mm1)) + 1),
    θ2 = m * log(R / (y0 * sqrt(mm1)) + 1);

  /**
   * Calculates the radius of the wheel at angle θ
   */
  function r(θ) {
    if (θ >= -π/2 - θ1 && θ <= -π/2) {
      // r1(θ)
      return y0 * exp(-m * (θ + π/2));
    } else {
      // r2(θ)  
      return y0 * exp(1/m * (θ + π/2));
    }
  }


  /**
   * Calculates the angle of rotation of the wheel at time t
   */
  function θ(t) {
    // t goes from 0 to 1 for the whole staircase, but we want it to go from 0
    // to 1 just for this step.
    var currentStep = floor(t * STEPS);
    t = t - currentStep / STEPS;

    // Distance traveled in the x axis for this step
    var x = t * h * STEPS;

    // Unlike the paper, the stair begins with a riser. The formulas are the
    // same though.
    if (x <= x2) {
      // Still in the riser
      return rad2deg(m*log(1 + x/(m*y0)));
    } else {
      // make x belong to [-x1, 0]
      x = x - x2 - x1;
      return rad2deg(-log(1-m/y0*x) / m);
    }
  }


  function animate(wheel) {
    wheel.transition()
      .attrTween('transform', tween)
      .duration((110 - speed) * 2000) // When speed = 100, it takes 1 second
      .ease('linear')
      .each('end', function () {
        animate(wheel);
      });

    function tween(d, i, a) {
      return function (t) {
        var totalX = STEPS * h;

        // t goes from 0 to 1 for the whole staircase.
        // Scale it for the staircase segment traveled by this wheel

       world.attr('transform', 'translate(' +  -(t * totalX + Ox) + ' , 0)');

       // t = ((lastStep - initialStep) * t + initialStep) / STEPS;
        return 'translate(' + (t * totalX + Ox + h * 3) + ',' + (Oy + (maxY0 - y0)) + '), rotate(' + (θ(t)) + ')';
      };
    }
  }

  return {

    y0: y0,

    θ1: θ1,

    r: r,

    θ: θ,

    draw: function (world) {
      var angle = d3.scale.linear()
        .domain([0, POINTS - 1])
        .range([-π / 2 - θ1, -π / 2 + θ2]);

      var petalGenerator = d3.svg.line()
        .x(function (d, i) {
          return polar2x(r(angle(i)), angle(i));
        })
        .y(function (d, i) {
          return -polar2y(r(angle(i)), angle(i));
        })
        .interpolate('linear');

      var id = 'petal' + color;

      var petal = world
        .append('defs')
        .append('g')
        .attr('id', id);

      petal
        .append('path')
        .datum(d3.range(POINTS))
        .attr('d', petalGenerator)
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('shape-renedring', 'crispEdges')
        .attr('fill', 'none');

      // Translate the wheel to its initial position
      var wheel =
        world.append('g')
          .attr('id', 'wheel')
          .attr('transform', 'translate(' + (Ox + 5 * h) + ', ' + (Oy + (maxY0 - y0)) + ')');



      // Draw the N petals, rotating each one by the appropriate angle.
      var nodes = wheel.selectAll('g.petal')
        .data(d3.range(1, N + 1))
        //.data(d3.range(1, 2))
        .enter()
        .append('g')
        .attr('transform', function (k) {
          var angle = 2 * (k - 1) * π / N;
          return 'rotate(' + rad2deg(angle) + ')';
        });

      nodes
        .append('use')
        .attr('xlink:href', '#' + id);

      // Animate the wheel.
      animate(wheel);
    }
  }
};


function drawStairCase(world) {

  var stepGenerator = d3.svg.line()
    .x(function(d, i) {
      return T * Math.floor(i / 2);
    })
    .y(function(d, i) {
      return R * Math.ceil(i / 2);
    })
    .interpolate('linear');

  var staircase = world
    .append('g')
    .attr('id', 'staircase')
    .attr('transform', function() {
      return 'translate(' + Ox + ', ' + Oy + ')'
    });

  staircase
    .append('path')
    .datum(d3.range(STEPS * 2 + 1))
    .attr('d', stepGenerator)
    .attr('stroke', 'lightgray')
    .attr('stroke-width', 2)
    .attr('fill', 'none')
    .attr('transform', function() {
      return 'rotate(' + -θ0 + ', 0, ' + maxY0 + '), translate(0, ' + maxY0 + ')';
    });
}


function draw(world) {
  world.selectAll('*').remove();

  init();

  w1.draw(world);

  drawStairCase(world);
}

return {
  start: function() {
    draw(world);
  },

  stop: function() {
    world.selectAll('*').remove();
  }
}

}
