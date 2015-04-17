'use strict';

// Auxiliar math definitions
var PI = Math.PI,
  exp = Math.exp,
  log = Math.log,
  sqrt = Math.sqrt;


var points = 200, // Number of points to draw for each petal
    T = 60,      // Staircase's tread (horizontal) length
    R = 60,      // Staircase's riser (vertical) length
    N = 1,       // Number of petals
    steps = 10,  // Number of steps
    Ox = 100,
    Oy = 200;

// Negated slope of the riser
var m = T/R;

var mm1 = m*m + 1;

// Initial height of the wheel
var y0 = T/(sqrt(mm1) * (exp((2*PI * m) / ((mm1)*N)) - 1));

var theta1 = 1/m*log(T/(y0*sqrt(mm1))+1);
var theta2 = m*log(T/(y0*sqrt(mm1))+1);

function r(theta) {
  if (theta >= -PI/2 && theta <= -PI/2 + theta1) {
    return y0 * exp(m*(theta + PI/2));
  } else {
    return y0 * exp(-1/m*(theta + PI/2));
  }
}


function theta(t) {
  var dist = t * steps * (T + R);
  var currentStep = Math.floor(dist / (T + R));

  var currentStepDist = dist - currentStep * (T + R);
  //var accumulatedAngle = currentStep * (theta1 + theta2);

  if (currentStepDist <= R) {
    // Is still in the riser bit
    var c = 1; //log(y0)/m;
    //console.log(-rad2deg((c - log(y0 + m*currentStepDist) / m)));

    return -rad2deg((c - log(y0 + m*currentStepDist) / m));
  } else {

    c = PI - m*log(y0*m + R);

    console.log(-rad2deg(c + log(y0*m + currentStepDist) * m));
    //return +rad2deg(c + log(y0*m + currentStepDist) * m);
    return -rad2deg((c - log(y0 + m*(currentStepDist - R)) / m));
  }


  //console.log(currentStepDist);
  //
  ////var currentStep = Math.floor(t * steps);
  //var tWithinStep = (t - currentStep/steps);
  //var riserAngle = R / (T + R) < tWithinStep*steps ? theta1 : 0;
  //var accumulatedAngle = currentStep*(theta1 + theta2) + riserAngle;
  ////
  //////console.log(accumulatedAngle);
  ////
  ////
  ////
  //var x = tWithinStep * (steps * (T + R));
  //
  ////console.log(x);
  //
  //////console.log(x);
  ////
  //////console.log(-rad2deg(accumulatedAngle + (1 - log(y0 + m*x) / m)));
  ////
  //var c = -PI/2 + log(y0)/m;
  ////console.log(c);
  ////
  ////return -rad2deg(-accumulatedAngle + (-c - log(y0 + m*x) / m));
  //
  //
  //return -rad2deg(accumulatedAngle + (c - log(y0 + m*x) / m));
}


function polar2cart(r, theta) {
  var x = Math.cos(theta) * r,
    y = Math.sin(theta) * r;
  return { x: x, y: y };
}


function rad2deg(angle) {
  return angle * 180 / PI;
}


function drawWheel(container) {
  var angle = d3.scale.linear()
    .domain([0, points - 1])
    .range([-PI / 2 - theta2, -PI/2 + theta1]);

  var petalGenerator = d3.svg.line()
    .x(function (d, i) { return polar2cart(r(angle(i)), angle(i)).x; })
    .y(function (d, i) { return -polar2cart(r(angle(i)), angle(i)).y; })
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

  //petal
  //  .append('circle')
  //  .attr({
  //    cx: 0,
  //    cy: 0,
  //    r: 2
  //  })
  //  .attr('stroke', 'blue')
  //  .attr('stroke-width', 1)
  //  .attr('fill', 'none');

  petal
    .append('line')
    .attr({
      x1: -100,
      y1: -100,
      x2: 100,
      y2: 100
    })
    .attr('stroke', 'purple')
    .attr('stroke-width', 1)
    .attr('fill', 'none');


  var wheel =
    container.append('g')
      .attr('id', 'wheel')
      .attr('transform', 'translate(' + Ox + ', ' + Oy + ')');




  wheel.transition()
    .attrTween('transform', tween)
    .duration(100000)
    .ease('linear');

  function tween(d, i, a) {


    return function(t) {
      var totalX = steps * sqrt(R*R+T*T);
      var totalAngle = 360 * (steps / N);
     //t = 0.05;
      //return 'rotate(' + t*steps*(T+R) + ' ' + (t * totalX + Ox)  + ' ' + Oy + '), translate(' + (t * totalX + Ox)  + ',' + Oy + ')';
      return 'translate(' + (t * totalX + Ox)  + ',' + Oy + '), rotate(' + (theta(t)) + ')';
    };

    //var finalX = steps * T + Ox;
    //var finalY = steps * R + Oy;
    //
    //return d3.interpolateString('translate(' + Ox + ', ' + Oy + ')', 'translate(' + finalX + ', ' + finalY + ')');
  }

  var nodes = wheel.selectAll('g.petal')
    //.data(d3.range(1, N + 1))
    .data(d3.range(1, 2))
    .enter()
    .append('g')
    .attr('transform', function(k) { var angle = 2*(k-1)*PI/N; return 'rotate(' + rad2deg(angle) + ')'; });

  nodes
    .append('use')
    .attr('xlink:href', '#petal');
}


function drawStairCase(container) {

  var stepGenerator = d3.svg.line()
    .x(function(d, i) { return T * Math.floor(i/2);  })
    .y(function(d, i) { return R * Math.ceil(i/2);  })
    .interpolate('linear');

  //var stepGenerator = d3.svg.line()
  //  .x(function(d, i) { return T * Math.ceil(i/2);  })
  //  .y(function(d, i) { return R * Math.floor(i/2); })
  //  .interpolate('linear');

  container
    .append('g')
    .attr('id', 'staircase')
    .append('path')
    .datum(d3.range(steps * 2 + 1))
    .attr('d', stepGenerator)
    .attr('stroke', 'red')
    .attr('stroke-width', 1)
    .attr('fill', 'none')
    .attr('transform', function () {
      var h = Math.sin(theta2) * T,
        w = -Math.cos(theta2) * T,
        startX = Ox,
        startY = Oy + y0,
        angle = -rad2deg(Math.atan(1/m));

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
      y1: function (d) { return d * 10 },
      y2: function (d) { return d * 10 },
      stroke: 'whitesmoke',
      'stroke-width': function (d) { return (d % 10 == 0 ? 2 : 1) },
      fill: 'none',
      class: 'horizontal'
    });

  grid.selectAll('line.vertical')
    .data(d3.range(100))
    .enter()
    .append('line')
    .attr({
      x1: function (d) { return d * 10 },
      x2: function (d) { return d * 10 },
      y1: 0,
      y2: '100%',
      stroke: 'whitesmoke',
      'stroke-width': function (d) { return (d % 10 == 0 ? 2 : 1) },
      fill: 'none',
      class: 'horizontal'
    });
}




//The SVG Container
var svgContainer = d3.select('body')
  .append('svg');



//svgContainer
//  .append('line')
//  .attr({
//    x1: 0,
//    x2: 800,
//    y1: 400,
//    y2: 400,
//    'stroke-width': 1,
//    'stroke': 'black'
//  });


drawGrid(svgContainer);


drawWheel(svgContainer);
drawStairCase(svgContainer);


