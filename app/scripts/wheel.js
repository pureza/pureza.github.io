'use strict';

// Main simulation parameters
var T = 40, // Staircase tread (horizontal) length
  R = 20, // Staircase riser (vertical) length
  N1 = 5, // Number of petals on the first wheel
  N2 = 1, // Number of petals on the second wheel
  speed = 50, // Simulation speed (1-100)
  drawHandrail = true,
  showSecondWheel = false;


// Simulation constants
var POINTS = 30, // Number of points to draw for each petal
  STEPS = 10, // Number of steps
  Ox, // Initial center x
  Oy, // Initial center y
  m, mm1, θ0, h, Rx, Tx, maxY0;


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
  // Inverse of the staircase slope
  m = T / R;

  mm1 = m * m + 1;

  // Initial angle of rotation of the wheel, due to the inclination of the staircase
  // (in the paper the staircase is horizontal)
  θ0 = rad2deg(Math.atan(1 / m));

  // Hypoteneuse of each step
  h = sqrt(T * T + R * R);

  // Length of the x component of the riser
  Rx = h - T * m / sqrt(mm1);

  // Length of the x component of the tread
  Tx = h - Rx;

  // The first wheel
  w1 = wheel(T, R, N1, 0, showSecondWheel ? 8 : 10, 'blue');

  if (showSecondWheel) {
    // The second wheel
    w2 = wheel(T, R, N2, 2, 10, 'red');
  }

  maxY0 = showSecondWheel ? max(w1.y0, w2.y0) : w1.y0;

  Ox = Oy = showSecondWheel ? max(w1.r(-π / 2 + w1.θ1), w2.r(-π / 2 + w2.θ1)) : w1.r(-π / 2 + w1.θ1);
}


