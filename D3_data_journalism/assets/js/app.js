let svgWidth = 960;
let svgHeight = 500;
let margin = { top: 20, right: 40, bottom: 80, left: 100 };
let width = svgWidth - margin.left - margin.right;
let height = svgHeight - margin.top - margin.bottom;

let svg = d3.select("#scatter").append("svg").attr("width", svgWidth).attr("height", svgHeight);
let chartGroup = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

// Functions

let xScale = (hairData, chosenXAxis) => {
  let xLinearScale = d3.scaleLinear()
    .domain([d3.min(hairData, d => d[chosenXAxis]) * 0.8, d3.max(hairData, d => d[chosenXAxis]) * 1.2])
    .range([0, width]);

  return xLinearScale;
}

let yScale = (hairData, chosenYAxis) => {
  let yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(hairData, d => d[chosenYAxis])])
    .range([height, 0]);

  return yLinearScale;
}

let renderAxes = (newXScale, xAxis) => {
  let bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
  return xAxis;
}

let renderCircles = (circlesGroup, newXScale, chosenXaxis) => {
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));
  return circlesGroup;
}

let updateToolTip = (chosenXAxis, circlesGroup) => {
  let label = "";
  if (chosenXAxis === "hair_length") {
    label = "Hair Length:";
  }
  else {
    label = "# of Albums:";
  }

  let toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(d => `${d.rockband}<br>${label} ${d[chosenXAxis]}`);

  circlesGroup.call(toolTip);

  circlesGroup
    .on("mouseover", data => toolTip.show(data))
    .on("mouseout", data => toolTip.hide(data));

  return circlesGroup;
}

let chosenXAxis = "hair_length";
let chosenYAxis = "num_hits";

d3.csv("hairdata.csv").then((hairData, err) => {
  if (err) throw err;

  // Data =========================

  hairData.forEach(data => {
    data.hair_length = +data.hair_length;
    data.num_hits = +data.num_hits;
    data.num_albums = +data.num_albums;
  });

  // X and Y axis =================

  let xLinearScale = xScale(hairData, chosenXAxis);
  let yLinearScale = yScale(hairData, chosenYAxis);

  let bottomAxis = d3.axisBottom(xLinearScale);
  let leftAxis = d3.axisLeft(yLinearScale);

  let xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  let yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // Labels for X and Y axis  =================

  let xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  let hairLengthLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "hair_length") // value to grab for event listener
    .classed("active", true)
    .text("Hair Metal Ban Hair Length (inches)");

  let albumsLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "num_albums") // value to grab for event listener
    .classed("inactive", true)
    .text("# of Albums Released");

  let yLabelsGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)")

  let oneYLabel = yLabelsGroup.append("text")
    .attr("y", -margin.left)
    .attr("dy", "1em")
    .attr("x", -height / 2)
    .classed("axis-text", true)
    // .attr("value", "hair_length") // value to grab for event listener
    .classed("axis-text", true)
    .classed("active", true)
    .text("Number of Billboard 500 Hits");

  let anotherYLabel = yLabelsGroup.append("text")
    .attr("y", -margin.left / 2)
    .attr("dy", "1em")
    .attr("x", -height / 2)
    .classed("axis-text", true)
    // .attr("value", "hair_length") // value to grab for event listener
    .classed("axis-text", true)
    .classed("inactive", true)
    .text("Number of Billboard 500 Hits");

  // Plotting data  =================

  let circlesGroup = chartGroup.selectAll("circle")
    .data(hairData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 20)
    .attr("fill", "pink")
    .attr("opacity", ".5");

  circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

  xLabelsGroup.selectAll("text")
    .on("click", () => {
      let value = d3.select(d3.event.target).attr("value");
      if (value !== chosenXAxis) {
        // replaces chosenXAxis with value
        chosenXAxis = value;
        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(hairData, chosenXAxis);
        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);
        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
        // changes classes to change bold text
        if (chosenXAxis === "num_albums") {
          albumsLabel
            .classed("active", true)
            .classed("inactive", false);
          hairLengthLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          albumsLabel
            .classed("active", false)
            .classed("inactive", true);
          hairLengthLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
}).catch(error => {
  console.log(error);
});