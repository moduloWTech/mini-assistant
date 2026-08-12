import { orchestrator } from "../src/orchestrator/orchestrator";
import dotenv from "dotenv";
dotenv.config();

async function run() {
  try {
    console.log("Calling orchestrator with a query that misses the cache to force LLM call...");
    const result = await orchestrator(
      "Qual a distância aproximada da terra até o sol?",
      "Qual a distância aproximada da terra até o sol?",
      "058155d3-1494-42c6-a9cd-f134b4000452",
      "test-user-123"
    );
    console.log("\n✅ Success! Response from orchestrator:");
    console.log(result);
  } catch (error) {
    console.error("❌ Error running orchestrator test:", error);
  }
}

run();
