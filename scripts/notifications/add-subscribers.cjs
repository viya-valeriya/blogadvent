const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "subscribers.json");
const ids = process.argv.slice(2).map((x) => Number(String(x).trim())).filter(Boolean);

if (!fs.existsSync(file)) fs.writeFileSync(file, "[]", "utf8");
const current = new Set(JSON.parse(fs.readFileSync(file, "utf8") || "[]").map(Number));

for (const id of ids) current.add(id);

fs.writeFileSync(file, JSON.stringify([...current].sort((a,b)=>a-b), null, 2), "utf8");
console.log("✅ Subscribers saved:", current.size);
