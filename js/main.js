// Script by Matthew Laska; Unit 3 - D3 Lab; G575 Spring 2020
window.onload = setMap();

function setMap() {
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

        //translate world and eUnion topoJSON to geoJSON FeatureCollections
        var worldCountries = topojson.feature(world, world.objects.ne_50m_admin_0_countries),
            euCountries = topojson.feature(eUnion, eUnion.objects.euCountries);

        //examine results
        console.log(worldCountries);
        console.log(euCountries)
    };
};
