import { Client } from "pg";

const password = "Singularidade1103";
const encodedPassword = encodeURIComponent(password);
const projectRef = "owdujngfzurvdlppufee";

const regions = [
  { name: "Virginia (aws-1)", host: "aws-1-us-east-1.pooler.supabase.com" },
  { name: "Virginia (aws-0)", host: "aws-0-us-east-1.pooler.supabase.com" },
  { name: "Ohio", host: "aws-0-us-east-2.pooler.supabase.com" },
  { name: "Oregon", host: "aws-0-us-west-2.pooler.supabase.com" },
  { name: "California", host: "aws-0-us-west-1.pooler.supabase.com" },
  { name: "Canada", host: "aws-0-ca-central-1.pooler.supabase.com" },
  { name: "Sao Paulo", host: "aws-0-sa-east-1.pooler.supabase.com" }
];

const connections: { name: string; url: string }[] = [];
for (const reg of regions) {
  connections.push({
    name: `Pooler ${reg.name} - 6543`,
    url: `postgresql://postgres.${projectRef}:${encodedPassword}@${reg.host}:6543/postgres`
  });
  connections.push({
    name: `Pooler ${reg.name} - 5432`,
    url: `postgresql://postgres.${projectRef}:${encodedPassword}@${reg.host}:5432/postgres`
  });
}

connections.push({
  name: "Conexão Direta - Porta 5432 (Pode exigir IPv6)",
  url: `postgresql://postgres:${encodedPassword}@db.${projectRef}.supabase.co:5432/postgres`
});

async function testAll() {
  console.log("⚡ Testando conexões com o Supabase...");
  
  for (const conn of connections) {
    console.log(`\n--------------------------------------------`);
    console.log(`🔌 Testando: ${conn.name}`);
    console.log(`   URL: ${conn.url.replace(encodedPassword, "****")}`);
    
    const client = new Client({ connectionString: conn.url });
    const start = Date.now();
    try {
      await client.connect();
      console.log(`   ✅ SUCESSO! Conectado em ${Date.now() - start}ms`);
      const res = await client.query("SELECT VERSION()");
      console.log(`   Version: ${res.rows[0].version}`);
      await client.end();
    } catch (e: any) {
      console.log(`   ❌ FALHOU: ${e.message}`);
    }
  }
}

testAll();
