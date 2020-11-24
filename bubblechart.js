var svg = d3.select("svg");

var svgWidth = +svg.attr("width");
var svgHeight = +svg.attr("height");
var polyline;

var padding = { t: 60, r: 40, b: 30, l: 120 };

var chartWidth = svgWidth - padding.l - padding.r;
var chartHeight = svgHeight - padding.t - padding.b;

polylinePoints = [
  [37.56024333, -77.46600667],
  [37.56022833, -77.46598167],
  [37.56021, -77.46595667],
  [37.55812167, -77.46252333],
  [37.55736667, -77.46175833],
  [37.55678833, -77.460815],
];

var xscale = d3.scaleLinear().range([padding.l, chartWidth]);
var yscale = d3.scaleLinear().range([chartHeight, chartHeight / 2 + padding.t]);
var yscale2 = d3.scaleLinear().range([chartHeight / 2, padding.t]);
var rscale = d3.scaleSqrt().range([0, 5]);
var colorScale = d3.scaleQuantize().range(["#d64d3f", "#96ac3d"]);

var map2 = L.map("routemap").setView([37.56032167, -77.46614], 13);
mapLink2 = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; " + mapLink2 + " Contributors",
  maxZoom: 18,
}).addTo(map2);

var toolTip = d3
  .tip()
  .attr("class", "d3-tip")
  .offset([-12, 0])
  .html(function (d) {
    return "<h5>" + d.routeId + "</h5>";
  });

svg.call(toolTip);
Promise.all([
  d3.csv("route_reports.csv", function (row) {
    if (+row["Duration (min)"] < 12000) {
      var routes = {
        routeId: row["Route ID"],
        cost: +row["Cost"],
        distance: +row["Distance"],
        type: row["Type"],
        duration: +row["Duration (min)"],
      };
      return routes;
    }
  }),
  d3.json("route_id_locations.json"),
]).then(function (data) {
  var route_info = data[0];
  var GPS_routes = data[1];
  //draw;
  drawChart(route_info, GPS_routes);
});

function scaleBikeDuration(duration) {
  return yscale(duration);
}

function scalePedelecDuration(duration) {
  return yscale2(duration);
}

function scaleDistance(distance) {
  return xscale(distance);
}

function drawChart(route_info, GPS_routes) {
  // Adding x-axis
  distanceExtent = d3.extent(route_info, function (d) {
    return +d.distance;
  });
  xscale.domain(distanceExtent);
  d3.select("svg")
    .append("g")
    .attr("transform", "translate(0,550)")
    .call(d3.axisBottom(xscale).ticks(15));

  //Adding Y-axis
  //var durationMax = d3.max(route_info, function (d) {
  //  return +d.duration;
  //});

  DurationExtent = d3.extent(route_info, function (d) {
    return +d.duration;
  });
  yscale.domain(DurationExtent);

  d3.select("svg")
    .append("g")
    .attr("transform", "translate(80,0)")
    .call(d3.axisLeft(yscale).ticks(6));

  //Adding y-axis 2
  yscale2.domain(DurationExtent);
  d3.select("svg")
    .append("g")
    .attr("transform", "translate(80,0)")
    .call(d3.axisLeft(yscale2).ticks(6));

  //Adding size for cost
  CostExtent = d3.extent(route_info, function (d) {
    return +d.cost;
  });
  rscale.domain(CostExtent);

  //color Scale
  colorScale.domain;

  routeG = svg.selectAll(".route").data(route_info);

  var routeEnter = routeG
    .enter()
    .append("g")
    .attr("transform", function (route) {
      if (route.type === "Bike") {
        return (
          "translate(" +
          scaleDistance(route.distance) +
          "," +
          scaleBikeDuration(route.duration) +
          ")"
        );
      } else {
        return (
          "translate(" +
          scaleDistance(route.distance) +
          "," +
          scalePedelecDuration(route.duration) +
          ")"
        );
      }
    });

  var circleEnter = routeEnter
    .append("circle")
    .attr("r", function (d) {
      return rscale(+d.cost);
    })
    .style("fill", function (d) {
      if (d.type === "Bike") return "#d64d3f";
      else return "#96ac3d";
    });

  circleEnter
    .on("mouseover", function (d) {
      polyline = L.polyline(GPS_routes[d.routeId], { weight: 10 }).addTo(map2);
      return toolTip.show;
    })
    .on("mouseout", function (d) {
      map2.removeLayer(polyline);
      return toolTip.hide;
    });
}