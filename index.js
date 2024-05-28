// @ts-check

import fs from "node:fs";
import zlib from "node:zlib";
import { minify_sync } from "terser";
import { globSync } from "glob";

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
 * @param {Options} options
 * @returns {Result[]}
 */
export default function sizes({ glob, minify, limit = Infinity }) {
  const options = {
    minify,
    limit: {
      danger: limit * 1000,
      warning: limit * 1000 * 0.9,
    },
  };

  return globSync(glob).map((path) => getSize(path, options));
}
