// Script by Matthew Laska; Unit 3 - D3 Lab; G575 Spring 2020
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
        // console.log(csvData);
        // console.log(world);
        // console.log(euCountries);

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

        //translate world and eUnion topoJSON to geoJSON FeatureCollections
        var worldCountries = topojson.feature(world, world.objects.ne_50m_admin_0_countries),
            euCountries = topojson.feature(eUnion, eUnion.objects.euCountries).features; //add on .features because .data needs array as parameter, but topojson.feature turns topojson object to geojson FeatureCollection object. thus, for europeanUnion block to work, need to pull array of features out of FeatureCollection and pass it to .data()

        //examine results
        console.log(worldCountries);
        console.log(euCountries)

        //add world countries to map
        var countries = laskaMap.append("path")
            .datum(worldCountries)
            .attr("class", "countries")
            .attr("d", path)

        //add EU Countries to map - create enumeration units for choropleth. use select all,data,enter to draw each feature corresponding to a country separately
        var europeanUnion = laskaMap.selectAll(".europeanUnion")
            .data(euCountries)
            .enter()
            .append("path")
            .attr("class", function(d) {
                return "europeanUnion " + d.properties.Country;
            })
            .attr("d", path)
    };
};
