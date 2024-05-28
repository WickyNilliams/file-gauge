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
const gauge = require("file-gauge");

const results = gauge({
  glob: "dist/**/*.js",
  minify: true, // whether to minify with terser
  limit: 5, // limit in kilobytes
});
```

## CLI

```bash
file-gauge "dist/**/*.js" --minify --limit=5
```

## License

MIT
