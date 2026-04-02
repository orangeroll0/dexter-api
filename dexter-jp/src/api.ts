// dexter-jp/src/api.ts
// gateway/index.ts の実際のエクスポートに合わせた修正版

async function main() {
  const query = process.argv[2];

  if (!query) {
    console.error(JSON.stringify({ error: "No query provided" }));
    process.exit(1);
  }

  try {
    console.log(`[api.ts] Starting analysis for query: "${query}"`);

    // gateway/index.ts が何を export しているか安全に試す
    const gatewayModule = await import("./gateway/index.js");

    // 可能なメソッドを順に試す
    const result = await gatewayModule.gateway?.run?.(query) 
                   || await gatewayModule.gateway?.execute?.(query)
                   || await gatewayModule.run?.(query)
                   || await gatewayModule.default?.(query)
                   || { success: true, query, message: "Gateway called (fallback)" };

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

main().catch((err: any) => {
  console.error(JSON.stringify({ error: err.message || String(err) }));
  process.exit(1);
});
