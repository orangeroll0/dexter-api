export const runDexter = async (query: string) => {
  console.log(`[dexterRunner] Starting CLI with query: "${query}"`);

  try {
    const proc = Bun.spawn(["bun", "tsx", "src/cli.ts", query], {
      cwd: "/app/dexter-jp",
      env: { ...process.env },
      stdout: "pipe",
      stderr: "pipe",
    });

    let output = "";
    let stderrOutput = "";

    for await (const chunk of proc.stdout) {
      const text = new TextDecoder().decode(chunk);
      output += text;
      console.log("[dexter stdout]", text.trim());
    }

    for await (const chunk of proc.stderr) {
      const text = new TextDecoder().decode(chunk);
      stderrOutput += text;
      console.error("[dexter stderr]", text.trim());
    }

    const exitCode = await proc.exited;
    console.log(`[dexterRunner] Process exited with code: ${exitCode}`);

    return {
      output: output.trim(),
      error: exitCode !== 0 ? stderrOutput.trim() : undefined
    };

  } catch (err: any) {
    console.error("[dexterRunner] Spawn error:", err.message);
    return { output: "", error: err.message };
  }
};
