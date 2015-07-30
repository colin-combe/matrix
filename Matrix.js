//		a matrix viewer
//
//		Colin Combe, Rappsilber Laboratory, 2015
//
//		graph/Matrix.js

DistanceMatrix = function(targetDiv, options) {
	//to contain registered callback functions
	this.highlightChangedCallbacks = [];
	// targetDiv could be div itself or id of div - lets deal with that
	if (typeof targetDiv === "string"){
		targetDiv = document.getElementById(targetDiv);
	}
	//avoids prob with 'save - web page complete'
	d3.select(targetDiv).style("position","relative").selectAll("*").remove();
	this.targetDiv = targetDiv;

	this.options = options || {};
	this.margin = {
		 "top":    this.options.title  ? 30 : 20,
		 "right":  50,
		 "bottom": this.options.xlabel ? 60 : 40,
		 "left":   this.options.ylabel ? 90 : 60
	};

	this.canvas = d3.select(this.targetDiv).append("canvas");

	this.canvas.style("position", "absolute").style("z-index", 0);

	this.svg = d3.select(this.targetDiv).append("svg")
		.style("position", "absolute")
		.style("top", "0px")
		.style("left", "0px")
		.style("z-index", "1");
		
	this.vis = this.svg.append("g")
		.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

	this.sliderDiv = d3.select(this.targetDiv).append("div").attr("id","sliderDiv");
	this.slider = new DistanceSlider("sliderDiv", this);
				
	// Add the x-axis label
	if (this.options.xlabel) {
		this.vis.append("text")
			.attr("class", "axis")
			.text(this.options.xlabel)
			.attr("x", this.size.width/2)
			.attr("y", this.size.height)
			.attr("dy","2.4em")
			.style("text-anchor","middle");
	}

	// add y-axis label
	if (this.options.ylabel) {
		this.vis.append("g").append("text")
			.attr("class", "axis")
			.text(this.options.ylabel)
			.style("text-anchor","middle")
			.attr("transform","translate(" + -90 + " " + this.size.height/2+") rotate(-90)");
	}
};


DistanceMatrix.prototype.setData = function(distances, xlv){
	this.scale = d3.scale.quantile()
		.domain([-1, 25, 35, 1000])
		.range(['#a6dba0','#eeeeee','#c2a5cf']);

  	this.xinet = xlv;
	this.distances = distances;
	this.seqLength = this.distances.length - 1;

	this.redraw()();
}

