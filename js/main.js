// Script by Matthew Laska; Unit 3 - D3 Lab; G575 Spring 2020

//defining self-executing anonymous function to be able to define pseudo-global variables
(function() {

// defining pseudo-global variables to be used in multiple functions
var csvData;
var yAxis;
var axis;
var legendClasses;
//colors for 5 classes in choropleth map
var colorClasses = [
   "#ECF7E1",
   "#BAE4BC",
   "#7BCCC4",
   "#43A2CA",
   "#0868AC"
];

//variables for data join
var attrArray = ["Volume Index of GDP/Capita", "Unemployment Rate (%)", "Life Expectancy (in Years)", "GHG Emissions/Capita (in Tons CO2e)", "National Debt as % of GDP", "Imports of Goods as % of GDP", "Exports of Goods as % of GDP"];
var expressedAttr = attrArray[0]; //initial attribute

//define chart frame dimesions in variables
var chartWidth = window.innerWidth*.425,
    chartHeight = 503, //added 13 for space on top??
    ///for adding in space for axis
    leftPadding = 25,
    rightPadding = 2,
    topBottomPadding = 5,
    chartInnerWidth = chartWidth - leftPadding - rightPadding,
    chartInnerHeight = chartHeight - topBottomPadding*2,
    translate  = "translate(" + leftPadding + "," + topBottomPadding + ")";

//another pseudo-global variable defining creation of chart
var chart = d3.select("body")
    .append("svg")
    .attr("width", chartWidth)
    .attr("height", chartHeight)
    .attr("class", "chart");

//create a scale to size bars proportionally to frame ///
var yScale = d3.scaleLinear()
            .range([493,0])   ///0,chartHeight for numbers and regular, 493,0 for axis??
            .domain([0,280]); //need to change this for the different attributes, but how? - figured out in updateChart

//begin script when window loads
window.onload = setMap();

//set up choropleth map
function setMap() {

    //map frame dimensions in webpage
    var width = window.innerWidth*.5,
        height = 490;

    //create new svg container for the map in the webpage --map block to append svg container that will hold the map
    var laskaMap = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    //create Albers equal area conic - projection function - centered around EU (Gadheim, Germany) [9.9019, 49.8431] lon/lat
    var projection = d3.geoAlbers()
        //put center coordinates of chosen area as .center lat and .rotate lon
        .center([0, 53]) //keep .center lon at 0??
        .rotate([-9.9019,0,0]) //keep .rotate lat at 0?? //possibly -9?
        .parallels([41, 65]) //standard parallels from projection wizard
        .scale(750) //2500 = used in example, change based on your map
        .translate([width/2, height/2]); // keep as half width and height of svg container to keep map centered in container

    //create - path generator - and save as variable path
    var path = d3.geoPath()
        .projection(projection);

    //use Promise.all to parallelize asynchronous data loading
    var promises = [d3.csv("data/d3_labdata.csv"),
                    d3.json("data/worldCountries.topojson"),
                    d3.json("data/euCountries.topojson")
                   ];
    Promise.all(promises).then(callback);

    //callback function
    function callback(data) {
        csvData = data[0];
        world = data[1];
        eUnion = data[2];

        //make sure data are loading correctly
        //console.log(csvData);
        // console.log(world);
        // console.log(eUnion);

        //place graticule on map
        setGraticule(laskaMap, path);

        //translate world and eUnion topoJSON to geoJSON FeatureCollections
        var worldCountries = topojson.feature(world, world.objects.ne_50m_admin_0_countries),
            euCountries = topojson.feature(eUnion, eUnion.objects.euCountries).features; //add on .features because .data needs array as parameter, but topojson.feature turns topojson object to geojson FeatureCollection object. thus, for europeanUnion block to work, need to pull array of features out of FeatureCollection and pass it to .data()

        //examine results
        //console.log(worldCountries);
        //console.log(euCountries)

        //add world countries to map
        var countries = laskaMap.append("path")
            .datum(worldCountries)
            .attr("class", "countries")
            .attr("d", path);

        //join csv data to GeoJSON enumeration units
        euCountries = joinData(euCountries, csvData);

        //create color scale
        var colorScale = makeColorScale(csvData);

        //add enumeration units to the map
        setEnumerationUnits(euCountries, laskaMap, path, colorScale);

        //call function to add coordinated visualization to webpage
        setChart(csvData, colorScale, chart);

        //function to create dropdown menu and add to map
        createDropdown(csvData);

        //function to create choropleth legend
        createLegend(csvData, expressedAttr);
    };
}; //end of setMap function

//function to create graticule and background
function setGraticule(laskaMap, path) {

    //create graticule generator
    var graticule = d3.geoGraticule()
        .step([10, 10]); //place graticule lines every 10 degrees of [lon,lat]

    //create graticule background
    var gratBackground = laskaMap.append("path")
        .datum(graticule.outline()) //bind graticule background
        .attr("class", "gratBackground")
        .attr("d", path); //project graticule background

    //create graticule lines
    var gratLines = laskaMap.selectAll(".gratLines") //select graticule elements that will be created
        .data(graticule.lines()) //bind graticule lines to each element to be created
        .enter() //create an element for each datum
        .append("path") //append each element (grat line) to the svg as a path element
        .attr("class", "gratLines") //assign class for styling
        .attr("d", path); //project graticule lines by putting in path generator
};

//function to join data from .csv to .GeoJSON
function joinData(euCountries, csvData) {

    //loop through csv to assign each set of csv attribute values to geojson region
    for (var i=0; i<csvData.length; i++) {
        var csvCountry = csvData[i]; //index of the current record (country)
        var csvKey = csvCountry.Country; //the csv primary key to be used for join
        //console.log(csvCountry)

        //loop through geojson countries to find correct country
        for (var a=0; a<euCountries.length; a++) {

            var geojsonProperties = euCountries[a].properties; //the current countries geojson properties
            var geojsonKey = geojsonProperties.Country; //the geojson primary key to be used for the join, should be the same as csvKey

            //where primary keys match, transfer csv data to geojson properties object
            if (geojsonKey == csvKey) {
                attrArray.forEach(function(attr){
                    var value = parseFloat(csvCountry[attr]); //get csv attribute value
                    geojsonProperties[attr] = value; //assign attribute and value to geojson properties
                });
            };
        };
    };

    console.log(euCountries);

    return euCountries;

};

//function to create choropleth color scale generator
function makeColorScale(data) {

    var colorClasses = [ //pick own color scheme from colorbrewer - still needs adjusting
       "#ECF7E1",
       "#BAE4BC",
       "#7BCCC4",
       "#43A2CA",
       "#0868AC"
    ];

  //for quantile and equal interval
    //create color scale generator
    // var colorScale = d3.scaleQuantile()
    //     .range(colorClasses);

  //for quantile
    // //build array of all values of the expressed attribute
    // var domainArray=[];
    // for (var i=0;i<data.length;i++) {
    //     var value=parseFloat(data[i][expressedAttr]);
    //     domainArray.push(value);
    // };
    //
    // //assign array of expressed values as scale domain
    // colorScale.domain(domainArray);

  //for equal interval
    // build ttwo value array of minimum and maximum expresed attribute values
    // var minmax = [
    //     d3.min(data, function(d) { return parseFloat(d[expressedAttr]); }),
    //     d3.max(data, function(d) { return parseFloat(d[expressedAttr]); })
    // ];
    //
    // //assign the two-value array as scale domain
    // colorScale.domain(minmax);

  ///for natural breaks
    //create color scale generator
    var colorScale = d3.scaleThreshold()
        .range(colorClasses);

    //build array of all values of the expressed attribute
    var domainArray=[];
    for (var i=0; i<data.length; i++) {
        var value = parseFloat(data[i][expressedAttr]);
        domainArray.push(value);
    };

    //cluster data using ckmeans clustering algorith to create natural breaks
    var clusters = ss.ckmeans(domainArray, 5);
    //reset domain array to cluster minimums
    domainArray = clusters.map(function(d) {
        return d3.min(d);
    });
    //remove first value from domain array to create class breakpoints
    domainArray.shift();

    //create classes to use for legend labels
    legendClasses = clusters.map(function(d) {
        return d3.max(d);
    });

    //assign array of last 4 cluster minimums as domain
    colorScale.domain(domainArray);

  //for all 3, return colorscale to function
     return colorScale;
};

//function to create choropleth enumeration units
function setEnumerationUnits(euCountries, laskaMap, path, colorScale) {

    //add EU Countries to map - create enumeration units for choropleth. use select all,data,enter to draw each feature corresponding to a country separately
    var europeanUnion = laskaMap.selectAll(".europeanUnion")
        .data(euCountries)
        .enter()
        .append("path")
        .attr("class", function(d) {
            return "europeanUnion " + d.properties.Country;
        })
        .attr("d", path)
        .style("fill", function(d) {
            return colorScale(d.properties[expressedAttr]);
        })
        .on("mouseover", function(d) {
            highlight(d.properties); //need the anonymous function to call highlight() sothat the properties object can be passed to it without passing the whole GeoJSON feature
        })
        .on("mouseout", function(d) {
            dehighlight(d.properties);
        })
        .on("mousemove", moveLabel);

    //add style descriptor to each path
    var desc = europeanUnion.append("desc")
        .text('{"stroke": "#555", "stroke-width": "0.75px"}'); //change based on the stroke you have in style.css
};

//function to create coordinated bar chart
function setChart(csvData, colorScale, chart) {

    /// triple '/' indicates steps for if doing axis for numbers
    //create rectangle for chart background
    var chartBackground = chart.append("rect")
        .attr("class", "chartBackground")
        .attr("width", chartInnerWidth)
        .attr("height", chartInnerHeight)
        .attr("transform", translate);

    //set bars for all EU countries
    var bars = chart.selectAll(".bars")
        .data(csvData)
        .enter()
        .append("rect")
        .sort(function(a,b) {
            return b[expressedAttr] - a[expressedAttr]; ///switched b and a for axis steps to have high to low values
        })
        .attr("class", function(d) {
            return "bars " + d.Country;
        })
        .attr("width", chartInnerWidth/csvData.length - 1) ///chartInnerWidth instead of chartWidth
        .on("mouseover", highlight) //don't need to pass entire geojson through; here, using the csvData where the datum is already equivalent to the properties object in the GeoJSON
        .on("mouseout", dehighlight)
        .on("mousemove", moveLabel);
        //add style descriptor to each rect
        var desc = bars.append("desc")
            .text('{"stroke": "#555", "stroke-width": "0.75px"}');

//can get rid of because now in updateChart function which gets called here with updateChart??
    // ///create vertical axis generator
    // var yAxis = d3.axisLeft()
    //     .scale(yScale); ///this had to switch the range in yscale above to create this step here
    //
    // ///place axis
    // var axis = chart.append("g")
    //     .attr("class", "axis")
    //     .attr("transform", translate)
    //     .call(yAxis);

    ///create frame for chart border
    var chartFrame = chart.append("rect")
        .attr("class", "chartFrame")
        .attr("width", chartInnerWidth)
        .attr("height", chartInnerHeight)
        .attr("transform", translate);

    //annotating bars with attribute value text - alot simpler than axis
    // var numbers = chart.selectAll(".numbers")
    //     .data(csvData)
    //     .enter()
    //     .append("text")
    //     .sort(function(a,b) {
    //         return b[expressedAttr] - a[expressedAttr];
    //     })
    //     .attr("class", function(d) {
    //         return "numbers " + d.Country;
    //     })
    //     .attr("text-anchor", "middle")
    //     .attr("x", function(d, i) {
    //         var fraction = chartWidth / csvData.length;
    //         return i*fraction + (fraction-1)/2;
    //     })
    //     .attr("y", function(d) {
    //         return chartHeight - yScale(parseFloat(d[expressedAttr])) + 12;
    //     })
    //     .text(function(d) {
    //         return d[expressedAttr]
    //     });

    //create text element for chart title
    var chartTitle = chart.append("text")
        .attr("x", chartInnerWidth/8)
        .attr("y", 40)
        .attr("class", "chartTitle")
        .text(expressedAttr); //add 2nd line using <tspan> "for each European Union Country"??

    //call updateChart function to postion, size, and color the bars in the chart
    updateChart(bars, csvData.length, colorScale, csvData, chart);
};

//function to create dropdown menu
function createDropdown(csvData) {
    //add select element
    var dropdown = d3.select("body")
        .append("select")
        .attr("class", "dropdown")
        .on("change", function() {
            changeAttribute(this.value, csvData)
        });

    //add initial option
    var titleOption = dropdown.append("option")
        .attr("class", "titleOption")
        .attr("disabled", "true")
        .text("Select Attribute");

    //add attribute name options
    var attrOptions = dropdown.selectAll(".attrOptions")
        .data(attrArray)
        .enter()
        .append("option")
        .attr("value", function(d) { return d })
        .text(function(d) { return d });
};

//dropdown change event listener handler
function changeAttribute(attribute, csvData) {
    //change the expressed attribute
    expressedAttr = attribute;

    //recreate the color scale
    var colorScale = makeColorScale(csvData);

    //recolor enumeration units
    var europeanUnion = d3.selectAll(".europeanUnion")
        //implement transitions
        .transition()
        .duration(1000)
        //recolor the enumeration units
        .style("fill", function(d) {
            var value = d.properties[expressedAttr];
            return colorScale(value);
        });

    //re-sort, resize, and recolor the bar chart bars
    var bars = d3.selectAll(".bars")
        //re-sort the bars
        .sort(function(a, b) {
            return b[expressedAttr] - a[expressedAttr];
        })
        //implement trastions on bars in chart
        .transition()
        .delay(function(d, i) { return i*25 })
        .duration(675)
        .ease(d3.easeExpOut);

    //call updateChart function to postion, size, and color the bars in the chart
    updateChart(bars, csvData.length, colorScale, csvData, chart);

    //added this so that additional container wouldn't be created every time a new attribute was selected
    d3.select("svg.legendContainer").remove();
    //create new legend each time attribute is changed selected
    createLegend(csvData, expressedAttr);

};

//function to re- position, size, and color bars in the chart
function updateChart(bars, n, colorScale, csvData, chart) {

    //Remove old axes ticks
    d3.selectAll("g").remove();

    //define new scaling values for the bars
    yScale
        .range([493,0])
        .domain([0, d3.max(csvData, function(d) {
            return parseFloat(d[expressedAttr]) * 1.1; //so not going all the way to the top of the chart
        })]);

    //create new vertical axis generator
    var yAxis = d3.axisLeft()
        .scale(yScale);

    //place new axis
    var axis = chart.append("g")
        .attr("class", "axis")
        .attr("transform", translate)
        .call(yAxis);

    //position bars
    bars.attr("x", function(d,i) {
            return i* (chartInnerWidth/n) + leftPadding; /// before was chartWidth/csvData.length, but now this for w/ axis
        })
        //size or resize the bars
        .attr("height", function(d,i) {
            return 493 - yScale(parseFloat(d[expressedAttr]));  /// now "503 -" that, was just that
        })
        .attr("y", function(d,i) {
            return yScale(parseFloat(d[expressedAttr])) + topBottomPadding; ///was: chartHeight - yScale(parseFloat(d[expressedAttr]))
        })
        //color or recolor the bars
        .style("fill", function(d) {
            var value = d[expressedAttr];
            return colorScale(value);
    });

    var chartTitle = d3.select(".chartTitle")
        .text(expressedAttr); //add 2nd line using <tspan> "in each European Union Country"??

};

//function to highlight enumeration units and bars
function highlight(props) { //props in the properties object of the selected element from the GeoJSON data / attributes object from the CSV data, depending on if selected element is enumeration unit on the map or bar on the chart //ex. props = d.properties for enum units
    //change stroke of selected feature
    var selected=d3.selectAll("." + props.Country)
        .style("stroke", "yellow")
        .style("stroke-width", "2");

    //create label instantiation
    setLabel(props);
};

//function to reset the element style on mouseout
function dehighlight(props) {
    var selected = d3.selectAll("." + props.Country)
        .style("stroke", function() { //anon function here calls getStyle function below
            return getStyle(this, "stroke"); //could just do stroke here instead of anon function if enum and bar stroke were same
        })                                  //my stroke and stroke-width are the same for enum units and bars, jsut wanted experience coding like this
        .style("stroke-width", function() {
            return getStyle(this, "stroke-width"); //could just do stroke-width here instead of anon function if enum and bar stroke-width were same
        });

    //function to retrieve info stored in <desc> element for that style
    function getStyle(element, styleName) {
        var styleText = d3.select(element)
            .select("desc")
            .text();

        var styleObject = JSON.parse(styleText);

        return styleObject[styleName];
    };

    //remove info label when mouseout
    d3.select(".infoLabel")
        .remove();
};

//function to create dynamic labels
function setLabel(props) {
    //label content
    var labelAttribute = "<b>" + props.Country + ": " + props[expressedAttr] + "</b>";

    //create info label div
    var infoLabel = d3.select("body")
        .append("div")
        .attr("class", "infoLabel")
        .attr("id", props.Country + "_label")
        .html(labelAttribute);

    //add expressed attribute to label
    var indicatorName = infoLabel.append("div")
        .attr("class", "labelname")
        .html(expressedAttr);
};

//function to move info label with mouse movement
function moveLabel() {

    //get width of label
    var labelWidth = d3.select(".infoLabel")
        .node()
        .getBoundingClientRect()
        .width;

    //use coordinates of mousemove event to set label coordinates
    var x1 = d3.event.clientX + 10,
        y1 = d3.event.clientY - 60,
        x2 = d3.event.clientX - labelWidth - 10,
        y2 = d3.event.clientY + 25;

    //horizontal label coordinate, testing for overflow
    var x = d3.event.clientX > window.innerWidth - labelWidth - 20 ? x2 : x1;
    //vertical label coordinate, testing for overflow
    var y = d3.event.clientY < 60 ? y2 : y1;

    d3.select(".infoLabel")
        .style("left", x + "px")
        .style("top", y + "px");
};

//function to create legend that will update with changing attribute
function createLegend(csvData, expressedAttr) {

    //helpful resource: https://d3-legend.susielu.com/

    //create labels for legend using color scale
    var legendScale = d3.scaleThreshold()
        .domain(legendClasses)
        .range(colorClasses);

    //add svg element to webpage for legend
    legendContainer = d3.select("body")
        .append("svg")
        .attr("width", window.innerWidth*.43)
        .attr("class", "legendContainer");

    //add group elements to container to hold legend items
    var legend = d3.select(".legendContainer")

    legend.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(15,20)"); //look into this more/change it

    //create color shapes in legend
    var colorLegend = d3.legendColor()
        //.labelFormat(d3.format(".2f"))
        .shapeWidth(window.innerWidth*.078)
        .orient("horizontal")
        .scale(legendScale)
        .title(expressedAttr)
        .labels(d3.legendHelpers.thresholdLabels);

    //add colorLegend to legend
    legend.select(".legend")
        .call(colorLegend);

    //console.log("legend created");
};

//failed attempt at making a title , everytime I changed a varible in the dropdown the svg would shift from the top right corner to the top left corner
    //and also I just wasn't able to postion anything properly on the page, as well as not being able to add more than 1 line of text
// function createTitle() {
//
//     var econTitle = d3.select("body")
//         .append("svg")
//         .attr("width", window.innerWidth * .5)
//         .attr("height", 100)
//         .attr("class", "econTitle")
//
//     var title = econTitle.append("text")
//         .attr("x", 20)
//         .attr("y", "50%")
//         .attr("class", "title")
//         .text("Economic Indicators in the European Union")
// };


})(); //last line of main.js, call the self-executing anonymous function
