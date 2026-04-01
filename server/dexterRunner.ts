import { spawn } from "child_process";
import path from "path";

export function runDexterCLI(
  query: string,
  onOutput: (o: string) => void,
  onClose: (ok: boolean) => void
) {
  const scriptPath = path.resolve("dexter-jp/src/cli.ts");

  const p = spawn("./node_modules/.bin/tsx", [scriptPath], {
    env: { ...process.env, QUERY: query }
  });

  p.stdout.on("data", (d) => {
    onOutput(d.toString());
  });

  p.stderr.on("data", (d) => {
    onOutput("[ERR] " + d.toString());
  });

  p.on("close", (code) => {
    onClose(code === 0);
  });

  p.on("error", (err) => {
    onOutput("[ERR] process error: " + err.message);
    onClose(false);
  });
}
