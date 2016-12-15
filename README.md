# iobuffer

  [![NPM version][npm-image]][npm-url]
  [![build status][travis-image]][travis-url]
  [![Test coverage][codecov-image]][codecov-url]
  [![npm download][download-image]][download-url]

Read and write binary data in ArrayBuffers

## Installation

```
$ npm install iobuffer
```

## API
Complete [API documentation](http://image-js.github.io/iobuffer/)

## Usage exemple
```js
const io = new IOBuffer();
// Pointer offset is 0
io
    .writeChars('Hello world') // Written 11 chars, pointer offset now 11 (->15)
    .writeUint32(42)           // Written 32-bit int (default is little-endian), pointer offset now 15
    .setBigEndian()            // Switch to big-endian mode
    .writeUint32(24)           // Written another 32-bit int, but big-endian, pointer offset now 19
    .mark()                    // bookmark current pointer offset
    .skip(2)                   // Pointer offset now 21
    .writeBoolean(true)        // Write 0xff, pointer offset now 22
    .reset()                   // Go to bookmared pointer offset, pointer now 19
    .setLittleEndian()         // Go back to little endian mode
    .writeUint16(18)           // Write 16-bit unsigned integer in the previously skipped 2 bytes, pointer offset now 21
    .rewind()                  // Pointer offset now 0
    .getBuffer()               // Get a DataView or Buffer (in node.js) over the written part [0-21] of the internal Buffer
```

## License

  [MIT](./LICENSE)

[npm-image]: https://img.shields.io/npm/v/iobuffer.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/iobuffer
[travis-image]: https://img.shields.io/travis/image-js/iobuffer/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/image-js/iobuffer
[codecov-image]: https://img.shields.io/codecov/c/github/image-js/iobuffer.svg?style=flat-square
[codecov-url]: https://codecov.io/gh/image-js/iobuffer
[download-image]: https://img.shields.io/npm/dm/iobuffer.svg?style=flat-square
[download-url]: https://www.npmjs.com/package/iobuffer
