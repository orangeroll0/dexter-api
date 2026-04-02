export const runDexterCLI = async (query: string) => {
  console.log(`[dexterRunner] Starting with query: "${query}"`);

  try {
    const proc = Bun.spawn(["bun", "tsx", "src/cli.ts", query], {
      cwd: "/app/dexter-jp",
      env: {
        ...process.env,
        TERM: "dumb",        // Ink TUI対策（重要）
        FORCE_COLOR: "0",    // 色出力を無効化
        CI: "true",          // CI/非対話環境であることを伝える
        NODE_ENV: "production",
      },
      stdout: "pipe",
      stderr: "pipe",
    });

    console.log(`[dexterRunner] Process started (PID: ${proc.pid})`);

    let output = "";
    let stderrOutput = "";

    // stdout をすべて受け取る
    for await (const chunk of proc.stdout) {
      const text = new TextDecoder().decode(chunk);
      output += text;
      console.log("[dexter stdout]", text.trim());
    }

    // stderr もログに出す（エラー診断用）
    for await (const chunk of proc.stderr) {
      const text = new TextDecoder().decode(chunk);
      stderrOutput += text;
      console.error("[dexter stderr]", text.trim());
    }

    const exitCode = await proc.exited;
    console.log(`[dexterRunner] Process exited with code: ${exitCode}`);

    if (exitCode !== 0) {
      console.error(`[dexterRunner] CLI failed with code ${exitCode}`);
    }

    return {
      output: output.trim(),
      error: exitCode !== 0 ? stderrOutput.trim() : undefined,
    };

  } catch (err: any) {
    console.error("[dexterRunner] Spawn error:", err.message);
    return {
      output: "",
      error: `Failed to start dexter-jp: ${err.message}`,
    };
  }
};