var wheel = function(T, R, N, initialStep, lastStep, color) {

  // Initial height of the wheel
  var y0 = y0 = T / (sqrt(mm1) * (exp((2 * π * m) / ((mm1) * N)) - 1)),

    // θ1 and θ2 angle definitions, as in the paper.
    θ1 = 1 / m * log(T / (y0 * sqrt(mm1)) + 1),
    θ2 = m * log(T / (y0 * sqrt(mm1)) + 1),

    // Integration constant of θ(t) in the riser
    c1 = -log(y0) / m,

    // Integration constant of θ(t) in the tread
    c2 = m * log(m * y0);

  /**
   * Calculates the radius of the wheel at angle θ
   */
  function r(θ) {
    if (θ >= -π / 2 && θ <= -π / 2 + θ1) {
      return y0 * exp(m * (θ + π / 2));
    } else {
      return y0 * exp(-1 / m * (θ + π / 2));
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

    if (x <= Rx) {
      // Still in the riser
      return rad2deg(c1 + log(y0 + m * x) / m);
    } else {
      x = x - Rx;
      return rad2deg(c2 - log(m * y0 - (x - Tx)) * m);
    }
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
        var totalX = STEPS * h;

        // t goes from 0 to 1 for the whole staircase.
        // Scale it for the staircase segment traveled by this wheel
        t = ((lastStep - initialStep) * t + initialStep) / STEPS;
        return 'translate(' + (t * totalX + Ox) + ',' + (Oy + (maxY0 - y0)) + '), rotate(' + (θ(t)) + ')';
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

    y0: y0,

    θ1: θ1,

    r: r,

    θ: θ,

    draw: function (world) {
      var angle = d3.scale.linear()
        .domain([0, POINTS - 1])
        .range([-π / 2 - θ2, -π / 2 + θ1]);

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
        .attr('stroke-width', 1)
        .attr('fill', 'none');

      // Translate the wheel to its initial position
      var wheel =
        world.append('g')
          .attr('id', 'wheel')
          .attr('transform', 'translate(' + (Ox + initialStep * h) + ', ' + (Oy + (maxY0 - y0)) + ')');

      // Draw the center
      wheel.append('circle')
        .attr({
          cx: 0,
          cy: 0,
          r: 2,
          stroke: color,
          'stroke-width': 1
        });


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
      return 'translate(' + (Ox) + ', ' + Oy + ')'
    });

  staircase
    .append('path')
    .datum(d3.range(STEPS * 2 + 1))
    .attr('d', stepGenerator)
    .attr('stroke', 'black')
    .attr('stroke-width', 1)
    .attr('fill', 'none')
    .attr('transform', function() {
      return 'rotate(' + -θ0 + ', 0, ' + maxY0 + '), translate(0, ' + maxY0 + ')';
    });

  if (drawHandrail) {
    staircase
      .append('line')
      .attr({
        x1: 0,
        x2: h * STEPS,
        y1: 0,
        y2: 0,
        stroke: 'lightgray'
      });
  }
}


//
//function drawGrid(world) {
//  var grid = world
//    .append('g')
//    .attr('id', 'grid');
//
//  grid.selectAll('line.horizontal')
//    .data(d3.range(100))
//    .enter()
//    .append('line')
//    .attr({
//      x1: 0,
//      x2: '100%',
//      y1: function(d) {
//        return d * 10
//      },
//      y2: function(d) {
//        return d * 10
//      },
//      stroke: 'whitesmoke',
//      'stroke-width': function(d) {
//        return (d % 10 == 0 ? 2 : 1)
//      },
//      fill: 'none',
//      class: 'horizontal'
//    });
//
//  grid.selectAll('line.vertical')
//    .data(d3.range(100))
//    .enter()
//    .append('line')
//    .attr({
//      x1: function(d) {
//        return d * 10
//      },
//      x2: function(d) {
//        return d * 10
//      },
//      y1: 0,
//      y2: '100%',
//      stroke: 'whitesmoke',
//      'stroke-width': function(d) {
//        return (d % 10 == 0 ? 2 : 1)
//      },
//      fill: 'none',
//      class: 'horizontal'
//    });
//}


function draw(world) {
  world.selectAll('*').remove();

  init();

  // Rotate the world so that the staircase looks normal
  world.attr('transform', 'rotate(' + θ0 + ', ' + Ox + ', ' + (Oy + maxY0) + ')');

  w1.draw(world);

  if (showSecondWheel) {
    w2.draw(world);
  }

  drawStairCase(world);
}


function initSliders() {
  var n1Label = d3.select('#N1').text(N1);
  var tLabel = d3.select('#T').text(T);
  var rLabel = d3.select('#R').text(R);
  var speedLabel = d3.select('#speed').text(speed);
  var n2Container = d3.select('#N2Container').style('visibility', showSecondWheel ? 'visible' : 'hidden');
  var n2Label = d3.select('#N2').text(N2);

  d3.select("#rangeN1")
    .property('value', N1)
    .on("input", function() {
      N1 = this.value;
      n1Label.text(N1);
      draw(world);
    });

  d3.select("#rangeT")
    .property('value', T)
    .on("input", function() {
      T = this.value;
      tLabel.text(T);
      draw(world);
    });

  d3.select("#rangeR")
    .property('value', R)
    .on("input", function() {
      R = this.value;
      rLabel.text(R);
      draw(world);
    });

  d3.select("#rangeSpeed")
    .property('value', speed)
    .on("input", function() {
      speed = this.value;
      speedLabel.text(speed);
      draw(world);
    });

  d3.select("#checkHandrail")
    .property('checked', drawHandrail ? 'checked' : '')
    .on("change", function() {
      drawHandrail = !drawHandrail;
      draw(world);
    });

  d3.select("#checkHandrail")
    .property('checked', drawHandrail ? 'checked' : '')
    .on("change", function() {
      drawHandrail = !drawHandrail;
      draw(world);
    });

  d3.select("#checkSecondWheel")
    .property('checked', showSecondWheel ? 'checked' : '')
    .on("change", function() {
      showSecondWheel = !showSecondWheel;
      n2Container.style('visibility', showSecondWheel ? 'visible' : 'hidden');
      draw(world);
    });

  d3.select("#rangeN2")
    .property('value', N2)
    .on("input", function() {
      N2 = this.value;
      n2Label.text(N2);
      draw(world);
    });
}

initSliders();

world = d3.select('#world');

draw(world);