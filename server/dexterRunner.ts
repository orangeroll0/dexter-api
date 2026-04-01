// dexter-api/server/dexterRunner.ts
import { spawn } from "child_process";
import path from "path";

export function runDexterCLI(
  query: string,
  onOutput: (o: string) => void,
  onDone: (ok: boolean) => void
) {
  try {
    onOutput("[INFO] Starting Dexter CLI...");

    const dexterPath = path.resolve("./dexter-jp");

    const proc = spawn("bun", ["run", "start"], {
      cwd: dexterPath,
      env: { ...process.env },
      stdio: ["pipe", "pipe", "pipe"],
    });

    // 起動待機を少し長めに（インタラクティブプロンプトが出るまで待つ）
    setTimeout(() => {
      if (proc.killed) return;
      const cleanQuery = query.trim();
      proc.stdin.write(cleanQuery + "\n\n");   // 改行を2回入れてプロンプトを抜ける対策
      proc.stdin.end();
      onOutput(`[INFO] Query sent: ${cleanQuery.substring(0, 100)}${cleanQuery.length > 100 ? '...' : ''}`);
    }, 3000);  // 3秒待機（調整可能）

    proc.stdout.on("data", (data: Buffer) => {
      const lines = data.toString().split("\n").map(l => l.trim()).filter(Boolean);
      lines.forEach(l => onOutput(`[OUT] ${l}`));
    });

    proc.stderr.on("data", (data: Buffer) => {
      const lines = data.toString().split("\n").map(l => l.trim()).filter(Boolean);
      lines.forEach(l => onOutput(`[ERR] ${l}`));
    });

    proc.on("close", (code: number | null) => {
      onOutput(`[INFO] Dexter CLI exited with code ${code}`);
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
