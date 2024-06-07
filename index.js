// @ts-check

import fs from "node:fs";
import { gzipSync, brotliCompressSync } from "node:zlib";
import { minify_sync } from "terser";
import { globSync } from "glob";
import { Table } from "console-table-printer";

const formatsInBytes = {
  KB: 1024,
  MB: 1048576,
  GB: 1073741824,
  TB: 1099511627776,
  PB: 1125899906842580
}

const byteFormats = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

/**
 * @param {number} bytes
 * @param {number} decimals
 * @returns {string}
 */
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return `0${byteFormats[0]}`
  if (decimals < 0) decimals = 0

  const i = Math.floor(Math.log(bytes) / Math.log(formatsInBytes.KB))

  return `${parseFloat((bytes / Math.pow(formatsInBytes.KB, i)).toFixed(decimals))}${byteFormats[i]}`
}

/**
 * @param {number} bytes
 * @param {Format} format
 * @returns {string}
 */
const toWantedFormat = (bytes, format = 'auto', decimals = 2) => format === 'auto' ? formatBytes(bytes, decimals) : `${(bytes / formatsInBytes[format]).toFixed(decimals)}${format}`;

/**
 * @param {string} code
 * @returns {number}
 */
const brotliSize = (code) => brotliCompressSync(code).byteLength;

/**
 * @param {string} code
 * @returns {number}
 */
const gzipSize = (code) => gzipSync(code).byteLength;

/**
 * @typedef {"ok" | "danger" | "warn"} Status
 * @typedef {"auto" | "B" | "KB" | "MB" | "GB" | "TB" | "PB" | undefined} Format
 * @typedef {{ format?: Format, decimals: number }} PrintOptions
 * @typedef {{ path: string, status: Status, raw: number, gzip: number, brotli: number}} Result
 * @typedef {{ glob: string, ignore?: string, limit?: number, minify: boolean }} Options
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

const colorMap = {
  danger: "red",
  warn: "yellow",
};

/**
 *
 * @param {Result[]} results
 * @param {PrintOptions} options
 */
export function print(results, options = { format: 'auto', decimals: 2}) {
  if (results.length === 0) {
    return console.log("No matching files");
  }

  const {format, decimals} = options
  const table = new Table();

  for (const result of results) {
    table.addRow(
      {
        File: result.path,
        Raw: toWantedFormat(result.raw, format, decimals),
        GZip: toWantedFormat(result.gzip, format, decimals),
        Brotli: toWantedFormat(result.brotli, format, decimals),
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
export function gauge({ glob, ignore, minify, limit = Infinity }) {
  const options = {
    minify,
    limit: {
      danger: limit * formatsInBytes.KB,
      warning: limit * formatsInBytes.KB * 0.9,
    },
  };

  return globSync(glob, { ignore }).map((path) => getSize(path, options));
}
