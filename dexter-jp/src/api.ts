// dexter-jp/src/api.ts
import { gateway } from "./gateway/index.js";

async function main() {
  const query = process.argv[2];

  if (!query) {
    console.error(JSON.stringify({ error: "No query provided" }));
    process.exit(1);
  }

  try {
    console.log(`[api.ts] Starting analysis for: "${query}"`);

    // gateway から実行（実際のエクスポート名に合わせて調整）
    const result = await gateway.run?.(query) 
                   || await gateway.execute?.(query) 
                   || await gateway.processQuery?.(query);

    if (!result) {
      throw new Error("Gateway did not return any result");
    }

    console.log(JSON.stringify(result));
    process.exit(0);
  } catch (err: any) {
    console.error(JSON.stringify({
      error: err.message || "Unknown error",
      details: String(err)
    }));
    process.exit(1);
  }
}

main().catch(err => {
  console.error(JSON.stringify({ error: err.message || String(err) }));
  process.exit(1);
});
