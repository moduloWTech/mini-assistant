const { Pool } = require('pg');
const pool = new Pool({ connectionString: "postgresql://postgres:password123@localhost:5432/mini_assistant?schema=public" });
async function main() {
  const res = await pool.query('SELECT * FROM "User"');
  console.log("Users:", res.rows);
  pool.end();
}
main();
