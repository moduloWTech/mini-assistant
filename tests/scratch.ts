import dotenv from "dotenv";
dotenv.config();
import { orchestrator } from "./src/orchestrator/orchestrator";

async function test() {
  try {
    const res = await orchestrator("Ola", "Ola", "058155d3-1494-42c6-a9cd-f134b4000452", "user123");
    console.log("SUCCESS:", res);
  } catch (err) {
    console.error("ERROR:", err);
  }
}
test();
