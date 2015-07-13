'use strict';

function noSlidingSimulation() {

// Main simulation parameters
    var y0 = 50,
        Ox = 90,
        Oy = 170,
        totalX = 100,
        speed = 70;


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


    function deg2rad(θ) {
        return θ / 180 * π;
    }


    function init() {
        w1 = wheel();
    }


    var wheel = function () {

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
                    var currentAngle = (t * totalX / y0);

                    var arcGenerator = d3.svg.arc()
                        .innerRadius(y0)
                        .outerRadius(y0)
                        .startAngle(π - currentAngle)
                        .endAngle(π);

                    wheel
                        .select('path.arc')
                        .datum(d3.range(POINTS))
                        .attr('d', arcGenerator)
                        .attr('stroke', 'red')
                        .attr('stroke-width', 2)
                        .attr('shape-renedring', 'crispEdges')
                        .attr('fill', 'none');

                    world.select('.trail')
                        .attr({
                            x1: 0,
                            x2: t * totalX,
                            y1: y0,
                            y2: y0,
                            stroke: 'red',
                            'stroke-width': 2
                        });

                    return 'translate(' + (t * totalX + Ox) + ',' + (Oy) + '), rotate(' + rad2deg(currentAngle) + ')';
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
                var wheel =
                    world.append('g')
                        .attr('id', 'wheel');

                wheel.append('circle')
                    .attr({
                        cx: 0,
                        cy: 0,
                        r: y0,
                        stroke: 'blue',
                        'stroke-width': 2,
                        'stroke-dasharray': "3, 3",
                        fill: 'none'
                    });

                wheel
                    .attr('transform', 'translate(' + (Ox) + ', ' + (Oy) + ')');

                // Draw the center
                wheel.append('circle')
                    .attr({
                        cx: 0,
                        cy: 0,
                        r: 2,
                        stroke: 'blue',
                        'stroke-width': 1
                    });

                wheel.append('path')
                    .classed('arc', true);

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
                x1: -100,
                x2: 500,
                y1: y0,
                y2: y0,
                stroke: 'darkgray',
                'stroke-width': 2
            });

        road
            .append('line')
            .classed('trail', true);
    }


    function drawAxis(world) {
        world
            .append('line')
            .attr({
                x1: 0,
                x2: 600,
                y1: 170,
                y2: 170,
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
                y: 200,
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
    }


    function draw(world) {
        world.selectAll('*').remove();

        init();

        drawAxis(world);

        w1.draw(world);

        drawRoad(world);
    }

    return {
        start: function () {
            world = d3.select('#world8');
            draw(world);
        },

        stop: function () {
            world.selectAll('*').remove();
        }
    }
}

