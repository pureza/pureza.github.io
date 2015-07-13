'use strict';

function completingWheelSimulation() {

// Main simulation parameters
    var T = 120, // Staircase tread (horizontal) length
        R = 70, // Staircase riser (vertical) length
        N1 = 6, // Number of petals on the first wheel
        speed = 50; // Simulation speed (1-100)


// Simulation constants
    var POINTS = 100, // Number of points to draw for each petal
        STEPS = 1, // Number of steps
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
        w1 = wheel(T, R, N1, 0,  10, 'blue');

        maxY0 = w1.y0;

        Ox = 250;
        Oy = 250;
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
                return rad2deg(m * log(1 + x / (m * y0)));
            } else {
                // make x belong to [-x1, 0]
                x = x - x2 - x1;
                return rad2deg(-log(1-m/y0*x) / m);
            }
        }


        function animate(wheel, k) {
            var node = wheel
                .append('g');



            node
                .attr('stroke', 'blue');

            node
                .transition()
                .delay(function() {
                    return (k == 2) ? 4000 : 0;
                })
                    .each('start', function() {
                        node
                            .append('use')
                            .attr('xlink:href', '#petal');
                    })
                .attrTween('transform', function() {
                    var startAngle = 2 * (k - 2) * π / N;
                    var endAngle = 2 * (k - 1) * π / N;
                    return d3.interpolate('rotate(' + rad2deg(startAngle) + ')', 'rotate(' + rad2deg(endAngle) + ')');
                })
                .duration(1000)
                .ease('linear')
                .each('end', function () {
                    node.attr('stroke', 'red');

                    if (k < N) {
                        animate(wheel, k + 1);
                    } else {
                        wheel
                            .transition()
                            .attrTween('transform', function() {
                                return d3.interpolate('translate(' + Ox + ',' + (Oy + (maxY0 - y0)) + '), rotate(0)', 'translate(' + Ox + ',' + (Oy + (maxY0 - y0)) + '), rotate(720)');
                            })
                            .duration(20000)
                            .ease('linear');
                    }
                });


                //.attrTween('transform', function (k) {
                //    var angle = 2 * (k - 1) * π / N;
                //    return 'rotate(' + rad2deg(angle) + ')';
                //});

            //wheel.transition()
            //    .attrTween('transform', tween)
            //    .duration((110 - speed) * 7) // When speed = 100, it takes 1 second
            //    .ease('linear')
            //    .each('end', function () {
            //        animate(wheel);
            //    });
            //
            //function tweenRiser(d, i, a) {
            //    return function (t) {
            //        var totalX = STEPS * h;
            //        t = t * x2 / totalX;
            //        return 'translate(' + (t * totalX + Ox + h) + ',' + (Oy + (maxY0 - y0)) + '), rotate(' + (θ(t)) + ')';
            //    };
            //}
            //
            //
            //function tweenTread(d, i, a) {
            //    return function (t) {
            //        var totalX = STEPS * h;
            //
            //        t = x2 / totalX + t * x1 / totalX;
            //
            //
            //
            //        return 'translate(' + (t * totalX + Ox) + ',' + (Oy + (maxY0 - y0)) + '), rotate(' + (θ(t)) + ')';
            //    };
            //}
            //
            //
            //function reverse(f) {
            //    var tween = f();
            //    return function (d, i, a) {
            //        return function (t) {
            //            return tween(1 - t);
            //        }
            //    }
            //}
        }

        return {

            y0: y0,

            θ1: θ1,

            r: r,

            θ: θ,

            draw: function (world) {
                var angle = d3.scale.linear()
                    .domain([0, POINTS - 1])
                    .range([-π/2 - θ1, -π/2 + θ2]);

                var petalGenerator = d3.svg.line()
                    .x(function (d, i) {
                        return polar2x(r(angle(i)), angle(i));
                    })
                    .y(function (d, i) {
                        return -polar2y(r(angle(i)), angle(i));
                    })
                    .interpolate('linear');

                var id = 'petal';

                var petal = world
                    .append('defs')
                    .append('g')
                    .attr('id', id);

                petal
                    .append('path')
                    .datum(d3.range(POINTS))
                    .attr('d', petalGenerator)
                   // .attr('stroke', 'red')
                    .attr('stroke-width', 2)
                    .attr('shape-rendering', 'crispEdges')
                    .attr('fill', 'none');

                petal
                    .append('line')
                    .attr({
                        x1: 0,
                        y1: 0,
                        x2: polar2x(r(-π/2 - θ1), -π/2 - θ1),
                        y2: -polar2y(r(-π/2 - θ1), -π/2 - θ1),
                        stroke: 'darkgray',
                        'stroke-width': 2,
                        'stroke-dasharray': '3,3'
                    });

                petal
                    .append('line')
                    .attr({
                        x1: 0,
                        y1: 0,
                        x2: polar2x(r(-π/2 + θ2), -π/2 + θ2),
                        y2: -polar2y(r(-π/2 + θ2), -π/2 + θ2),
                        stroke: 'darkgray',
                        'stroke-width': 2,
                        'stroke-dasharray': '3,3'
                    });


                // Translate the wheel to its initial position
                var wheel =
                    world.append('g')
                        .attr('id', 'wheel')
                        .attr('transform', 'translate(' + Ox + ',' + (Oy + (maxY0 - y0)) + ')');

                // Draw the N petals, rotating each one by the appropriate angle.
                var nodes = wheel.selectAll('g.petal')
                    .data(d3.range(1, 2))
                    .enter()
                    .append('g')
                    .attr('transform', function (k) {
                        var angle = 2 * (k - 1) * π / N;
                        return 'rotate(' + rad2deg(angle) + ')';
                    });

                nodes
                    .append('use')
                    .attr('xlink:href', '#' + id)
                    .attr('stroke', 'red');

                // Animate the wheel.
                animate(wheel, 2);
            }
        }
    };



    function draw(world) {
        world.selectAll('*').remove();

        init();

        w1.draw(world);
    }

    return {
        start: function() {
            world = d3.select('#world16');
            draw(world);
        },

        stop: function() {
            world.selectAll('*').remove();
        }
    }

}
