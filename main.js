
// imports
var uifuncs = require('users/astone/glx:uifuncs');

/***************************************
 * Datasets etc.
 ***************************************/

 // GLX features
var stationsCurr = ee.FeatureCollection('users/astone/glx/mbta_node');
var stationsGLX = ee.FeatureCollection('users/astone/glx/mbta_glx_node');
// var tracks = ee.FeatureCollection('users/astone/glx/mbta_glx_arc');

//palettes
var palettes = require('users/gena/packages:palettes');

// super broad region for clipping datasets
var regionRect = ee.Geometry.Polygon(
      [[[-71.4428925467733, 42.57909149035017],
        [-71.4428925467733, 42.11016101830315],
        [-70.74251412880454, 42.11016101830315],
        [-70.74251412880454, 42.57909149035017]]], null, false);


/***************************************
 * Travel time maps
 ***************************************/

// Filter road dataset by region
var roads = ee.FeatureCollection("TIGER/2016/Roads").filterBounds(regionRect);

// only keep "walkable" roads: https://www2.census.gov/geo/pdfs/reference/mtfccs.pdf
var filtered_roads = roads.filter(
  ee.Filter.inList('mtfcc',
    ['S1200', 'S1400', 'S1710', 'S1730', 'S1820', 'S1780', 'S1740'])
);

// rasterize roads and create friction map
// minutes per meter of human walking = 0.012
var travelSpeed = ee.Image(0)
  .float()
  .paint(filtered_roads, 0.012, 3)
  .clip(regionRect)
  .selfMask()

var getCostMap = function(stations, travelSpeed){
  /* Create a mosaicked ImageCollection of the region by date
  * @param stations = ee.FeatureCollection of stations as points
  * @param travel_speed = ee.Image of travel speeds along routes (masked)
  * @return: ee.Image of travel times from each pixel
  */

  // create a rasterized version of station
  var stationPoints = ee.Image(0)
    .float()
    .paint(stations, 1)
    .focalMax({
      kernel: ee.Kernel.circle({radius: 1}),
      iterations: 5
    });

  // calcualte accumulated travel time over route
  var travelTime = travelSpeed.cumulativeCost(stationPoints, 1500);

  return travelTime;

}

// calculate walking time layers
var walkingTimeCurr = getCostMap(stationsCurr, travelSpeed)
var walkingTimeGLX = getCostMap(stationsGLX, travelSpeed);

// visualization params
var visParams = {
  palette: palettes.colorbrewer.OrRd[9].slice(3,9).reverse(),
  min: 0,
  max: 15
};



/***************************************
 * UI stuff
 ***************************************/

//Create second panel & linker
var linkedMap = ui.Map();
var linker = ui.Map.Linker([ui.root.widgets().get(0), linkedMap]);

// split panel
var splitPanel = ui.SplitPanel({
  firstPanel: linker.get(0),
  secondPanel: linker.get(1),
  orientation: 'horizontal',
  wipe: true,
  style: {stretch: 'both'}
});

// set split panel as the only thing in root
ui.root.widgets().reset([splitPanel]);


// custom basemap params
var basemapgray = [
  {stylers: [{saturation: -100 }]},
  { elementType: 'labels',stylers: [{lightness:40}]},
  {featureType: 'road', elementType: 'geometry', stylers:[{visibility: 'simplified'}]},
  {elementType: 'labels.icon', stylers:[{ visibility:'off'}]},
  {featureType: 'poi', elementType: 'all', stylers:[{visibility:'off'}]}
];

// Set map controls
Map.setControlVisibility({
  drawingToolsControl: false
})

Map.setOptions('Gray', {'Gray': basemapgray});
linkedMap.setOptions('Gray', {'Gray': basemapgray});
Map.setCenter(-71.106331, 42.378294, 13);


/***************************************
 * Add data to map
 ***************************************/

// Add data layers
Map.addLayer(walkingTimeCurr, visParams, 'Current')
linkedMap.addLayer(walkingTimeGLX, visParams, 'GLX')

// Layer labels
var beforeLabel = ui.Panel([ui.Label('Before GLX')], 'flow', {position: 'bottom-left'})
Map.add(beforeLabel)
var afterLabel = ui.Panel([ui.Label('After GLX')], 'flow', {position: 'bottom-right'})
linkedMap.add(afterLabel)

// Walking distance legend
var walkingLegend = uifuncs.makeWalkingLegend(visParams, 'Walking Time (mins)');
var legend = ui.Panel([walkingLegend],
                      'flow',
                      {position: 'bottom-right'});
linkedMap.add(legend)
