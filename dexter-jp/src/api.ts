import { run } from "./gateway/run.js";   // .js 拡張子を付けておく

async function main() {
  const query = process.argv[2];

  if (!query) {
    console.error(JSON.stringify({ error: "No query provided" }));
    process.exit(1);
  }

  try {
    console.log(`[api.ts] Starting analysis for query: "${query}"`);

    const result = await run(query);

    // 必ず JSON で出力（これが一番重要）
    console.log(JSON.stringify(result));

    process.exit(0);
  } catch (err: any) {
    const errorResponse = {
      error: err.message || "Unknown error in dexter-jp",
      details: String(err),
    };
    console.error(JSON.stringify(errorResponse));
    process.exit(1);
  }
}

main().catch((err: any) => {
  console.error(JSON.stringify({
    error: "Fatal error in api.ts",
    details: err.message || String(err)
  }));
  process.exit(1);
});
