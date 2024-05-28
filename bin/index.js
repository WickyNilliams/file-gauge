// @ts-check
import sizes from "../index.js";
import { parseArgs } from "node:util";
import { Table } from "console-table-printer";

const {
  values,
  positionals: [glob],
} = parseArgs({
  allowPositionals: true,
  options: {
    minify: {
      type: "boolean",
      short: "m",
    },
    limit: {
      type: "string",
      short: "l",
    },
  },
});

if (!glob) {
  throw new Error("input is required");
}

const limit = values.limit ? parseFloat(values.limit) : Infinity;
const minify = values.minify ?? false;

/**
 *
 * @param {number} size
 * @returns {string}
 */
function toKB(size) {
  return `${(size / 1000).toFixed(2)}KB`;
}

const colorMap = {
  danger: "red",
  warn: "yellow",
  ok: "green",
};

/**
 *
 * @param {import("../index").Result[]} results
 */
function print(results) {
  if (results.length === 0) {
    return console.log(`No matching files for: "${glob}"`);
  }

  const table = new Table();

  for (const result of results) {
    table.addRow(
      {
        File: result.path,
        Raw: toKB(result.raw),
        GZip: toKB(result.gzip),
        Brotli: toKB(result.brotli),
      },
      { color: colorMap[result.status] }
    );
  }

  table.printTable();
}

const results = sizes({ glob, limit, minify });
if (results.length) {
  print(results);
} else {
  console.log(`No files matched glob: "${glob}"`);
}
