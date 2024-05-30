#!/usr/bin/env node

// @ts-check
import { gauge, print } from "../index.js";
import { parseArgs } from "node:util";

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
    ignore: {
      type: "string",
      short: "i",
    },
    help: {
      type: "boolean",
      short: "h",
    },
  },
});

const text = `Usage: file-gauge "**/*.js"

Print raw/min/gzip sizes of files matching the glob

  -i, --ignore   A glob pattern of files to ignore
  -l, --limit    A KB file limit. Files appear red if exceeding this, or yellow if within 10% of this
  -m, --minify   Minify the files before min/brotli. Only works with JavaScript files
  -h, --help     Print help
`;

if (values.help) {
  console.log(text);
  process.exit();
}

if (!glob) {
  console.error(`Glob pattern required. See --help`);
  process.exit(1);
}

print(
  gauge({
    glob,
    limit: values.limit ? parseFloat(values.limit) : Infinity,
    minify: values.minify ?? false,
    ignore: values.ignore,
  })
);
