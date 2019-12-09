let svgWidth = 960;
let svgHeight = 500;
let margin = { top: 20, right: 40, bottom: 80, left: 100 };
let width = svgWidth - margin.left - margin.right;
let height = svgHeight - margin.top - margin.bottom;

let svg = d3.select("#scatter").append("svg").attr("width", svgWidth).attr("height", svgHeight);
let chartGroup = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

// Default selection

let chosenXAxis = "poverty";
let chosenYAxis = "obesity";

// Functions

let getLinearScale = (data, chosenAxis) => {
  let rangearr = [0, width];
  if (chosenAxis == chosenYAxis) rangearr = [height, 0];

  let linearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenAxis]) * 0.8, d3.max(data, d => d[chosenAxis]) * 1.2])
    .range(rangearr);

  return linearScale;
}

let renderAxes = (newScale, newAxis, isY) => {
  let axis = d3.axisBottom(newScale);
  if (isY) axis = d3.axisLeft(newScale);

  newAxis.transition()
    .duration(1000)
    .call(axis);
  return newAxis;
}

let renderCircles = (circlesGroup, newScale, chosenAxis) => {
  let attstr = "cx";
  if (chosenAxis == chosenYAxis) attstr = "cy";

  circlesGroup.transition()
    .duration(1000)
    .attr(attstr, d => newScale(d[chosenAxis]));
  return circlesGroup;
}

// dkwon

let updateToolTip = (chosenXAxis, circlesGroup) => {
  let label = "";
  if (chosenXAxis === "poverty") {
    label = "Poverty:";
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

// dkwon


d3.csv("assets/data/data.csv").then((hairData, err) => {
  if (err) throw err;

  // Data =========================
  hairData.forEach(data => {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income
    data.obesity = +data.obesity
    data.smokes = +data.smokes;
    data.healthcareLow = +data.healthcareLow
  });

  // X and Y axis =================

  let xLinearScale = getLinearScale(hairData, chosenXAxis);
  let yLinearScale = getLinearScale(hairData, chosenYAxis);

  let xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xLinearScale));

  let yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(d3.axisLeft(yLinearScale));

  // Labels for X and Y axis  =================

  let xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  let hairLengthLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("Hair Metal Ban Hair Length (inches)");

  let albumsLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
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
        chosenXAxis = value;
        xLinearScale = getLinearScale(hairData, chosenXAxis);
        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis,false);
        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
        // changes classes to change bold text
        if (chosenXAxis === "age") {
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