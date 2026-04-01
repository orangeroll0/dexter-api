import { spawn } from "child_process";

function normalizeOutput(text: string): string[] {
  return text
    .replace(/\x1b\[[0-9;]*[A-Za-z]/g, "") // ANSIカラー除去
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export function runDexterCLI(
  query: string,
  onOutput: (o: string) => void,
  onDone: (ok: boolean) => void
) {
  try {
    const proc = spawn("bun", ["run", "gateway"], {
      cwd: "./dexter-jp",
      env: process.env
    });

    // 入力（改行を付与）
    proc.stdin.write(query + "\n");
    proc.stdin.end();

    // 標準出力
    proc.stdout.on("data", (d) => {
      normalizeOutput(d.toString()).forEach(onOutput);
    });

    // エラー出力
    proc.stderr.on("data", (d) => {
      normalizeOutput(d.toString()).forEach((l) =>
        onOutput("[ERR] " + l)
      );
    });

    // 終了
    proc.on("close", (code) => {
      onDone(code === 0);
    });

    // 起動エラー
    proc.on("error", (err) => {
      onOutput("[ERR] process error: " + err.message);
      onDone(false);
    });
  } catch (e: any) {
    onOutput("[ERR] spawn failed: " + e.message);
    onDone(false);
  }
}
