import { Hono } from 'hono';
import { Database } from 'bun:sqlite';

const app = new Hono();

function getTileFromCache(layer, z, x, y) {
    let dbfile;
    let sql;
    let data = './data';

    if (layer === 'countries-coastline-1m') {
        dbfile = 'tiles.sqlite';
        sql = `SELECT tile FROM "${layer}" WHERE z = $z AND x = $x AND y = $y`;
    }
    else {
        data += '/natural_earth';

        sql = 'SELECT tile_data AS tile FROM tiles WHERE zoom_level = $z AND tile_column = $x AND tile_row = $y';

        if (layer === 'nev') {
            dbfile = 'natural_earth.vector.mbtiles';
        }
        else if (layer === 'nev_raster') {
            if (z < 7) {
                dbfile = 'natural_earth_2_shaded_relief.raster.mbtiles';
            }
            else {
                data += '/NE2_LR_LC_SR';
                dbfile = 'ne2_shaded_relief.raster.mbtiles';
            }
        }
        else {
            dbfile = `50m_cultural/mbtiles/${layer}.mbtiles`;
        }
    }

    const db = new Database(`${data}/${dbfile}`, { strict: true });
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
    else {
        
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