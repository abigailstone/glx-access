
// imports 
var uifuncs = require('users/astone/glx:uifuncs');

/***************************************
 * Base Map & Map Controls
 ***************************************/

// Customize basemap
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
// Map.setCenter(-73.31, 44.4398, 9);
Map.setCenter(-71.106331, 42.378294, 13);

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
  .paint(roads, 0.012, 3)
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

// visualization params -- TO FIX!
var visParams = {
  palette: palettes.colorbrewer.OrRd[9],
  min: -4, 
  max: 16
};

Map.addLayer(walkingTimeCurr, visParams, 'Current')
Map.addLayer(walkingTimeGLX, visParams, 'GLX')



/***************************************
 * UI stuff
 ***************************************/
var legend = ui.Panel([ui.Label()],
                      'flow',
                      {position: 'bottom-right'});
Map.add(legend);

var walkingLegend = uifuncs.makeWalkingLegend(visParams, 'Walking Time (mins)');
legend.widgets().set(0, walkingLegend);

 
// Layer selection
var checkbox = ui.Checkbox('Show GLX layer', true);
checkbox.onChange(function(checked) {
  Map.layers().get(1).setShown(checked);
});

// Panel for ice layer selection
var layerPanel = ui.Panel({
  layout: ui.Panel.Layout.flow('vertical'),
  style: {position:'bottom-left', width:'225px'}
});

layerPanel.add(checkbox);

Map.add(layerPanel);


 
 

