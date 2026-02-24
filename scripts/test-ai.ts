// platform/scripts/test-ai.ts
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from platform/.env BEFORE importing the service
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { AgriBrain } from '../src/lib/ai-service';

async function runTest() {
  console.log("🚀 Starting Agri-Brain AI Service Test...\n");

  // Test 1: Analyze Tree Health
  console.log("--- Testing analyzeTreeHealth (Qwen-VL-Max) ---");
  const dummyImage = "https://images.unsplash.com/photo-1596327643560-61266e568ac6?q=80&w=2070&auto=format&fit=crop"; // A generic plant/leaf image

  try {
    console.log(`Analyzing image: ${dummyImage}`);
    const healthResult = await AgriBrain.analyzeTreeHealth(dummyImage);
    console.log("✅ Diagnosis Result:", JSON.stringify(healthResult, null, 2));
  } catch (error) {
    console.error("❌ Analysis Failed:", error);
  }

  console.log("\n---------------------------------------------\n");

  // Test 2: Generate Weekly Report
  console.log("--- Testing generateWeeklyReport (Qwen-Max) ---");
  const zoneId = "ZONE-A-01";

  try {
    console.log(`Generating report for: ${zoneId}`);
    const reportResult = await AgriBrain.generateWeeklyReport(zoneId);
    console.log("✅ Report Generated:");
    const reportText = typeof reportResult.report === "string" ? reportResult.report : "";
    console.log((reportText.substring(0, 500) || "[empty report]") + "..."); // Print first 500 chars
  } catch (error) {
    console.error("❌ Report Generation Failed:", error);
  }
}

runTest();
