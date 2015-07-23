//		a matrix viewer
//		
//		Colin Combe, Rappsilber Laboratory, 2015
//
//		graph/Matrix.js

Graph = function(targetDiv, options) {
	//to contain registered callback functions
	this.highlightChangedCallbacks = [];
	// targetDiv could be div itself or id of div - lets deal with that
	if (typeof targetDiv === "string"){
		targetDiv = document.getElementById(targetDiv);
	}
	//avoids prob with 'save - web page complete'
	d3.select(targetDiv).selectAll("*").remove();

	this.chart = targetDiv;
	this.options = options || {};

  
	this.padding = {
		 "top":    this.options.title  ? 30 : 0,
		 "right":  0,
		 "bottom": this.options.xlabel ? 60 : 0,
		 "left":   this.options.ylabel ? 90 : 0
	};
};


Graph.prototype.setData = function(xwalk_out, xlv){
	
	this.scale = d3.scale.quantile()
		.domain([-1, 25, 35, 1000])
		.range(['#a6dba0','#eeeeee','#c2a5cf']);
  	
  	this.cx = this.chart.clientWidth;
	this.cy = this.chart.clientHeight;
	
	this.canvas = d3.select(this.chart).append("canvas")
		.attr("width",  this.cx)
		.attr("height", this.cy);
	
	this.xwalkOut = xwalk_out;
	this.xinet = xlv;
	this.redraw()();
}
  
//
// Graph methods
//

Graph.prototype.redraw = function() {
	var self = this;

	this.size = {
		"width":  this.cx - this.padding.left - this.padding.right,
		"height": this.cy - this.padding.top  - this.padding.bottom
	};
        	
	this.size.width = this.size.height;	
		 
	return function() { 
		var seqLength = self.xwalkOut.length - 1;
		
		var xStep = self.size.width / seqLength;
		var yStep = self.size.height / seqLength;
		var ctx = self.canvas[0][0].getContext("2d");
						
		for (var i = 1; i < seqLength + 1; i++){
			var row = self.xwalkOut[i];
			if (row){
				for (var j = 1; j < seqLength; j++){
					var xwalk = row[j];
					if (xwalk) {
						//~ var cell = self.peaks.append('rect');
						//~ cell.attr("fill", self.scale(xwalk));
						//~ cell.attr("x", self.x(i));
						//~ cell.attr("y", self.y(j));
						//~ cell.attr("width", 2);//self.x(1));
						//~ cell.attr("height", 2);//self.y(1));
						ctx.fillStyle = self.scale(xwalk);
						//~ ctx.fillRect(self.x(i),self.y(j),2,2);
						ctx.fillRect((i - 1) * xStep, (j - 1) * yStep , xStep, yStep);
					}				
				}
			}
		}
		
		var residueLinks = self.xinet.proteinLinks.values()[0].residueLinks.values();
		var rlCount = residueLinks.length;
		var sasIn = 0, sasMid = 0, sasOut = 0, eucIn = 0, eucMid = 0, eucOut = 0; 
		for (var rl = 0; rl < rlCount; rl++) {
			var crossLink = residueLinks[rl];
						if (self.xwalkOut[crossLink.fromResidue]
							&& self.xwalkOut[crossLink.fromResidue][crossLink.toResidue]
							&& self.xwalkOut[crossLink.fromResidue][crossLink.toResidue] < 25){
							ctx.fillStyle = "fill", "black";
							sasIn++;
						}
						else if (self.xwalkOut[crossLink.fromResidue]
							&& self.xwalkOut[crossLink.fromResidue][crossLink.toResidue]
							&& self.xwalkOut[crossLink.fromResidue][crossLink.toResidue] < 35){
							ctx.fillStyle =  "#d95f02";
							sasMid++;
						}
						else {
							ctx.fillStyle =  "#7570b3";
							sasOut++;
						}
						ctx.fillRect((crossLink.fromResidue - 1) * xStep, (crossLink.toResidue - 1) * yStep , xStep, yStep);
					
						if (self.xwalkOut[crossLink.toResidue]
							&& self.xwalkOut[crossLink.toResidue][crossLink.fromResidue]
							&& self.xwalkOut[crossLink.toResidue][crossLink.fromResidue] < 25){
							ctx.fillStyle = "black";
							eucIn++;
						}
						else if (self.xwalkOut[crossLink.toResidue]
							&& self.xwalkOut[crossLink.toResidue][crossLink.fromResidue]
							&& self.xwalkOut[crossLink.toResidue][crossLink.fromResidue] < 35){
							ctx.fillStyle = "#d95f02";
							eucMid++;
						}
						else {
							ctx.fillStyle = "#7570b3";
							eucOut++;
						}
						ctx.fillRect((crossLink.toResidue - 1) * xStep, (crossLink.fromResidue - 1) * yStep , xStep, yStep);		
		}
		console.log(">>"+sasIn + "\t" + sasMid + "\t" + sasOut);
		console.log(">>"+eucIn + "\t" + eucMid + "\t" + eucOut);
	}  
}
