// dexter-api/server/dexterRunner.ts
import { spawn } from "child_process";

export function runDexterCLI(
  query: string,
  onOutput: (o: string) => void,
  onDone: (ok: boolean) => void
) {
  try {
    onOutput("[INFO] Starting Bun process for dexter-jp...");

    const proc = spawn("bun", ["run", "gateway"], {
      cwd: "./dexter-jp",
      env: process.env
    });

    // 入力
    proc.stdin.write(query + "\n");
    proc.stdin.end();

    // stdout
    proc.stdout.on("data", (d) => {
      const lines = d.toString().split("\n").map(l => l.trim()).filter(Boolean);
      lines.forEach((l) => onOutput("[OUT] " + l));
    });

    // stderr
    proc.stderr.on("data", (d) => {
      const lines = d.toString().split("\n").map(l => l.trim()).filter(Boolean);
      lines.forEach((l) => onOutput("[ERR] " + l));
    });

    proc.on("close", (code) => {
      onOutput(`[INFO] Bun process exited with code ${code}`);
      onDone(code === 0);
    });

    proc.on("error", (err) => {
      onOutput("[ERR] Process error: " + err.message);
      onDone(false);
    });
  } catch (e: any) {
    onOutput("[ERR] spawn failed: " + e.message);
    onDone(false);
  }
}
