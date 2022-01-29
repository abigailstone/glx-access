exports.makeWalkingLegend = function(vis, title){
  /* Create a color scale bar for walking time
  * @param: vis = visualization parameters for image 
  * @param: title = ee.String for legend title later 
  * @return: ui.Panel element with colorbar legend
  */
  
  var colorBar = ui.Thumbnail({
    image: ee.Image.pixelLonLat().select(0),
    params: {
      bbox: [0, 0, 1, 0.1],
      dimensions: '100x10',
      format: 'png',
      min: 0, 
      max: 1,
      palette: vis.palette
    },
    style: {stretch: 'horizontal', margin: '0px 8px', maxHeight: '24px'},
  });

  var legendLabels = ui.Panel({
    widgets: [
      ui.Label(ee.Number(vis.min).getInfo(), {margin: '4px 8px'}),
      ui.Label(
          ee.Number(vis.max - ((vis.max-vis.min) / 2)).getInfo(),
          {margin: '4px 8px', textAlign: 'center', stretch: 'horizontal'}),
      ui.Label(ee.Number(vis.max).getInfo(), {margin: '4px 8px'})
    ],
    layout: ui.Panel.Layout.flow('horizontal')
  });
  
  var legendTitle = ui.Label({
    value: title,
    style: {fontWeight: 'bold'}
  });
  
  var legendPanel = ui.Panel([legendTitle, colorBar, legendLabels]);
  
  return legendPanel
}
