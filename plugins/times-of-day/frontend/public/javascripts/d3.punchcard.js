'use strict';
if (typeof module !== 'undefined') module.exports = simpleheat;

var options = {
	mTop: 10,
	mRight: 10,
	mBottom: 10,
	mLeft: 15,
	width: 950,
	height: 300,
	padding: 3,
	xLabelHeight: 30,
	yLabelWidth: 120,
	borderWidth: 3,
	duration: 500,
};
var labelsX = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

function PunchCard(element) {
	if (!(this instanceof PunchCard)) return new PunchCard(element);

	this.chart = d3.select(element).append('svg')
		.attr('width', options.width + options.mLeft + options.mRight)
		.attr('height', options.height + options.mTop + options.mBottom)
		.append('g')
		.attr('transform', 'translate(' + options.mLeft + ',' + options.mTop + ')');

	this.border = this.chart.append('rect')
		.attr('x', options.yLabelWidth)
		.attr('y', options.xLabelHeight)
		.style('fill-opacity', 0)
		.style('stroke', '#000')
		.style('stroke-width', options.borderWidth)
		.style('shape-rendering', 'crispEdges');
}

PunchCard.prototype = {
	chart: null,
	border: null,
	update: function (data) {

		var allValues = Array.prototype.concat.apply([], data.map(function (d) {
			return d.values;
		}));
		var maxWidth = d3.max(data.map(function (d) {
			return d.values.length;
		}));
		var maxR = d3.min([(options.width - options.yLabelWidth) / maxWidth, (options.height - options.xLabelHeight) / data.length]) / 2;

		var r = function (d) {
			if (d === 0) return 0;

			var f = d3.scale.sqrt()
				.domain([d3.min(allValues), d3.max(allValues)])
				.rangeRound([2, maxR - options.padding]);

			return f(d);
		};

		var c = d3.scale.linear()
			.domain([d3.min(allValues), d3.max(allValues)])
			.rangeRound([255 * 0.8, 0]);

		var rows = this.chart.selectAll('.row')
			.data(data, function (d) {
				return d.label;
			});

		rows.enter().append('g')
			.attr('class', 'row');

		rows.exit()
			.transition()
			.duration(options.duration)
			.style('fill-opacity', 0)
			.remove();

		rows.transition()
			.duration(options.duration)
			.attr('transform', function (d, i) {
				return 'translate(' + options.yLabelWidth + ',' + (maxR * i * 2 + maxR + options.xLabelHeight) + ')';
			});

		var dots = rows.selectAll('circle')
			.data(function (d) {
				return d.values;
			});

		dots.enter().append('circle')
			.attr('cy', 0)
			.attr('r', 0)
			.style('fill', '#ffffff')
			.text(function (d) {
				return d;
			});

		dots.exit()
			.transition()
			.duration(options.duration)
			.attr('r', 0)
			.remove();

		dots.transition()
			.duration(options.duration)
			.attr('r', function (d) {
				return r(d);
			})
			.attr('cx', function (d, i) {
				return i * maxR * 2 + maxR;
			})
			.style('fill', function (d) {
				return 'rgb(' + c(d) + ',' + c(d) + ',' + c(d) + ')';
			});

		var dotLabels = rows.selectAll('.dot-label')
			.data(function (d) {
				return d.values;
			});

		var dotLabelEnter = dotLabels.enter().append('g')
			.attr('class', 'dot-label')
			.on('mouseover', function (d) {
				var selection = d3.select(this);
				selection.select('rect').transition().duration(100).style('opacity', 1);
				selection.select("text").transition().duration(100).style('opacity', 1);
			})
			.on('mouseout', function (d) {
				var selection = d3.select(this);
				selection.select('rect').transition().style('opacity', 0);
				selection.select("text").transition().style('opacity', 0);
			});

		dotLabelEnter.append('rect')
			.style('fill', '#000000')
			.style('opacity', 0);

		dotLabelEnter.append('text')
			.style('text-anchor', 'middle')
			.style('fill', '#ffffff')
			.style('opacity', 0);

		dotLabels.exit().remove();

		dotLabels
			.attr('transform', function (d, i) {
				return 'translate(' + (i * maxR * 2) + ',' + (-maxR) + ')';
			})
			.select('text')
			.text(function (d) {
				return d;
			})
			.attr('y', maxR + 4)
			.attr('x', maxR);

		dotLabels
			.select('rect')
			.attr('width', maxR * 2)
			.attr('height', maxR * 2);

		var xLabels = this.chart.selectAll('.xLabel')
			.data(labelsX);

		xLabels.enter().append('text')
			.attr('y', options.xLabelHeight)
			.attr('transform', 'translate(0,-6)')
			.attr('class', 'xLabel')
			.style('text-anchor', 'middle')
			.style('fill-opacity', 0);

		xLabels.exit()
			.transition()
			.duration(options.duration)
			.style('fill-opacity', 0)
			.remove();

		xLabels.transition()
			.text(function (d) {
				return d;
			})
			.duration(options.duration)
			.attr('x', function (d, i) {
				return maxR * i * 2 + maxR + options.yLabelWidth;
			})
			.style('fill-opacity', 1);

		var yLabels = this.chart.selectAll('.yLabel')
			.data(data, function (d) {
				return d.label;
			});

		yLabels.enter().append('text')
			.text(function (d) {
				return d.label;
			})
			.attr('x', options.yLabelWidth)
			.attr('class', 'yLabel')
			.style('text-anchor', 'end')
			.style('fill-opacity', 0);

		yLabels.exit()
			.transition()
			.duration(options.duration)
			.style('fill-opacity', 0)
			.remove();

		yLabels.transition()
			.duration(options.duration)
			.attr('y', function (d, i) {
				return maxR * i * 2 + maxR + options.xLabelHeight;
			})
			.attr('transform', 'translate(-6,' + maxR / 2.5 + ')')
			.style('fill-opacity', 1);

		var vert = this.chart.selectAll('.vert')
			.data(labelsX);

		vert.enter().append('line')
			.attr('class', 'vert')
			.attr('y1', options.xLabelHeight + options.borderWidth / 2)
			.attr('stroke', '#888')
			.attr('stroke-width', 1)
			.style('shape-rendering', 'crispEdges')
			.style('stroke-opacity', 0);

		vert.exit()
			.transition()
			.duration(options.duration)
			.style('stroke-opacity', 0)
			.remove();

		vert.transition()
			.duration(options.duration)
			.attr('x1', function (d, i) {
				return maxR * i * 2 + options.yLabelWidth;
			})
			.attr('x2', function (d, i) {
				return maxR * i * 2 + options.yLabelWidth;
			})
			.attr('y2', maxR * 2 * data.length + options.xLabelHeight - options.borderWidth / 2)
			.style('stroke-opacity', function (d, i) {
				return i ? 1 : 0;
			});

		var horiz = this.chart.selectAll('.horiz').data(data, function (d) {
			return d.label;
		});

		horiz.enter().append('line')
			.attr('class', 'horiz')
			.attr('x1', options.yLabelWidth + options.borderWidth / 2)
			.attr('stroke', '#888')
			.attr('stroke-width', 1)
			.style('shape-rendering', 'crispEdges')
			.style('stroke-opacity', 0);

		horiz.exit()
			.transition()
			.duration(options.duration)
			.style('stroke-opacity', 0)
			.remove();

		horiz.transition()
			.duration(options.duration)
			.attr('x2', maxR * 2 * labelsX.length + options.yLabelWidth - options.borderWidth / 2)
			.attr('y1', function (d, i) {
				return i * maxR * 2 + options.xLabelHeight;
			})
			.attr('y2', function (d, i) {
				return i * maxR * 2 + options.xLabelHeight;
			})
			.style('stroke-opacity', function (d, i) {
				return i ? 1 : 0;
			});

		this.border.transition()
			.duration(options.duration)
			.attr('width', maxR * 2 * labelsX.length)
			.attr('height', maxR * 2 * data.length);

	}
};