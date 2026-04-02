import { spawn } from "bun";

export function runDexterCLI(
  query: string,
  onOutput: (line: string) => void,
  onFinish: (success: boolean) => void
) {
  const proc = spawn({
    cmd: ["bun", "run", "dexter-jp/src/index.ts", query],
    stdout: "pipe",
    stderr: "pipe"
  });

  let stdoutBuffer = "";
  let stderrBuffer = "";

  // ---- STDOUT ----
  (async () => {
    for await (const chunk of proc.stdout) {
      const text = chunk.toString();
      stdoutBuffer += text;

      let lines = stdoutBuffer.split("\n");
      stdoutBuffer = lines.pop() || "";

      for (const line of lines) {
        onOutput(line);
      }
    }
  })();

  // ---- STDERR ----
  (async () => {
    for await (const chunk of proc.stderr) {
      const text = chunk.toString();
      stderrBuffer += text;

      let lines = stderrBuffer.split("\n");
      stderrBuffer = lines.pop() || "";

      for (const line of lines) {
        onOutput("[stderr] " + line);
      }
    }
  })();

  // ---- TIMEOUT ----
  const timeout = setTimeout(() => {
    try {
      proc.kill();
    } catch {}
    onFinish(false);
  }, 60000); // 60秒

  // ---- EXIT ----
  (async () => {
    const exitCode = await proc.exited;
    clearTimeout(timeout);

    // 残りのバッファを吐き出す
    if (stdoutBuffer.length > 0) onOutput(stdoutBuffer);
    if (stderrBuffer.length > 0) onOutput("[stderr] " + stderrBuffer);

    onFinish(exitCode === 0);
  })();
}
