// dexter-api/server/dexterRunner.ts
import { spawn } from "child_process";
import path from "path";

/**
 * Dexter CLI を非インタラクティブで実行（無料Render対応版）
 */
export function runDexterCLI(
  query: string,
  onOutput: (o: string) => void,
  onDone: (ok: boolean) => void
) {
  try {
    onOutput("[INFO] Starting Dexter CLI (ts-node via bun)...");

    const dexterPath = path.resolve("./dexter-jp");

    const proc = spawn(
      "bun",
      ["run", "start"],                    // ts-node src/index.ts が呼ばれる
      {
        cwd: dexterPath,
        env: { ...process.env },
        stdio: ["pipe", "pipe", "pipe"],   // stdinをpipeに
      }
    );

    // プロセス起動後、少し待ってからクエリをstdinに送信（インタラクティブ対策）
    setTimeout(() => {
      if (proc.killed) return;
      
      const trimmedQuery = query.trim();
      proc.stdin.write(trimmedQuery + "\n");
      proc.stdin.end();                    // 送信後に閉じる（重要）

      onOutput(`[INFO] Query sent (${trimmedQuery.length} chars)`);
    }, 2000);  // 2秒待機（起動時間を考慮）

    // stdout処理
    proc.stdout.on("data", (data: Buffer) => {
      const lines = data.toString().split("\n").map(l => l.trim()).filter(Boolean);
      lines.forEach(line => onOutput(`[OUT] ${line}`));
    });

    // stderr処理
    proc.stderr.on("data", (data: Buffer) => {
      const lines = data.toString().split("\n").map(l => l.trim()).filter(Boolean);
      lines.forEach(line => onOutput(`[ERR] ${line}`));
    });

    proc.on("close", (code: number | null) => {
      onOutput(`[INFO] Dexter CLI exited with code: ${code}`);
      onDone(code === 0);
    });

    proc.on("error", (err: Error) => {
      onOutput(`[ERR] Process error: ${err.message}`);
      onDone(false);
    });

  } catch (e: any) {
    onOutput(`[ERR] spawn failed: ${e.message}`);
    onDone(false);
  }
}
