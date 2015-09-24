# iobuffer

  [![NPM version][npm-image]][npm-url]
  [![npm download][download-image]][download-url]

Read and write binary data in ArrayBuffers

## Installation

```
$ npm install iobuffer
```

## API

### Buffer

`InputBuffer` and `OutputBuffer` both inherit from `Buffer` which defines the following interface:

#### buffer

Reference to the internal `ArrayBuffer` object.

#### setBigEndian() / setLittleEndian()

Set the endianess for multi-byte values (default is little endian).

#### skip(n)

Move the pointer forward by `n` bytes.

#### seek(offset)

Move the pointer at the given offset.

#### mark()

Store the current pointer offset.

#### reset()

Move the pointer back to the last offset stored by `mark`.

#### rewind()

Move the pointer back to offset `0`.

### InputBuffer

#### new InputBuffer(data)

`data` can be an ArrayBuffer or any Typed Array (including Node.js' Buffer from v4).

#### Methods

Each method returns the value and moves the pointer forward by the number of read bytes.

* readInt8
* readUint8
* readInt16
* readUint16
* readInt32
* readUint32
* readFloat32
* readFloat64

## License

  [MIT](./LICENSE)

[npm-image]: https://img.shields.io/npm/v/iobuffer.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/iobuffer
[download-image]: https://img.shields.io/npm/dm/iobuffer.svg?style=flat-square
[download-url]: https://www.npmjs.com/package/iobuffer
