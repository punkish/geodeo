import geojsonvt from 'geojson-vt';
import vtpbf from 'vt-pbf';
import { Database } from 'bun:sqlite';
const db = new Database('./data/tiles.sqlite', { strict: true });

function initDb(db, layer) {
    const sql = `CREATE TABLE IF NOT EXISTS "${layer}" (
        id INTEGER PRIMARY KEY,
        z INTEGER,
        x INTEGER,
        y INTEGER,
        tile BLOB
    )`;
    
    db.query(sql).run();

    db.query(`CREATE INDEX IF NOT EXISTS "idx_${layer}" ON "${layer}" (
        z, x, y, tile
    )`).run();
}

function tileIndex2db(tileIndex, layer) {
    const chk = db.query(`SELECT tile FROM "${layer}" WHERE z = $z AND x = $x AND y = $y`);
    const ins = db.query(`INSERT INTO "${layer}" (z, x, y, tile) VALUES ($z, $x, $y, $tile)`);


    const insertMany = db.transaction((rows) => {
        for (const { z, x, y } of rows) {
            const res = chk.get({ z, x, y });

            if (!res) {
                const tileVt = tileIndex.getTile(z, x, y);
                const tile = vtpbf.fromGeojsonVt({ 'geojsonLayer': tileVt });
                ins.run({ z, x, y, tile });
            }
        }
    });

    insertMany(tileIndex.tileCoords);
}

function initTileIndex(layer) {
    console.log('initializing tile index');
    const file = fs.readFileSync(`./data/${layer}/${layer}.geo.json`);
    const data = JSON.parse(file);
    const options = {
        maxZoom: 10,           // max zoom to preserve detail on; 
                                // can't be higher than 24

        tolerance: 3,          // simplification tolerance (higher means 
                                // simpler)

        extent: 4096,          // tile extent (both width and height)

        buffer: 64,            // tile buffer on each side

        debug: 0,              // logging level (0 to disable, 1 or 2)

        lineMetrics: false,    // whether to enable line metrics tracking 
                                // for LineString/MultiLineString features

        promoteId: null,       // name of a feature property to promote to 
                                // feature.id. Cannot be used with 
                                // `generateId`

        generateId: false,     // whether to generate feature ids. Cannot 
                                // be used with `promoteId`

        indexMaxZoom: 10,      // max zoom in the initial tile index

        indexMaxPoints: 0      // max number of points per tile in the index
                                // sensible default is 100000, but set to 0
                                // here to try and generate all the tiles
    };
    
    return geojsonvt(data, options);
}

const layer = 'countries-coastline-1m';
initDb(db, layer);
const tileIndex = initTileIndex(layer);
tileIndex2db(tileIndex, layer);