let svgWidth = 960;
let svgHeight = 500;
let margin = { top: 20, right: 40, bottom: 80, left: 100 };
let width = svgWidth - margin.left - margin.right;
let height = svgHeight - margin.top - margin.bottom;

let svg = d3.select("#scatter").append("svg").attr("width", svgWidth).attr("height", svgHeight);
let chartGroup = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

let xvalues = ['poverty', 'age', 'income'];
let yvalues = ['obesity', 'smokes', 'healthcare'];

let chosenXAxis = xvalues[0];
let chosenYAxis = yvalues[0];

let xylabels = {
  x: [
    {
      'x': 0,
      'y': 20,
      'value': xvalues[0],
      'active': true,
      'inactive': false,
      'text': "In Poverty (%)"
    },
    {
      'x': 0,
      'y': 40,
      'value': xvalues[1],
      'active': false,
      'inactive': true,
      'text': "Age (Median)"
    },
    {
      'x': 0,
      'y': 60,
      'value': xvalues[2],
      'active': false,
      'inactive': true,
      'text': "Household Income (Median)"
    }
  ],
  y: [
    {
      'y': -margin.left * 4 / 5, // horizontal position
      'x': -height / 2,          // vertical position
      'value': yvalues[0],
      'active': true,
      'inactive': false,
      'text': "Obese (%)"
    },
    {
      'y': -margin.left * 3 / 5,
      'x': -height / 2,
      'value': yvalues[1],
      'active': false,
      'inactive': true,
      'text': "Smokes (%)"
    },
    {
      'y': -margin.left * 2 / 5,
      'x': -height / 2,
      'value': yvalues[2],
      'active': false,
      'inactive': true,
      'text': "Lacks Healthcare (%)"
    }
  ]
}

// Functions

let getLinearScale = (data, chosenAxis) => {
  let rangearr = [0, width];
  if (chosenAxis == chosenYAxis) rangearr = [height, 0];

  let min = d3.min(data, d => d[chosenAxis]);
  let max = d3.max(data, d => d[chosenAxis]);
  let padd = (max - min) * 0.1;

  let linearScale = d3.scaleLinear()
    .domain([min - padd, max + padd])
    .range(rangearr);

  return linearScale;
}

let renderAxes = (newScale, newAxis, XorY) => {
  let axis = d3.axisBottom(newScale);
  if ((XorY == 'y') || (XorY == 'Y')) axis = d3.axisLeft(newScale);

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

let updateToolTip = circlesGroup => {

  let percentstr = "";
  if (chosenXAxis == "poverty") percentstr = "%";

  let toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([60, -50])
    .html(d => `${d.state}<br>${chosenXAxis}: ${d[chosenXAxis] + percentstr}<br>${chosenYAxis}: ${d[chosenYAxis]}%`);

  circlesGroup.call(toolTip);

  circlesGroup
    .on("mouseover", data => toolTip.show(data))
    .on("mouseout", data => toolTip.hide(data));

  return circlesGroup;
}

let renderAbbr = (abbrGroup, newScale, chosenAxis) => {
  let axis = 'x';
  if (chosenAxis == chosenYAxis) axis = 'y';

  abbrGroup.transition()
    .duration(1000)
    .attr(axis, d => newScale(d[chosenAxis]));
  return abbrGroup;
}

let onClickLabel = (data, XorY, chosenAxis, labels, axis, circlesGroup, abbrGroup) => {
  let values;
  let previous;

  if (XorY == 'x') {
    values = xvalues;
    previous = chosenXAxis;
  }
  else {
    values = yvalues;
    previous = chosenYAxis;
  }

  try {
    let i = values.indexOf(previous);
    labels[i]
      .classed("active", false)
      .classed("inactive", true);

    if (XorY == 'x') {
      chosenXAxis = chosenAxis;
    }
    else {
      chosenYAxis = chosenAxis;
    }
  }
  catch (error) {
    return;
  }

  linearScale = getLinearScale(data, chosenAxis);
  axis = renderAxes(linearScale, axis, XorY);
  circlesGroup = renderCircles(circlesGroup, linearScale, chosenAxis);
  circlesGroup = updateToolTip(circlesGroup);
  abbrGroup = renderAbbr(abbrGroup, linearScale, chosenAxis);

  i = values.indexOf(chosenAxis);
  labels[i]
    .classed("active", true)
    .classed("inactive", false);
}

d3.csv("assets/data/data.csv").then((data, err) => {
  if (err) throw err;

  // Data =========================
  data.forEach(d => {
    // X-axis
    d.poverty = +d.poverty;
    d.age = +d.age;
    d.income = +d.income
    // Y-axis
    d.obesity = +d.obesity
    d.smokes = +d.smokes;
    d.healthcare = +d.healthcare
  });

  // X and Y axis =================

  let xLinearScale = getLinearScale(data, chosenXAxis);
  let yLinearScale = getLinearScale(data, chosenYAxis);

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
  let yLabelsGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)")

  let xlabels = [];
  let ylabels = [];

  xylabels.x.forEach(d => {
    let onelabel = xLabelsGroup.append("text")
      .attr("x", d.x)
      .attr("y", d.y)
      .attr("value", d.value)
      .classed("active", d.active)
      .classed("inactive", d.inactive)
      .text(d.text);
    xlabels.push(onelabel);
  });

  xylabels.y.forEach(d => {
    let onelabel = yLabelsGroup.append("text")
      .attr("y", d.y)
      .attr("x", d.x)
      .attr("value", d.value)
      .classed("active", d.active)
      .classed("inactive", d.inactive)
      .text(d.text);
    ylabels.push(onelabel);
  });

  // Plotting data  =================

  let circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 16)
    .attr("fill", "rgba(41,177,177,.6)")
    .attr("opacity", "1.0");

  circlesGroup = updateToolTip(circlesGroup);

  let abbrGroup = chartGroup.selectAll("text.stateText")
    .data(data)
    .enter()
    .append("text")
    .classed("stateText", true)
    .text(d => d.abbr)
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .attr("dy", 5);

  xLabelsGroup.selectAll("text")
    .on("click", () => {
      let value = d3.select(d3.event.target).attr("value");
      if (value !== chosenXAxis) {
        onClickLabel(data,'x', value, xlabels, xAxis, circlesGroup, abbrGroup);
      }
    });

  yLabelsGroup.selectAll("text")
    .on("click", () => {
      let value = d3.select(d3.event.target).attr("value");
      if (value !== chosenYAxis) {
        onClickLabel(data,'y', value, ylabels, yAxis, circlesGroup, abbrGroup);
      }
    });
}).catch(error => {
  console.log(error);
});
