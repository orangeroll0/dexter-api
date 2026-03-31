import { spawn } from "child_process";

function normalizeOutput(text: string): string[] {
  return text
    // ANSIエスケープ除去（標準パターン）
    .replace(/\x1b\[[0-9;]*[a-zA-Z]/g, "")
    // 改行正規化（CRLF/CR/LF対応）
    .replace(/\r\n|\r/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

export function runDexterCLI(
  query: string,
  onOutput: (line: string) => void,
  onDone: (success: boolean) => void
) {
  const proc = spawn("bun", ["run", "gateway"], {
    cwd: "./dexter-jp",
    env: process.env,
    stdio: ["pipe", "pipe", "pipe"], // 明示
  });

  // 入力（改行付与：CLI前提）
  proc.stdin.write(query + "\n");
  proc.stdin.end();

  proc.stdout.on("data", (d: Buffer) => {
    normalizeOutput(d.toString()).forEach(onOutput);
  });

  proc.stderr.on("data", (d: Buffer) => {
    normalizeOutput(d.toString()).forEach((l) => onOutput(`[ERR] ${l}`));
  });

  proc.on("error", (err) => {
    onOutput(`[PROC_ERROR] ${err.message}`);
    onDone(false);
  });

  proc.on("close", (code) => {
    onDone(code === 0);
  });
}