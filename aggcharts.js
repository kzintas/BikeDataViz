var aggchartData;
var linechartData;
var prev_month="April";
var new_month="April";

var margin = {top: 20, right: 20, bottom: 30, left: 40},
width = 800 - margin.left - margin.right,
height = 400 - margin.top - margin.bottom;

var x,y, xAxis, yAxis, color;
var svg;

Promise.all([d3.json("aggchartdata.json")]).then(function (data) {
    aggchartData = data[0];
    console.log("Hello!");
    console.log(aggchartData['4']);
    


    var x0  = d3.scaleBand().rangeRound([0, width], .5);
    var x1  = d3.scaleBand()
                .padding(0.25);
    var y   = d3.scaleLinear().rangeRound([height, 0]);

    var xAxis;

    var yAxis = d3.axisLeft().scale(y);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    var svg = d3.select('#svg1')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var monthnames;
    var typenames;



    svg.select('.y').transition().duration(500).delay(1300).style('opacity','1');

    xAxis = d3.axisBottom().scale(x0)
                            //.tickFormat(d3.timeFormat("Month %V"))
                            .tickValues(aggchartData.map(d=>d.month));
    monthnames = aggchartData.map(function(d) { return d.month; });
    typenames  = aggchartData[0].values.map(function(d) { return d.Type; });
    console.log(monthnames);
    x0.domain(monthnames);
    x1.domain(typenames).rangeRound([0, x0.bandwidth()]);
    y.domain([0, d3.max(aggchartData, function(key) { return d3.max(key.values, function(d) { return d.count; }); })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);


    svg.append("g")
        .attr("class", "y axis")
        .style('opacity','1')
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .style('font-weight','bold')
        .text("Value");


    var slice = svg.selectAll(".slice")
        .data(aggchartData)
        .enter().append("g")
        .attr("class", "g")
        .attr("transform",function(d) { return "translate(" + x0(d.month) + ",0)"; })
        .on("mouseover", function(d) {

            //new_month =d3.select(this).datum().month;
            //console.log(new_month)
            //drawlinechart(new_month);
            
        });
    
    slice.selectAll("rect")
        .data(function(d) { return d.values; })
        .enter().append("rect")
            .attr("width", x1.bandwidth())
            .attr("x", function(d) { return x1(d.Type); })
                .style("fill", function(d) { return color(d.Type) })
                .attr("y", function(d) { return y(0); })
                .attr("height", function(d) { return height - y(0); })
            .on("mouseover", function(d) {

                new_month =d3.select(this.parentNode).datum().month;
                console.log(new_month)
                if(new_month!= prev_month){
                    drawlinechart(new_month);
                    prev_month=new_month;
                }
                d3.select(this).style("fill", d3.rgb(color(d.Type)).darker(2));
                
            })
            .on("mouseout", function(d) {
                d3.select(this).style("fill", color(d.Type));
            });
    
    
        slice.selectAll("rect")
        .transition()
        .delay(function (d) {return Math.random()*1000;})
        .duration(1000)
        .attr("y", function(d) { return y(d.count); })
        .attr("height", function(d) { return height - y(d.count); });
    
        //Legend
        var legend = svg.selectAll(".legend")
            .data(aggchartData[0].values.map(function(d) { return d.Type; }).reverse())
        .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d,i) { return "translate(0," + i * 20 + ")"; })
            .style("opacity","0");
        
        legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", function(d) { return color(d); });
        
        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) {return d; });
        
        legend.transition().duration(500).delay(function(d,i){ return 1300 + 100 * i; }).style("opacity","1");
        


});
  
Promise.all([d3.json("barchartdata.json")]).then(function (data) {
    linechartData = data[0];
    console.log("Hello!");
    
    
    x  = d3.scaleBand().rangeRound([0, width], .5);//().range([0,width]);

    y   = d3.scaleLinear().rangeRound([height, 0]);

    
    
    color = d3.scaleOrdinal(d3.schemeCategory10);

    svg = d3.select('#svg2')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    var hournames=linechartData[0].values[0].values.map(function(d) { return d.hour; });
    x.domain(hournames);
    xAxis = d3.axisBottom().scale(x)
                            //.tickFormat(d3.timeFormat("Month %V"))
                            .tickValues(hournames);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
    
    svg.append("g")
        .attr("class", "yaxis")

    drawlinechart(new_month);

  
});

function drawlinechart(month){
    
    
    months=linechartData.map(function(d) { return d.month; });
    function month_id(d,i){return +i;}
    //console.log(months.indexOf("April"))
    selected_month=linechartData[months.indexOf(month)]
    
    //console.log(selected_month.values);
    //console.log(selected_month.values[0].values);
    //console.log(d3.keys(linechartData[0].values[0])[0]);
    
    //console.log(d3.keys(d3.keys(linechartData[0].values[0])[0]))
    //console.log(hournames);
    //console.log(selected_month.values[0].values[0].count);
    
    var typenames=selected_month.values.map(function(d) { return d.type; });
    //console.log(typenames);


    //svg.select('.y').transition().duration(500).delay(1300).style('opacity','1');


    
    //console.log(linechartData[0])
    
    
    //function max_count(d) { return +d.count; }
    y.domain([0, d3.max(selected_month.values, d=>  d3.max(d.values, key=>key.count))]);
    //console.log(typeof linechartData[0].values[0].values);
    //console.log(linechartData[0].values[0].values);
    //console.log(d3.max(linechartData[0].values[0].values, function(d) {return max_count(d)}));
    //console.log(d3.max(linechartData[0].values, d=>  d3.max(d.values, key=>key.count)));
    //console.log(d3.max(linechartData[0].values, function(d){d3.max(d.values, max_count(d))}));
    //console.log(d3.max(linechartData[0], function(d){return d3.max(d.values, d=>d.values)})) ;
    
    //console.log(d3.max(hournames, function(d){return max_count(linechartData[0].values[0].Bike[d])})) ;
    
    //console.log(d3.max(hournames, function(d){return d3.max(linechartData[0].values[0].Bike[d], function(key) { return +key.count; })})) ;
    
    
    
    /*
    svg.append("g")
        .attr("class", "yaxis")
        .style('opacity','1')
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .style('font-weight','bold')
        .text("Value");
    */

   yAxis = d3.axisLeft().scale(y);

   svg.selectAll(".yaxis")
   .style('opacity','1')
    .transition()
    .duration(2000)
    .call(yAxis);
    

    var groups = svg.selectAll("foo")
        .data(selected_month.values)
    //    .enter()
    //    .append("g");
    
    //console.log(linechartData[0].values[0][0]);
    var line = d3.line()
        .x(function(d) { return x(d.hour); })
        .y(function(d) { return y(d.count); });
    //console.log(line);
    /*var lines = groups.append("path")
        .attr("d", d => line(d.values))
        .attr("fill", "none")
        .attr("stroke", (d, i) => color(i));
    */
   this.svg.selectAll('path')
    
    .transition()
    .duration(700)
    .attr("stroke-width", 0)        
    .remove();
   var lines = groups
    .enter()
    .append("path")
    .attr("class","foo")
    .merge(groups)
    .transition()
    .duration(2000)
    .attr("d", d => line(d.values))
    .attr("fill", "none")
    .attr("stroke", (d, i) => color(i))
    .attr("stroke-width", 2.5)
    
}