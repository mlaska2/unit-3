// Script by Matthew Laska; Unit 3 - D3 Lab; G575 Spring 2020

(function() {

//pseudo-global variables
    //variables for data join
var attrArray = ["Volume Index of GDP/Capita", "Unemployment Rate", "Life Expectancy", "GHG Emissions/Capita", "National Debt as % of GDP"];
var expressedAttr = attrArray[0] //initial attribute

//begin script when window loads
window.onload = setMap();

//set up choropleth map
function setMap() {

    //map frame dimensions in webpage
    var width = 850,
        height = 500;

    //create new svg container for the map in the webpage --map block to append svg container that will hold the map
    var laskaMap = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    //create Albers equal area conic - projection function - centered on EU (Gadheim, Germany) [9.9019, 49.8431] lon/lat
    var projection = d3.geoAlbers()
        //put center coordinates of chosen area as .center lat and .rotate lon
        .center([0, 53]) //keep .center lon at 0??
        .rotate([-9.9019,0,0]) //keep .rotate lat at 0?? //possibly -9?
        .parallels([41, 65]) //standard parallels from projection wizard
        .scale(750) //2500 = used in example, change based on your map
        .translate([width/2, height/2]) // keep as half width and height of svg container to keep map centered in container

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
            .attr("d", path)

        //join csv data to GeoJSON enumeration units
        euCountries = joinData(euCountries, csvData);

        //create color scale
        var colorScale = makeColorScale(csvData);

        //add enumeration units to the map
        setEnumerationUnits(euCountries, laskaMap, path, colorScale);
    };
}; //end of setMap function

//function to create graticule and background
function setGraticule(laskaMap, path) {

    //create graticule generator
    var graticule = d3.geoGraticule()
        .step([10, 10]); //place graticule lines every 5 degrees of [lon,lat]

    //create graticule background
    var gratBackground = laskaMap.append("path")
        .datum(graticule.outline()) //bind graticule background
        .attr("class", "gratBackground")
        .attr("d", path) //project graticule background

    //create graticule lines
    var gratLines = laskaMap.selectAll(".gratLines") //select graticule elements that will be created
        .data(graticule.lines()) //bind graticule lines to each element to be created
        .enter() //create an element for each datum
        .append("path") //append each element (grat line) to the svg as a path element
        .attr("class", "gratLines") //assign class for styling
        .attr("d", path); //project graticule lines by putting in path generator
};

//function to?????
function joinData(euCountries, csvData) {

    //loop through csv to assign each set of csv attribute values to geojson region
    for (var i=0; i<csvData.length; i++) {
        var csvCountry = csvData[i]; //index of the current country
        var csvKey = csvCountry.Country; //the csv primary key to be used for join
        console.log(csvCountry)

        //loop through geojson countries to find correct country
        for (var a=0; a<euCountries.length; a++) {

            var geojsonProperties = euCountries[a].properties //the current countries geojson properties
            var geojsonKey = geojsonProperties.Country //the geojson primary key to be used for the join, should be the same as csvKey

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

    var colorClasses = [ //pick own color scheme from colorbrewer
       "#D4B9DA",
       "#C994C7",
       "#DF65B0",
       "#DD1C77",
       "#980043"
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

  //for natural breaks
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

    //assign array of last 4 cluster minimums as domain
    colorScale.domain(domainArray);

  //for all 3, return colorscale to function
     return colorScale;
};

//function to???
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
            return colorScale(d.properties[expressedAttr])
        });
};

})(); //last line of main.js, call the self-executing anonymous function
