# `file-sizes`

A simple utility to get the sizes (gzip, brotli, minified) of files. It offers a CLI and a programmatic API.

## Installation

```bash
npm install file-sizes
```

## API

> [!IMPORTANT]
> Minification is only supported for JavaScript files

```javascript
const fileSizes = require("file-sizes");

const results = fileSizes({
  glob: "dist/**/*.js",
  minify: true, // whether to minify with terser
  limit: 5, // limit in kilobytes
});
```

## CLI

```bash
file-sizes "dist/**/*.js" --minify --limit=5
```

## License

MIT
