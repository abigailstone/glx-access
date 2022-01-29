
// Create GLX station points to merge with existing station layer 
var glx_node = ee.FeatureCollection([
  ee.Feature(ee.Geometry.Point([-71.09520919669666,42.37744269415318]))
    .set('STATION', 'Union Sq')
    .set('TERMINUS', 'Y'), 
  ee.Feature(ee.Geometry.Point([-71.08810835131034,42.38015114441682]))
    .set('STATION', 'E Somerville')
    .set('TERMINUS', 'N'), 
  ee.Feature(ee.Geometry.Point([-71.09757695783982,42.38848615402371]))
    .set('STATION', 'Gilman Sq')
    .set('TERMINUS', 'N'), 
  ee.Feature(ee.Geometry.Point([-71.1064143729957,42.39334795162643]))
    .set('STATION', 'Magoun Sq')
    .set('TERMINUS', 'N'),
  ee.Feature(ee.Geometry.Point([-71.11180109773986,42.40018202384575]))
    .set('STATION', 'Ball Sq')
    .set('TERMINUS', 'N'),
  ee.Feature(ee.Geometry.Point([-71.11779186925922,42.408545189867134]))
    .set('STATION', 'Tufts')
    .set('TERMINUS', 'Y')
])

// assign route and station for all GLX stations
glx_node = glx_node.map(function(station){
    return station.set('LINE', 'GREEN')
                  .set('ROUTE', 'E')
  });


// merge with existing station dataset 
var mbta_glx_node = mbta_node.merge(glx_node);

// Export as GEE Asset 
Export.table.toAsset({
  collection: mbta_glx_node, 
  description:'export_glx_stations',
  assetId: 'mbta_glx_node'
})

// Map.addLayer(glx_node, {}, 'glx')
// Map.addLayer(mbta_node, {}, 'stations')
// Map.addLayer(mbta_glx_node, {}, 'all')
