'use strict';

function wheelsSimulation() {

    var world;

    function polar2x(r, theta) {
        return Math.cos(theta) * r;
    }

    function polar2y(r, theta) {
        return Math.sin(theta) * r;
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

    function fixedRadius(angle) {
        return 80;
    }

    function r1(angle) {
        return 80 + 20 * Math.sin(6 * angle);
    }


    function r2(angle) {
        return 80 * (1.1 + Math.cos(angle));
    }


    function r3(angle) {
        return 50 / (1 + 0.7 * Math.cos(angle));
    }

    function drawWheel(world, r) {
        var Ox = 300,
            Oy = 170,
            POINTS = 800;

        var angle = d3.scale.linear()
            .domain([0, POINTS - 1])
            .range([0, 2*Math.PI]);

        var wheelGenerator = d3.svg.line()
            .x(function (d, i) {
                return polar2x(r(angle(i)), angle(i));
            })
            .y(function (d, i) {
                return -polar2y(r(angle(i)), angle(i));
            })
            .interpolate('linear');

        var wheel = world
            .append('g')
            .attr('transform', function() {
                return 'translate(' + Ox + ', ' + Oy + ')'
            });

        var path = wheel
            .append('path');

        path
            .transition()
            .tween('blah', function (arg) {
                return function (t) {
                    path.datum(d3.range(t * POINTS))
                        .attr('d', wheelGenerator)
                        .attr('stroke', 'blue')
                        .attr('stroke-width', 2)
                        .attr('fill', 'none');
                }
            })
            .duration(3000)
            .ease('linear')
            .transition()
            .duration(1000)
            .each('end', function() {
                path.remove();

                switch (r) {
                    case fixedRadius:
                        drawWheel(world, r1);
                        break;
                    case r1:
                        drawWheel(world, r2);
                        break;
                    case r2:
                        drawWheel(world, r3);
                        break;
                    case r3:
                        drawWheel(world, fixedRadius);
                        break;
                }
            });
    }

    function draw(world) {
        world.selectAll('*').remove();

        drawAxis(world);
        drawWheel(world, fixedRadius);
    }

    return {
        start: function() {
            world = d3.select('#world6');
            draw(world);
        },

        stop: function() {
            world.selectAll('*').remove();
        }
    }
}
