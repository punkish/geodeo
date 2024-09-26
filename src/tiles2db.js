import vtpbf from 'vt-pbf';
import { Database } from 'bun:sqlite';
const db = new Database('./data/tiles.sqlite', { create: true, strict: true });
import initTileIndex from './tileIndexer.js';

function initDb(db, layer) {
    console.log(`creating table "${layer}"`);
    const sql = `CREATE TABLE IF NOT EXISTS "${layer}" (
        id INTEGER PRIMARY KEY,
        z INTEGER,
        x INTEGER,
        y INTEGER,
        tile BLOB
    )`;
    
    let query = db.query(sql);
    query.run();

    query = db.query(`CREATE INDEX IF NOT EXISTS "idx_${layer}" ON "${layer}" (
        z, x, y, tile
    )`);
    query.run();
}

function tileIndex2db(tileIndex, layer) {
    console.log(`writing tile index for "${layer}" to db`);
    const chk = db.query(`SELECT tile FROM "${layer}" WHERE z = $z AND x = $x AND y = $y`);
    const ins = db.query(`INSERT INTO "${layer}" (z, x, y, tile) VALUES ($z, $x, $y, $tile)`);


    const insertMany = db.transaction((rows) => {
        for (const { z, x, y } of rows) {
            const res = chk.get({ z, x, y });

            if (!res) {
                const tileVt = tileIndex.getTile(z, x, y);
                const obj = {};
                obj[`${layer}`] = tileVt;
                const tile = vtpbf.fromGeojsonVt(obj);
                ins.run({ z, x, y, tile });
            }
        }
    });

    insertMany(tileIndex.tileCoords);
}

const layers = [
    {
        layer: 'countries-coastline-1m',
        zoom: 10,
        indexMaxPoints: 0
    },
    {
        layer: 'earth-waterbodies-1m',
        zoom: 10,
        indexMaxPoints: 0
    }
];

layers.forEach(async (l) => {
    const layer = l.layer;
    const zoom = l.zoom;
    const indexMaxPoints = l.indexMaxPoints;

    initDb(db, layer);
    const tileIndex = await initTileIndex(layer, zoom, indexMaxPoints);
    tileIndex2db(tileIndex, layer);
})