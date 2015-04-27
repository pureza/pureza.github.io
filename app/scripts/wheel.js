'use strict';

// Main simulation parameters
var T = 60, // Staircase tread (horizontal) length
  R = 80, // Staircase riser (vertical) length
  N = 5; // Number of petals


// Auxiliar constants
var m,
  mm1,
  y0,
  θ1,
  θ2,
  h,
  Rx,
  Tx,
  c1,
  c2;


// Auxiliar parameters
var points = 200, // Number of points to draw for each petal
  steps = 10, // Number of steps
  Ox = 100, // Initial center x
  Oy = 200; // Initial center y


// Auxiliar math definitions
var π = Math.PI,
  exp = Math.exp,
  log = Math.log,
  sqrt = Math.sqrt,
  floor = Math.floor;


var svgContainer;


/**
 * Computes some simulation constants that depend on the parameters
 */
function computeConstants() {

  // Inverse of the staircase slope
  m = T / R;

  mm1 = m * m + 1;

  // Initial height of the wheel
  y0 = T / (sqrt(mm1) * (exp((2 * π * m) / ((mm1) * N)) - 1));

  // θ1 and θ2 angle definitions, as in the paper.
  θ1 = 1 / m * log(T / (y0 * sqrt(mm1)) + 1);
  θ2 = m * log(T / (y0 * sqrt(mm1)) + 1);

  // Hypoteneuse of each step
  h = sqrt(T * T + R * R);

  // Length of the x component of the riser
  Rx = h - T * m / sqrt(mm1);

  // Length of the x component of the tread
  Tx = h - Rx;

  // Integration constant of θ(t) in the riser
  c1 = -log(y0) / m;

  // Integration constant of θ(t) in the tread
  c2 = m * log(m * y0);  
}


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
  var currentStep = floor(t * steps);
  t = t - currentStep / steps;

  // Distance traveled in the x axis for this step
  var x = t * h * steps;

  if (x <= Rx) {
    // Still in the riser
    return rad2deg(c1 + log(y0 + m * x) / m);
  } else {
    x = x - Rx;
    return rad2deg(c2 - log(m * y0 - (x - Tx)) * m);
  }
}


/**
 * Converts from polar to cartesian coordinates.
 */
function polar2cart(r, θ) {
  var x = Math.cos(θ) * r,
    y = Math.sin(θ) * r;
  return {
    x: x,
    y: y
  };
}


/**
 * Converts from radians to degrees.
 */
function rad2deg(θ) {
  return θ * 180 / π;
}


function drawWheel(container) {
  var angle = d3.scale.linear()
    .domain([0, points - 1])
    .range([-π / 2 - θ2, -π / 2 + θ1]);

  var petalGenerator = d3.svg.line()
    .x(function(d, i) {
      return polar2cart(r(angle(i)), angle(i)).x;
    })
    .y(function(d, i) {
      return -polar2cart(r(angle(i)), angle(i)).y;
    })
    .interpolate('linear');

  var petal = container
    .append('defs')
    .append('g')
    .attr('id', 'petal');

  petal
    .append('path')
    .datum(d3.range(points))
    .attr('d', petalGenerator)
    .attr('stroke', 'blue')
    .attr('stroke-width', 1)
    .attr('fill', 'none');



  var wheel =
    container.append('g')
    .attr('id', 'wheel')
    .attr('transform', 'translate(' + Ox + ', ' + Oy + ')');


  wheel.transition()
    .attrTween('transform', tween)
    .duration(10000)
    .ease('linear');

  function tween(d, i, a) {
    return function(t) {
      var totalX = steps * h;
      return 'translate(' + (t * totalX + Ox) + ',' + Oy + '), rotate(' + (θ(t)) + ')';
    };
  }

  var nodes = wheel.selectAll('g.petal')
    .data(d3.range(1, N + 1))
    .enter()
    .append('g')
    .attr('transform', function(k) {
      var angle = 2 * (k - 1) * π / N;
      return 'rotate(' + rad2deg(angle) + ')';
    });

  nodes
    .append('use')
    .attr('xlink:href', '#petal');
}


function drawStairCase(container) {

  var stepGenerator = d3.svg.line()
    .x(function(d, i) {
      return T * Math.floor(i / 2);
    })
    .y(function(d, i) {
      return R * Math.ceil(i / 2);
    })
    .interpolate('linear');

  container
    .append('g')
    .attr('id', 'staircase')
    .append('path')
    .datum(d3.range(steps * 2 + 1))
    .attr('d', stepGenerator)
    .attr('stroke', 'red')
    .attr('stroke-width', 1)
    .attr('fill', 'none')
    .attr('transform', function() {
      var h = Math.sin(θ2) * T,
        w = -Math.cos(θ2) * T,
        startX = Ox,
        startY = Oy + y0,
        angle = -rad2deg(Math.atan(1 / m));

      return 'rotate(' + angle + ' ' + startX + ', ' + startY + '), translate(' + startX + ', ' + startY + ')'
    });
}



function drawGrid(container) {
  var grid = container
    .append('g')
    .attr('id', 'grid');

  grid.selectAll('line.horizontal')
    .data(d3.range(100))
    .enter()
    .append('line')
    .attr({
      x1: 0,
      x2: '100%',
      y1: function(d) {
        return d * 10
      },
      y2: function(d) {
        return d * 10
      },
      stroke: 'whitesmoke',
      'stroke-width': function(d) {
        return (d % 10 == 0 ? 2 : 1)
      },
      fill: 'none',
      class: 'horizontal'
    });

  grid.selectAll('line.vertical')
    .data(d3.range(100))
    .enter()
    .append('line')
    .attr({
      x1: function(d) {
        return d * 10
      },
      x2: function(d) {
        return d * 10
      },
      y1: 0,
      y2: '100%',
      stroke: 'whitesmoke',
      'stroke-width': function(d) {
        return (d % 10 == 0 ? 2 : 1)
      },
      fill: 'none',
      class: 'horizontal'
    });
}


function draw() {
  svgContainer.selectAll('*').remove();

  computeConstants();
  drawWheel(svgContainer);
  drawStairCase(svgContainer);
}


var svgContainer = d3.select('body')
  .append('svg');


d3.select("#rangeN").on("input", function() {
  N = this.value;
  draw();
});

d3.select("#rangeT").on("input", function() {
  T = this.value;
  draw();
});

d3.select("#rangeR").on("input", function() {
  R = this.value;
  draw();
});


draw();