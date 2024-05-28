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
  },
});

if (!glob) {
  console.error('Glob pattern required. Usage:\n\nfile-gauge "*.js"');
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
