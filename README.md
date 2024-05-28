# `file-gauge`

A simple utility to get the sizes (gzip, brotli, minified) of files. It offers a CLI and a programmatic API.

## Installation

```bash
npm install file-gauge
```

## API

> [!IMPORTANT]
> Minification is only supported for JavaScript files

```javascript
import { gauge, print } from "file-gauge";

const results = gauge({
  glob: "dist/**/*.js",
  minify: true, // whether to minify with terser
  limit: 5, // limit in kilobytes
});

print(results);
```

## CLI

```bash
file-gauge "dist/**/*.js" --minify --limit=5
```

Example output:

```sh
┌──────────────────┬─────────┬─────────┬─────────┐
│             File │     Raw │    GZip │  Brotli │
├──────────────────┼─────────┼─────────┼─────────┤
│     transform.js │  5.64KB │  1.21KB │  1.06KB │
│     sourcemap.js │  1.19KB │  0.57KB │  0.51KB │
│          size.js │  7.99KB │  1.86KB │  1.66KB │
│         scope.js │ 15.97KB │  4.77KB │  4.37KB │
│    propmangle.js │  5.79KB │  1.85KB │  1.70KB │
│         parse.js │ 57.70KB │ 18.00KB │ 15.00KB │
│        output.js │ 34.04KB │  9.29KB │  8.48KB │
│   mozilla-ast.js │ 26.95KB │  6.14KB │  5.58KB │
│        minify.js │  7.27KB │  2.69KB │  2.42KB │
│ equivalent-to.js │  6.30KB │  1.38KB │  1.19KB │
│           cli.js │  8.70KB │  3.56KB │  3.18KB │
│           ast.js │ 58.60KB │ 10.82KB │  9.34KB │
└──────────────────┴─────────┴─────────┴─────────┘
```

## License

MIT
