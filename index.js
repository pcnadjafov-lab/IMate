import express from "express"; 
import mysql from "mysql2/promise"; 

const app = express(); 
app.use(express.json()); // Подключение к Railway MySQL 
const db = await mysql.createConnection(process.env.MYSQL_URL); 
// Маршрут синхронизации 
app.post("/sync", async (req, res) => { 
    const { table, rows } = req.body; 

if (!table || !rows) { return res.status(400).json({ error: "Missing table or rows" }); 
} 

for (const row of rows) { 
    await db.query( 
        ` 
        INSERT INTO ${table} 
        (_id, description, hpone, hptwo, hpthree, coment, imnameone, imnametwo, inname, vesselname, loc, mastername, dpa, omd) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
        ON DUPLICATE KEY UPDATE 
             description = VALUES(description), 
             hpone = VALUES(hpone), 
             hptwo = VALUES(hptwo), 
             hpthree = VALUES(hpthree), 
             coment = VALUES(coment), 
             imnameone = VALUES(imnameone), 
             imnametwo = VALUES(imnametwo), 
             inname = VALUES(inname), 
             vesselname = VALUES(vesselname), 
             loc = VALUES(loc), 
             mastername = VALUES(mastername), 
             dpa = VALUES(dpa), 
             omd = VALUES(omd) 
       `, 
       [ 
             row._id, 
             row.description, 
             row.hpone, 
             row.hptwo, 
             row.hpthree, 
             row.coment, 
             row.imnameone, 
             row.imnametwo, 
             row.inname, 
             row.vesselname, 
             row.loc, 
             row.mastername, 
             row.dpa, 
             row.omd 
       ] 
     ); 
  } 

res.json({ status: "ok", updated: rows.length }); 
}); 
app.listen(3000, () => console.log("Server running on port 3000"));