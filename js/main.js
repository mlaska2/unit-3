// Script by Matthew Laska; Unit 3 - D3 Lab; G575 Spring 2020

//execute script when window is loaded
window.onload = function() {

    //SVG dimension variables
    var w = 900, h = 500;

    //no semicolon after d3.select because will be chaining methods to it
    var container = d3.select("body") // get the <body> element from the DOM in index.html and return it to variable container
        .append("svg") //put a new <svg> in the body //svg is the data-driven operand receiving the d3 operators which manipulate the element
        .attr("width", w) //assign the width
        .attr("height", h) //assign the height
        .attr("class", "container") //always a class (as the block name) for styling and future selection
        .style("background-color", "rgba(0,0,0,.2)"); //assign a color to the background of the svg // only put a ; at the end of the block!

    //innerRect block
    var innerRect = container.append("rect") //add a new rectangle in the svg // rect is the operand
        .datum(400) // bind a datum to the innerRect selection; a single value is a datum; makes 400 available as the parameter of any anonymous function used by an operator in the block
        .attr("width", function(d) { //rectangle width
            return d * 2; // 400*2=800
        })
        .attr("height", function(d) { //rectangle height
            return d; // d=400
        })
        .attr("class", "innerRect") //class name to match the block name
        .attr("x", 50) //position from the left on the x axis
        .attr("y", 50) //position from the top on the y axis (because top left is origin)
        .style("fill", "#FFFFFF"); //fill color = white

    // //create data array
    // //var dataArray = [10,20,30,40,50];
    //
    // //block to create multiple, different circles at once using 3 methods supporting a join d3.selectAll, .data(), and .enter()
    // //need to use d3.selectAll instead of d3.select bc that only makes use of a single datum
    // var circles = container.selectAll(".circles") //selectAll selects all matching elements in the DOM - feeding parameter that doesnt return anything creates an empty selection
    //     .data(dataArray) // feed in a data array to the data() method
    //     .enter() // one of the great mysteries of the universe...?
    //     //now functions like a loop through the data array - each operator applied once for each value in data array
    //     .append("circle") //add a circle for each datum in dataArray
    //     .attr("class", "circles") //apply class name to all circles
    //     .attr("r", function(d, i) { //can make use of datum and index in array with 2 parameters in anonymous funciton
    //         console.log("d:", d, "i:", i) //looking at d and i
    //         return d;
    //     })
    //     .attr("cx", function(d, i) {
    //         return 70 + (i*180);
    //     })
    //     .attr("cy", function(d, i) {
    //         return 450 - (d*5);
    //     });

    //create data array of cities
    var cityPop = [
        {
            city: 'Madison',
            population: 233209
        },
        {
            city: 'Milwaukee',
            population: 594833
        },
        {
            city: 'Green Bay',
            population: 104057
        },
        {
            city: 'Superior',
            population: 27244
        }
    ];

    //create linear scale for circle x position - operand of this is a generator (custom fucntion)
    var x = d3.scaleLinear()
        .range([90,750]) //output min and max
        .domain([0,3]); //input min and max

    //find minimum value of cityPop array
    var minPop = d3.min(cityPop, function(d) {
        return d.population;
    });
    //find maximum value of cityPop array
    var maxPop = d3.max(cityPop, function(d) {
        return d.population;
    });
    //create linear scale for circles center y coordinate
    var y = d3.scaleLinear()
        .range([450,50])
        .domain([0, 700000]);
    //color scale generator
    var color = d3.scaleLinear()
        .range(["#FDBE85", "#D94701"])
        .domain([minPop, maxPop]);


    //block to create multiple, different circles at once using 3 methods supporting a join d3.selectAll, .data(), and .enter()
    var circles = container.selectAll(".circles") //create an empty selection
        .data(cityPop) //feed in the array of data
        .enter() //mystery
        //loop starts here doing though each operator once for each value in dataArray
        .append("circle") //expect HTML --WOW! some circles there
        .attr("class", "circles") //apply class name to circles
        .attr("id", function(d) { //d still holds each array value, but that value is an object w/ 2 properties (city and population)
            return d.city;
        })
        .attr("r", function(d) {
            //calculate the radius based on pop value as circle area
            var area = d.population * .01;
            return Math.sqrt(area/Math.PI);
        })
        .attr("cx", function(d, i) {
            //use the scale generator with the index to place each circle horizontally
            return x(i);
        })
        .attr("cy", function(d) {
            //subtract value from 450 to "grow" circles up from bottom instead of down from top of svg
            return y(d.population);
        })
        .style("fill", function(d,i) { //add fill color based on the color scale generator
            return color(d.population);
        })
        .style("stroke", "#000"); //black circle stroke

    //create y axis generator
    var yAxis = d3.axisLeft(y);

    //create axis g (group) element and add axis - creating new svg element to hold axis and append it to the container
    var axis = container.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(50,0)")
        .call(yAxis);

    //create text element and add the title
    var title = container.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("x", 450)
        .attr("y", 30)
        .text("City Populations");

    //create circle labels
    var labels = container.selectAll(".labels")
        .data(cityPop)
        .enter()
        .append("text")
        .attr("class", "labels")
        .attr("text-anchor", "left")
        .attr("y", function(d) {
            //vertical position centered on each circle
            return y(d.population);
        });

    //create first line of labels
    var nameLine = labels.append("tspan")
        .attr("class", "nameLine")
        .attr("x", function(d, i) {
            //horizontal position to the right of each circle
            return x(i) + Math.sqrt(d.population*0.01 / Math.PI) + 5;
        })
        .text(function(d) {
            return d.city;
        });

    //create format generator
    var format = d3.format(",");

    //create second line of label
    var popLine = labels.append("tspan")
        .attr("class", "popLine")
        .attr("x", function(d, i) {
            //horizontal position to the right of each circle
            return x(i) + Math.sqrt(d.population*0.01 / Math.PI) + 5;
        })
        .attr("dy", "15") //vertical offset of second line
        .text(function(d) {
            return "Pop. " + format(d.population); //use format generator to format numbers
        });
};
