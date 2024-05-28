// @ts-check

import fs from "node:fs";
import zlib from "node:zlib";
import { minify_sync } from "terser";
import { globSync } from "glob";
import { Table } from "console-table-printer";

/**
 * @param {string} code
 * @returns
 */
function brotliSize(code) {
  return zlib.brotliCompressSync(code).byteLength;
}

/**
 * @param {string} code
 * @returns
 */
function gzipSize(code) {
  return zlib.gzipSync(code).byteLength;
}

/**
 * @typedef {"ok" | "danger" | "warn"} Status
 * @typedef {{ path: string, status: Status, raw: number, gzip: number, brotli: number}} Result
 * @typedef {{ glob: string, limit?: number, minify: boolean }} Options
 **/

/**
 *
 * @param {string} path
 * @param {{ limit: { danger: number, warning: number }, minify: boolean }} options
 * @returns {Result}
 */
function getSize(path, options) {
  let code = fs.readFileSync(path, "utf8");

  if (options.minify) {
    const minified = minify_sync(code);

    if (!minified.code) {
      throw new Error("could not minify");
    }

    code = minified.code;
  }

  const gzip = gzipSize(code);
  const brotli = brotliSize(code);

  return {
    path,
    gzip,
    brotli,
    raw: code.length,
    status:
      gzip > options.limit.danger
        ? "danger"
        : gzip > options.limit.warning
        ? "warn"
        : "ok",
  };
}

/**
 * @param {number} size
 * @returns {string}
 */
const toKB = (size) => `${(size / 1000).toFixed(2)}KB`;

const colorMap = {
  danger: "red",
  warn: "yellow",
  ok: "green",
};

/**
 *
 * @param {Result[]} results
 */
export function print(results) {
  if (results.length === 0) {
    return console.log("No matching files");
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

/**
 * @param {Options} options
 * @returns {Result[]}
 */
export function gauge({ glob, minify, limit = Infinity }) {
  const options = {
    minify,
    limit: {
      danger: limit * 1000,
      warning: limit * 1000 * 0.9,
    },
  };

  return globSync(glob).map((path) => getSize(path, options));
}
