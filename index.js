import express from "express"; 
import sql from "mssql"; 

const app = express(); 
app.use(express.json()); 

// Конфигурация MSSQL CloudClusters 
const dbConfig = { 
user: process.env.DB_USER, 
password: process.env.DB_PASS, 
server: "mssql-206397-0.cloudclusters.net", 
port: 10046, 
database: process.env.DB_NAME, 
options: { 
encrypt: true, 
trustServerCertificate: true 
} 
}; 

app.post("/sync", async (req, res) => { 
const { table, rows } = req.body; 

if (!table || !rows) { 
return res.status(400).json({ error: "Missing table or rows" }); 
} 

try { 
const pool = await sql.connect(dbConfig); 

// 1. Создаём таблицу, если её нет 
const createTableQuery = ` 
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='${table}' AND xtype='U')
CREATE TABLE ${table} ( 
_id NVARCHAR(255) PRIMARY KEY, 
description NVARCHAR(MAX), 
hpone NVARCHAR(MAX), 
hptwo NVARCHAR(MAX), 
hpthree NVARCHAR(MAX), 
coment NVARCHAR(MAX), 
imnameone NVARCHAR(MAX), 
imnametwo NVARCHAR(MAX), 
inname NVARCHAR(MAX), 
vesselname NVARCHAR(MAX), 
loc NVARCHAR(MAX), 
mastername NVARCHAR(MAX), 
dpa NVARCHAR(MAX), 
omd NVARCHAR(MAX) 
) 
`; 
await pool.request().query(createTableQuery); 

// 2. Вставка или обновление строк (UPSERT) 
for (const row of rows) { 
const upsertQuery = ` 
MERGE ${table} AS target 
USING (SELECT '${row._id}' AS _id) AS source 
ON target._id = source._id 
WHEN MATCHED THEN 
UPDATE SET 
description='${row.description}', 
hpone='${row.hpone}', 
hptwo='${row.hptwo}', 
hpthree='${row.hpthree}', 
coment='${row.coment}', 
imnameone='${row.imnameone}', 
imnametwo='${row.imnametwo}', 
inname='${row.inname}', 
vesselname='${row.vesselname}', 
loc='${row.loc}', 
mastername='${row.mastername}', 
dpa='${row.dpa}', 
omd='${row.omd}' 
WHEN NOT MATCHED THEN 
INSERT (_id, description, hpone, hptwo, hpthree, coment, imnameone, imnametwo, inname, vesselname, loc, mastername, dpa, omd) 
VALUES ('${row._id}', '${row.description}', '${row.hpone}', '${row.hptwo}', '${row.hpthree}', '${row.coment}', '${row.imnameone}', '${row.imnametwo}', '${row.inname}', '${row.vesselname}', '${row.loc}', '${row.mastername}', '${row.dpa}', '${row.omd}'); 
`; 

await pool.request().query(upsertQuery); 
} 

res.json({ status: "ok", updated: rows.length }); 

} catch (err) { 
console.error("Sync error:", err); 
res.status(500).json({ error: "Database error", details: err.message }); 
} 
}); 

app.listen(3000, () => console.log("Server running on port 3000"));
