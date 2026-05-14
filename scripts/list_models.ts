// Quick script to list all available Gemini models for our API key
const key = process.env.GEMINI_API_KEY_5;
if (!key) { console.error("No GEMINI_API_KEY_5"); process.exit(1); }

async function main() {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
  const data = await res.json();
  
  if (data.models) {
    console.log("=== AVAILABLE MODELS ===");
    for (const m of data.models) {
      if (m.supportedGenerationMethods?.includes('generateContent')) {
        console.log(`  ${m.name}  →  ${m.displayName}`);
      }
    }
  } else {
    console.log("Response:", JSON.stringify(data, null, 2));
  }
}
main();
