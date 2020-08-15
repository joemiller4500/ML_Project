d3.csv("test.csv").then(d => chart(d))

function chart(data) {

	var keys = data.columns.slice(1);

	var parseTime = d3.timeParse("%d-%b-%Y"),
		formatDate = d3.timeFormat("%m-%d"),
		bisectDate = d3.bisector(d => d.Date).left;
		formatValue = d3.format("");

	data.forEach(function(d) {
		d.Date = parseTime(d.Date);
		return d;
    })
    var svgWidth = 850;
    var svgHeight = 410;

    var svg = d3.select("#chart"),
        margin = {top: 15, right: 35, bottom: 15, left: 35},
        // width = +svg.attr("width") - margin.left - margin.right,
        width = svgWidth - margin.left - margin.right,
        // height = +svg.attr("height") - margin.top - margin.bottom;
        height = svgHeight - margin.top - margin.bottom;

	// var svg = d3.select("#chart"),
	// 	margin = {top: 15, right: 35, bottom: 15, left: 35},
	// 	width = +svg.attr("width") - margin.left - margin.right,
	// 	height = +svg.attr("height") - margin.top - margin.bottom;

	var x = d3.scaleTime()
		.rangeRound([margin.left, width - margin.right])
		.domain(d3.extent(data, d => d.Date))

	var y = d3.scaleLinear()
		.rangeRound([height - margin.bottom, margin.top]);

	var z = d3.scaleOrdinal(d3.schemeCategory10);

	var line = d3.line()
		.curve(d3.curveCardinal)
		.x(d => x(d.Date))
		.y(d => y(d.stocks));

	svg.append("g")
		.attr("class","x-axis")
		.attr("transform", "translate(0," + (height - margin.bottom) + ")")
		.call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b")));

	svg.append("g")
		.attr("class", "y-axis")
		.attr("transform", "translate(" + margin.left + ",0)");

	var focus = svg.append("g")
		.attr("class", "focus")
		.style("display", "none");

	focus.append("line").attr("class", "lineHover")
		.style("stroke", "#999")
		.attr("stroke-width", 1)
		.style("shape-rendering", "crispEdges")
		.style("opacity", 0.5)
		.attr("y1", -height)
		.attr("y2",0);

	focus.append("text").attr("class", "lineHoverDate")
		.attr("text-anchor", "middle")
		.attr("font-size", 15);

	var overlay = svg.append("rect")
		.attr("class", "overlay")
		.attr("x", margin.left)
		.attr("width", width - margin.right - margin.left)
		.attr("height", height)

	upDate(d3.select('#selectbox').property('value'), 0);

	function upDate(input, speed) {

		var copy = keys.filter(f => f.includes(input))

		var companies = copy.map(function(id) {
			return {
				id: id,
				values: data.map(d => {return {Date: d.Date, stocks: +d[id]}})
			};
		});

		y.domain([
			d3.min(companies, d => d3.min(d.values, c => c.stocks)),
			d3.max(companies, d => d3.max(d.values, c => c.stocks))
		]).nice();

		svg.selectAll(".y-axis").transition()
			.duration(speed)
			.call(d3.axisLeft(y).tickSize(-width + margin.right + margin.left))

		var comp = svg.selectAll(".companies")
			.data(companies);

		comp.exit().remove();

		comp.enter().insert("g", ".focus").append("path")
			.attr("class", "line companies")
			.style("stroke", d => z(d.id))
			.merge(comp)
		.transition().duration(speed)
			.attr("d", d => line(d.values))

		tooltip(copy);
	}

	function tooltip(copy) {
		
		var labels = focus.selectAll(".lineHoverText")
			.data(copy)

		labels.enter().append("text")
			.attr("class", "lineHoverText")
			.style("fill", d => z(d))
			.attr("text-anchor", "start")
			.attr("font-size",14)
			.attr("dy", (_, i) => 1 + i * 2 + "em")
			.merge(labels);

		var circles = focus.selectAll(".hoverCircle")
			.data(copy)

		circles.enter().append("circle")
			.attr("class", "hoverCircle")
			.style("fill", d => z(d))
			.attr("r", 2.5)
			.merge(circles);

		svg.selectAll(".overlay")
			.on("mouseover", function() { focus.style("display", null); })
			.on("mouseout", function() { focus.style("display", "none"); })
			.on("mousemove", mousemove);

		function mousemove() {

			var x0 = x.invert(d3.mouse(this)[0]),
				i = bisectDate(data, x0, 1),
				d0 = data[i - 1],
				d1 = data[i],
				d = x0 - d0.Date > d1.Date - x0 ? d1 : d0;

			focus.select(".lineHover")
				.attr("transform", "translate(" + x(d.Date) + "," + height + ")");

			focus.select(".lineHoverDate")
				.attr("transform", 
					"translate(" + x(d.Date) + "," + (height + margin.bottom) + ")")
				.text(formatDate(d.Date));

			focus.selectAll(".hoverCircle")
				.attr("cy", e => y(d[e]))
				.attr("cx", x(d.Date));

			focus.selectAll(".lineHoverText")
				.attr("transform", 
					"translate(" + (x(d.Date)) + "," + height / 2.5 + ")")
				.text(e => e + " " + "º" + formatValue(d[e]));

			x(d.Date) > (width - width / 4) 
				? focus.selectAll("text.lineHoverText")
					.attr("text-anchor", "end")
					.attr("dx", -10)
				: focus.selectAll("text.lineHoverText")
					.attr("text-anchor", "start")
					.attr("dx", 10)
		}
	}

	var selectbox = d3.select("#selectbox")
		.on("change", function() {
			upDate(this.value, 750);
		})
}