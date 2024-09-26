import { Hono } from 'hono';
import { Database } from 'bun:sqlite';

const app = new Hono();

function getTileFromCache(layer, z, x, y) {
    let db;
    let sql;

    if (layer === 'countries-coastline-1m') {
        db = new Database('./data/tiles.sqlite', { strict: true });
        sql = `SELECT tile FROM "${layer}" WHERE z = $z AND x = $x AND y = $y`;
    }
    else {
        sql = `SELECT tile_data AS tile FROM tiles WHERE zoom_level = $z AND tile_column = $x AND tile_row = $y`;

        if (layer === 'nev') {
            db = new Database('./data/natural_earth_vector/natural_earth.vector.mbtiles', { strict: true });
            
        }
        else if (layer === 'nev_raster') {
            db = new Database('./data/natural_earth_vector/natural_earth_2_shaded_relief.raster.mbtiles', { strict: true });
        }
        else {
            db = new Database(`./data/natural_earth_vector/50m_cultural/mbtiles/${layer}.mbtiles`, { strict: true });
        }
    }
    
    
    const res = db.query(sql).get({ z, x, y });

    if (res) {

        if (layer === 'nev') {
            const data = Buffer.from(res.tile);

            // => Uint8Array
            return Bun.gunzipSync(data);    
        }
        else {
            return res.tile;
        }
        
    }
}

app.get('/:layer/:z/:x/:y', (c) => {
    const { layer, z, x, y } = c.req.param();

    return new Response(getTileFromCache(layer, z, x, y), {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET"
        }
    });
})

export default app