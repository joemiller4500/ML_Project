// The code for the chart is wrapped inside a function that
// automatically resizes the chart
function makeResponsive() {

  // if the SVG area isn't empty when the browser loads,
  // remove it and replace it with a resized version of the chart
  var svgArea = d3.select("body").select("svg");

  // clear svg is not empty
  if (!svgArea.empty()) {
    svgArea.remove();
  }

  // SVG wrapper dimensions are determined by the current width and
  // height of the browser window.
  var svgWidth = 960;
  var svgHeight = 500;

  var margin = { top: 20, right: 40, bottom: 60, left: 50 };

  var height = svgHeight - margin.top - margin.bottom;
  var width = svgWidth - margin.left - margin.right;

  // Append SVG element
  var svg = d3
    .select(".chart")
    .append("svg")
    .attr("height", svgHeight)
    .attr("width", svgWidth);

  // Append group element
  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // var tooltip = d3.select('#tooltip');
  //  tooltipLine = chart.append('line');
  
  // Read CSV
  d3.csv("ibm_table.csv").then(function (ibmData) {

    // create day parser
    // var dayParser = d3.timeParse("%d-%b");

    // parse data
    ibmData.forEach(function (data) {
      data.day = (data.Day);
      data.company = +data.Company;
      data.actual = +data.Actual;
      data.prediction = +data.Prediction;
    });

    // create scales
    var xTimeScale = d3.scaleLinear()
      .domain(d3.extent(ibmData, d => d.day))
      .range([0, width]);

    var yLinearScale1 = d3.scaleLinear()
      .domain([0, d3.max(ibmData, d => d.actual)])
      .range([height, 0]);

    var yLinearScale2 = d3.scaleLinear()
      .domain([0, d3.max(ibmData, d => d.prediction)])
      .range([height, 0]);

    // create axes
    var bottomAxis = d3.axisBottom(xTimeScale);
    var leftAxis = d3.axisLeft(yLinearScale1).ticks(6);
    var rightAxis = d3.axisRight(yLinearScale2).ticks(6);

    // append axes
    chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    chartGroup.append("g")
      .call(leftAxis);

    chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(rightAxis);

    // chartGroup.append('text')
    //   .html('Stock Prediction Over Time')
    //   .attr('x', 200);

      // Append axes titles
    chartGroup.append("text")
      .attr("transform", `translate(${width / 2.3}, ${height + margin.top + 30})`)
      .attr("font-family", "sans-serif")
      .attr("font-size", "20px")
      .attr("fill", "red")
      .text("Stock Prediction Over Time");


    // line generator
   // var line1 = d3.line()
   //   .x(d => xTimeScale(d.day))
   //   .y(d => yLinearScale1(d.actual));

    var line2 = d3.line()
      .x(d => xTimeScale(d.day))
      .y(d => yLinearScale2(d.prediction));  
      // .y(d => yLinearScale2(d.company));  

    // append line
    // chartGroup.append("path")
    //   .data([ibmData])
    //   .attr("d", line1)
    //   .attr("fill", "none")
    //   .attr("stroke", "green")
    //   .classed("line green", true);

    chartGroup.append("path")
      .data([ibmData])
      .attr("d", line2)
      .attr("fill", "none")
      .attr("stroke", "red")
      .classed("line orange", true);

    // append circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(ibmData)
      .enter()
      .append("circle")
      .attr("cx", d => xTimeScale(d.day))
      .attr("cy", d => yLinearScale2(d.company))
      .attr("cy", d => yLinearScale1(d.actual))
      .attr("cy", d => yLinearScale2(d.prediction))
      .attr("r", "1")
      .attr("fill", "yellow")
      .attr("stroke-width", "1.5  ")
      .attr("stroke", "gray");

      // var circlesGroup = chartGroup.selectAll("circle")
      // .data(ibmData)
      // .enter()
      // .append("circle")
      // .attr("cx", d => xTimeScale(d.day))
      // .attr("cy", d => yLinearScale1(d.actual))
      // .attr("cy", d => yLinearScale2(d.prediction))
      // .attr("r", "2")
      // .attr("fill", "gold")
      // .attr("stroke-width", "1")
      // .attr("stroke", "black");
    

    // day formatter to display days nicely
    // var dayFormatter = d3.timeFormat("%d-%b");

    // Step 1: Initialize Tooltip
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .attr("font-family", "sans-serif")
      .offset([80, -60])
      .html(function (d) {
        return (`IBM<hr>actual:${d.actual}<hr>predict:${d.prediction}`);
      });

    // Step 2: Create the tooltip in chartGroup.
    chartGroup.call(toolTip);

    // Step 3: Create "mouseover" event listener to display tooltip
    circlesGroup.on("mouseover", function (d) {
      toolTip.show(d, this);
    })
      // Step 4: Create "mouseout" event listener to hide tooltip
      .on("mouseout", function (d) {
        toolTip.hide(d);
      });
  }).catch(function (error) {
    console.log(error);
  });
}

// When the browser loads, makeResponsive() is called.
makeResponsive();

// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);
