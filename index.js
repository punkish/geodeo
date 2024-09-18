import { Hono } from 'hono';
import { Database } from 'bun:sqlite';
const db = new Database('./data/tiles.sqlite', { strict: true });

const app = new Hono();

function getTileFromCache(layer, z, x, y, db) {
    const res = db.query(`SELECT tile FROM "${layer}" WHERE z = $z AND x = $x AND y = $y`).get({ z, x, y });
    
    if (res) return res.tile;
}

app.get('/:layer/:z/:x/:y', (c) => {
    const { layer, z, x, y } = c.req.param();

    return new Response(getTileFromCache(layer, z, x, y, db), {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET"
        }
    });
})

export default app