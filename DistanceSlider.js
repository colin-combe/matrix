function DistanceSlider (targetDiv, distanceMatrix){
	//to contain registered callback functions
	this.highlightChangedCallbacks = [];
	// targetDiv could be div itself or id of div - lets deal with that
	if (typeof targetDiv === "string"){
		targetDiv = document.getElementById(targetDiv);
	}
	//avoids prob with 'save - web page complete'
	d3.select(targetDiv).selectAll("*").remove();
	this.targetDiv = targetDiv;
	this.distanceMatrix = distanceMatrix;
	this.cx = this.targetDiv.clientWidth;
	this.cy = this.targetDiv.clientHeight;

	var margin = {top: 50, right: 50, bottom: 50, left: 50},//{top: 194, right: 50, bottom: 214, left: 50},
		width = 140 - margin.left - margin.right,
		height = this.cy - margin.top - margin.bottom;
	
	
	var x = d3.scale.linear()
		.domain([35, 0])
		.range([0, height]);

	//~ var y = d3.random.normal(height / 2, height / 8);

	this.brush = d3.svg.brush()
		.y(x)
		.extent([25, 35])
		.on("brushstart", brushstart)
		.on("brush", brushmove)
		.on("brushend", brushend);

	//~ var arc = d3.svg.arc()
		//~ .outerRadius(height / 2)
		//~ .startAngle(0)
		//~ .endAngle(function(d, i) { return i ? -Math.PI : Math.PI; });

	var svg = d3.select(targetDiv).append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	  .append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	svg.append("g")
		.attr("class", "x axis")
		//.attr("transform", "translate(0," + height + ")")
		.call(d3.svg.axis().scale(x).orient("left"));

	//~ var circle = svg.append("g").selectAll("circle")
		//~ .data(data)
	  //~ .enter().append("circle")
		//~ .attr("transform", function(d) { return "translate(" + x(d) + "," + y() + ")"; })
		//~ .attr("r", 3.5);

	var brushg = svg.append("g")
		.attr("class", "brush")
		.call(this.brush);

	brushg.selectAll(".resize").append("path")
		.attr("transform", "translate(50,0)")
		//~ .attr("r", "20");
		.attr("d", "M0 0 L20 20 L20 -20 z")

	brushg.selectAll("rect")
		.attr("width", 50);
	
	var self = this;
	
	brushstart();
	//brushmove();

	function brushstart() {
	  svg.classed("selecting", true);
	}

	function brushmove() {
	  var s = self.brush.extent();
	  //~ circle.classed("selected", function(d) { return (s[0] <= d && d <= s[1]); });
	  self.distanceMatrix.redraw()();
	}

	function brushend() {
	  svg.classed("selecting", !d3.event.target.empty());
	}
}
