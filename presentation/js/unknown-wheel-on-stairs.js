'use strict';

function unknownWheelOnStairsSimulation() {

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
    var POINTS = 20, // Number of points to use when drawing the spiral
        Ox, // Initial center x
        Oy, // Initial center y
        m, h, θ0;


    var world, // The world (SVG element containing the staircase and wheels)
        w1; // First wheel


// Auxiliar math definitions
    var π = Math.PI,
        exp = Math.exp,
        log = Math.log,
        floor = Math.floor,
        cos = Math.cos,
        sin = Math.sin,
        sqrt = Math.sqrt;


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

    function rad2deg(θ) {
        return θ * 180 / π;
    }

    function init() {
        w1 = wheel();

        // Hypoteneuse of each step
        h = sqrt(T * T + R * R);

        m = R / T;


        // Initial angle of rotation of the wheel, due to the inclination of the
        // staircase (in the paper the staircase is horizontal)
        θ0 = rad2deg(Math.atan(m));
    }


    var wheel = function () {

        /**
         * Calculates the radius of the wheel at angle θ
         */
        function r(θ) {
            return y0 - 10 * Math.random();

            //return y0 - 5 * sin(6*θ);
        }


        /**
         * Calculates the angle of rotation of the wheel at time t
         */
        function θ(t) {
            return t * 2 * 360;
        }


        function animate(wheel, currentStep) {
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

                    // t = ((lastStep - initialStep) * t + initialStep) / STEPS;
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
                    .range([0, 2 * π]);

                var wheelGenerator = d3.svg.line()
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

                //wheel.append('path')
                //    .datum(d3.range(POINTS))
                //    .attr('d', wheelGenerator)
                //    .attr('stroke', 'blue')
                //    .attr('stroke-width', 1)
                //    .attr('shape-renedring', 'crispEdges')
                //    .attr('fill', 'none');

                wheel
                    .append('text')
                    .attr({
                        x: 0,
                        y: y0,
                        stroke: 'blue',
                        'font-size': '0.5em'
                    })
                    .text('?');

                wheel
                    .append('text')
                    .attr({
                        x: y0,
                        y: 0,
                        stroke: 'blue',
                        'font-size': '0.5em'
                    })
                    .text('?');

                wheel
                    .append('text')
                    .attr({
                        x: -y0,
                        y: 0,
                        stroke: 'blue',
                        'font-size': '0.5em'
                    })
                    .text('?');

                wheel
                    .append('text')
                    .attr({
                        x: 0,
                        y: -y0,
                        stroke: 'blue',
                        'font-size': '0.5em'
                    })
                    .text('?');

                wheel
                    .attr('transform', 'translate(' + Ox + ', ' + (Oy) + ')');

                // Draw the center
                wheel.append('circle')
                    .attr({
                        cx: 0,
                        cy: 0,
                        r: 2,
                        stroke: 'blue ',
                        'stroke-width': 1
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
                return 'rotate(' + -θ0 + ', 0, ' + y0 + '), translate(0, ' + (Oy + y0 + 10) + ')';
            });

        staircase
            .append('path')
            .datum(d3.range(STEPS * 2 + 1))
            .attr('d', stepGenerator)
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
            .attr('fill', 'none');

        staircase
            .append('line')
            .attr({
                x1: 0,
                x2: h * (STEPS - 1),
                y1: -y0,
                y2: m * h * (STEPS - 1) - y0,
                stroke: 'darkgray',
                'stroke-width': 2
            });
    }




    function draw(world) {
        world.selectAll('*').remove();

        init();

        world.attr('transform', 'rotate(' + θ0 + ', ' + Ox + ', ' + (Oy + 0) + ')');

        w1.draw(world);

        drawRoad(world);
    }

    return {
        start: function () {
            world = d3.select('#world4');
            draw(world);
        },

        stop: function () {
            world.selectAll('*').remove();
            trailPoints = [];
        }
    }
}