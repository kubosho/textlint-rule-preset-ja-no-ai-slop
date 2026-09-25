import { readdirSync, readFileSync } from "node:fs";

const directory = new URL("./fixtures/", import.meta.url);
const cases = readdirSync(directory)
  .filter((name) => name.endsWith(".json"))
  .sort()
  .flatMap((name) => JSON.parse(readFileSync(new URL(name, directory), "utf8")));

export { cases };
