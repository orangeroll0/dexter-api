// dexter-api/server/dexterRunner.ts
import fetch from "node-fetch";

export async function runDexterCLI(
  query: string,
  onOutput: (o: string) => void,
  onDone: (ok: boolean) => void
) {
  try {
    onOutput(`[INFO] Sending request to dexter-jp /api/analyze...`);
    
    const resp = await fetch("http://localhost:3000/api/analyze", { // dexter-jp サーバーURL
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    onOutput(`[INFO] Received HTTP status: ${resp.status}`);

    if (!resp.ok) {
      const text = await resp.text();
      onOutput(`[ERR] dexter-jp returned error: ${text}`);
      onDone(false);
      return;
    }

    const data = await resp.json();
    onOutput(`[INFO] Response JSON: ${JSON.stringify(data)}`);

    // 結果を逐次出力に分解（任意）
    if (data.result) {
      if (typeof data.result === "string") {
        onOutput(data.result);
      } else if (Array.isArray(data.result)) {
        data.result.forEach((line: string) => onOutput(line));
      } else {
        onOutput(JSON.stringify(data.result));
      }
    }

    onDone(true);
  } catch (e: any) {
    onOutput(`[ERR] fetch failed: ${e.message}`);
    onDone(false);
  }
}
