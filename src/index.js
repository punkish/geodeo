import { Database } from 'bun:sqlite';
import { serve } from 'bun';

const PORT = 3000;
const responseOptions = {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET"
    }
};

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
                data += '/NE2_HR_LC_SR';
                dbfile = 'output.mbtiles';
            }
        }
        else {
            dbfile = `50m_cultural/mbtiles/${layer}.mbtiles`;
        }
    }

    //console.log(`${data}/${dbfile}`)
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

serve({
    port: PORT,
    async fetch(request) {
        const { method } = request;
        const { pathname } = new URL(request.url);
        const pathRegexForLZXY = /^\/(\w+)\/(\d+)\/(\d+)\/(\d+)$/;
       
        if (method === 'GET') {
            const match = pathname.match(pathRegexForLZXY);
            
            if (match) {
                const [layer, z, x, y] = match.slice(1);

                if (layer && z && x && y) {
                    const tile = getTileFromCache(layer, z, x, y);
                    return new Response(tile, responseOptions);
                }
            }
        
        }
    },
});

console.log(`Listening on http://localhost:${PORT} ...`);