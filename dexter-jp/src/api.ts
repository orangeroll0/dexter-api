import { run } from "./gateway/run";

async function main() {
  const query = process.argv[2];
  if (!query) {
    console.error("No query provided");
    process.exit(1);
  }

  const result = await run(query);
  console.log(JSON.stringify(result));
}

main();