DistanceMatrix.dubiousUnlinked = "#eeeeee";
DistanceMatrix.withinUnlinked = "#a6dba0";
DistanceMatrix.overLinked = "black";
DistanceMatrix.dubiousLinked = "black";
DistanceMatrix.withinLinked = "black";
DistanceMatrix.prototype.redraw = function() {

	var self = this;

	//see https://gist.github.com/mbostock/3019563
	return function() {

		var cx = self.targetDiv.clientWidth - 160;
		var cy = self.targetDiv.clientHeight;
		self.svg.attr("width", cx).attr("height", cy);
		self.vis.attr("width", cx).attr("height", cy).selectAll("*").remove();
		
		var width = self.targetDiv.clientWidth - self.margin.left - self.margin.right;
		var height = self.targetDiv.clientHeight - self.margin.top  - self.margin.bottom;
		//its going to be square and fit in containing div
		var minDim = (width < height)? width : height;
		
		
		var canvasScale = minDim / (self.seqLength * 2);
		self.canvas.attr("width",  minDim / canvasScale)
			.attr("height", minDim / canvasScale)
			.style("-ms-transform","scale("+canvasScale+")")
			.style("-ms-transform-origin", "0 0")
			.style("-moz-transform","scale("+canvasScale+")")
			.style("-moz-transform-origin", "0 0")
			//~ .style("-o-transform","scale("+canvasScale+")")
			//~ .style("-o-transform-origin", "0 0")
			//~ .style("-webkit-transform","scale("+canvasScale+")")
			//~ .style("-webkit-transform-origin", "0 0")
			.style("transform","scale("+canvasScale+")")
			.style("transform-origin", "0 0")
			.style("top", (self.margin.top) + "px")
			.style("left", (self.margin.left) + "px");
		
		var ctx = self.canvas[0][0].getContext("2d");
		ctx.fillStyle = "white";
		ctx.fillRect(0, 0, minDim / canvasScale, minDim / canvasScale);
		
		self.x = d3.scale.linear()
		  .domain([1, self.seqLength])
		  .range([0, minDim]);

		// y-scale (inverted domain)
		self.y = d3.scale.linear()
			.domain([self.seqLength, 1])
			.range([0, minDim])
		
		self.vis.append("g")
			.attr("class", "y axis")
			.call(d3.svg.axis().scale(self.y).orient("left"));

		self.vis.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(d3.svg.axis().scale(self.x).orient("bottom"));

		var xStep = 2;//minDim / self.seqLength;
		var yStep = 2;//minDim / self.seqLength;
		
		var sliderExtent = self.slider.brush.extent();
		
		ctx.fillStyle = DistanceMatrix.withinUnlinked;
		
		for (var i = 1; i < self.seqLength + 1; i++){
			var row = self.distances[i];
			if (row){
				for (var j = 1; j < self.seqLength; j++){
					var distance = row[j];
					if (distance && distance < sliderExtent[0]) {
						// ctx.fillStyle = self.scale(distance);
						ctx.fillRect((i - 1) * xStep, (self.seqLength - j) * yStep , xStep, yStep);
					}
				}
			}
		}




//~ 
		var residueLinks = self.xinet.proteinLinks.values()[0].residueLinks.values();
		var rlCount = residueLinks.length;
		var sasIn = 0, sasMid = 0, sasOut = 0, eucIn = 0, eucMid = 0, eucOut = 0;
		for (var rl = 0; rl < rlCount; rl++) {
			var crossLink = residueLinks[rl];
						if (self.distances[crossLink.fromResidue]
							&& self.distances[crossLink.fromResidue][crossLink.toResidue]
							&& self.distances[crossLink.fromResidue][crossLink.toResidue] < 25){
							ctx.fillStyle = "fill", "black";
							sasIn++;
						}
						else if (self.distances[crossLink.fromResidue]
							&& self.distances[crossLink.fromResidue][crossLink.toResidue]
							&& self.distances[crossLink.fromResidue][crossLink.toResidue] < 35){
							ctx.fillStyle =  "#d95f02";
							sasMid++;
						}
						else {
							ctx.fillStyle =  "#7570b3";
							sasOut++;
						}
						ctx.fillRect((crossLink.fromResidue - 1) * xStep, (self.seqLength - crossLink.toResidue) * yStep , xStep, yStep);
					//~ //~
						if (self.distances[crossLink.toResidue]
							&& self.distances[crossLink.toResidue][crossLink.fromResidue]
							&& self.distances[crossLink.toResidue][crossLink.fromResidue] < 25){
							ctx.fillStyle = "black";
							eucIn++;
						}
						else if (self.distances[crossLink.toResidue]
							&& self.distances[crossLink.toResidue][crossLink.fromResidue]
							&& self.distances[crossLink.toResidue][crossLink.fromResidue] < 35){
							ctx.fillStyle = "#d95f02";
							eucMid++;
						}
						else {
							ctx.fillStyle = "#7570b3";
							eucOut++;
						}
						ctx.fillRect((crossLink.toResidue - 1) * xStep, (self.seqLength - crossLink.fromResidue) * yStep , xStep, yStep);
		}
		console.log(">>"+sasIn + "\t" + sasMid + "\t" + sasOut);
		console.log(">>"+eucIn + "\t" + eucMid + "\t" + eucOut);
	}
}
