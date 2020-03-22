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
            //use index to place circles horizontally
            return 90 + (i*180);
        })
        .attr("cy", function(d) {
            //subtract value from 450 to "grow" circles up from bottom instead of down from top of svg
            return 450 - (d.population*0.0005);
        })
};
