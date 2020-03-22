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
};
