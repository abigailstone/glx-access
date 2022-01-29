
// existing MBTA line features 
// https://www.mass.gov/info-details/massgis-data-mbta-rapid-transit
var mbta_arcs = ee.FeatureCollection("users/astone/glx/mbta_arc");

// bring in manually plotted GLX polyline 
var glx_line = ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.LineString(
                [[-71.07692275771402, 42.3716220866526],
                 [-71.07905892851495, 42.37284502233786],
                 [-71.08189134123468, 42.374786909879475],
                 [-71.08354483918563, 42.37604855560093],
                 [-71.08595882729904, 42.37860060807048],
                 [-71.08836208657638, 42.38108915562741],
                 [-71.08962808923141, 42.38227791742024],
                 [-71.09082971887008, 42.38370440186227],
                 [-71.09194551782028, 42.385035758100166],
                 [-71.09278236703292, 42.38582029409097],
                 [-71.09352265672103, 42.38639085956265],
                 [-71.09452043847458, 42.38700104189814],
                 [-71.0955358410246, 42.38745923888119],
                 [-71.09666236881085, 42.387942622343395],
                 [-71.09849699977704, 42.38877466712597],
                 [-71.10169317732752, 42.39021685195665],
                 [-71.10308792601526, 42.39089831238169],
                 [-71.10395159731806, 42.39142525054499],
                 [-71.10535707484186, 42.39259004552402],
                 [-71.10630657683313, 42.39373500999645],
                 [-71.1076691390127, 42.39550986173288],
                 [-71.10886003981531, 42.397134124021306],
                 [-71.10951986323298, 42.397985854515916],
                 [-71.11061420451105, 42.399475364710085],
                 [-71.11210348549267, 42.40143227382909],
                 [-71.11343673008273, 42.403224871049794],
                 [-71.11472419040987, 42.404971726908435],
                 [-71.11596566864183, 42.40658329350442],
                 [-71.1170804556693, 42.40812730464486],
                 [-71.11770809257878, 42.40889174789776]]),
            {
              "LINE": "GREEN",
              "system:index": "0"
            }),
        ee.Feature(
            ee.Geometry.LineString(
                [[-71.08217108583176, 42.374995327478985],
                 [-71.08469504451477, 42.3752747156348],
                 [-71.09000163624461, 42.37594774288647],
                 [-71.09252291271861, 42.376328180256934],
                 [-71.09447556088145, 42.37700979144868],
                 [-71.09516220638926, 42.37743777609028]]),
            {
              "LINE": "GREEN",
              "system:index": "1"
            })]);


// color palette for each line
var palette = ee.Dictionary({
  'RED': 'D55E00',
  'GREEN': '009E73',
  'BLUE': '0072B2',
  'ORANGE': 'E69F00',
  'SILVER': '999999',
});

// filter out the silver line
mbta_arcs = mbta_arcs.filter(ee.Filter.neq('LINE', 'SILVER'));

// merge existing features to hand-plotted features 
var merged = mbta_arcs.merge(glx_line);

// assign style param to each feature
var color_merged = merged.map(function(a){
  return a.set({style: {color: palette.get(a.get('LINE'))}})
})
// add to map with colors!
// Map.addLayer(color_merged.style({styleProperty: "style"}), {}, 'Lines');


// Export as a new EE asset
// NB: can't export with color
Export.table.toAsset({
  collection: merged,
  description: 'Export_mbta_glx_arc',
  assetId: 'mbta_glx_arc'
});

