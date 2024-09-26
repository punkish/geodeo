import geojsonvt from 'geojson-vt';

export default async function initTileIndex(data, zoom = 5, indexMaxPoints = 100000) {
    //console.log(`initializing "${layer}" tile index at zoom ${zoom}`);
    // const file = Bun.file(`./data/${layer}/${layer}.geo.json`);
    // const data = await file.json();
    const options = {

        // max zoom to preserve detail on; can't be higher than 24
        maxZoom: zoom,

        // simplification tolerance (higher means simpler)
        tolerance: 3,
                                
        // tile extent (both width and height)
        extent: 4096,

        // tile buffer on each side
        buffer: 64,

        // logging level (0 to disable, 1 or 2)
        debug: 0,

        // whether to enable line metrics tracking for 
        // LineString/MultiLineString features
        lineMetrics: false,
        
        // name of a feature property to promote to feature.id. Cannot be  
        // used with `generateId`
        promoteId: null,
                                 
        // whether to generate feature ids. Cannot be used with `promoteId`
        generateId: false,

        // max zoom in the initial tile index
        indexMaxZoom: zoom,

        // max number of points per tile in the index. sensible default  
        // is 100000, but set to 0 here to generate all the tiles between 
        // `indexMaxZoom` and `maxZoom`
        indexMaxPoints
    };
    
    return geojsonvt(data, options);
}