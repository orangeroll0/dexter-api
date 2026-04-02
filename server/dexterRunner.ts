export function runDexterCLI(query, onOutput, onFinish) {
  console.log("RUN:", ["bun", "run", "/app/dexter-jp/src/cli.ts", query]);

  const proc = spawn({
    cmd: ["bun", "run", "/app/dexter-jp/src/cli.ts", query],
    stdout: "pipe",
    stderr: "pipe",
  });

  console.log("PROCESS STARTED");

  let stdoutBuffer = "";
  let stderrBuffer = "";

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

  const timeout = setTimeout(() => {
    try { proc.kill(); } catch {}
    onFinish(false);
  }, 60000);

  (async () => {
    const exitCode = await proc.exited;
    clearTimeout(timeout);

    console.log("PROCESS EXIT:", exitCode);

    if (stdoutBuffer.length > 0) onOutput(stdoutBuffer);
    if (stderrBuffer.length > 0) onOutput("[stderr] " + stderrBuffer);

    onFinish(exitCode === 0);
  })();
}
