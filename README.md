# iobuffer

  [![NPM version][npm-image]][npm-url]
  [![build status][travis-image]][travis-url]
  [![Test coverage][coveralls-image]][coveralls-url]
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
    .writeChars('Hello world') // Written 11 chars, pointer offset now 11
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
    .toArray()                 // Create a DataView of the internal Buffer that ranges over the written buffer [0-21]
    
    
```
### IOBuffer

#### new IOBuffer(data)

`data` can be an ArrayBuffer or any Typed Array (including Node.js' Buffer from v4).

#### buffer

Reference to the internal `ArrayBuffer` object.

#### length

Byte length of the internal `ArrayBuffer` object.

#### available(byteLength = 1)

Returns `true` if there are enough bytes between the current offset and the buffer's end, false otherwise.

#### setBigEndian() / setLittleEndian()

Set the endianess for multi-byte values (default is little endian).

#### isBigEndian() / isLittleEndian()

Returns a boolean indicating if current endianess matches.

#### littleEndian

`true` if current endianess is little endian, `false` if it is big endian.

#### offset

Value of the current pointer offset.

#### skip(n = 1)

Move the pointer forward by `n` bytes.

#### seek(offset)

Move the pointer at the given offset.

#### mark()

Store the current pointer offset.

#### reset()

Move the pointer back to the last offset stored by `mark`.

#### rewind()

Move the pointer back to offset `0`.

#### Read methods

Each method returns the value and moves the pointer forward by the number of read bytes.

* readBoolean
* readInt8
* readUint8 / readByte / readBytes(n)
* readInt16
* readUint16
* readInt32
* readUint32
* readFloat32
* readFloat64
* readChar / readChars(n)

## License

  [MIT](./LICENSE)

[npm-image]: https://img.shields.io/npm/v/iobuffer.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/iobuffer
[travis-image]: https://img.shields.io/travis/image-js/iobuffer/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/image-js/iobuffer
[coveralls-image]: https://img.shields.io/coveralls/image-js/iobuffer.svg?style=flat-square
[coveralls-url]: https://coveralls.io/github/image-js/iobuffer
[download-image]: https://img.shields.io/npm/dm/iobuffer.svg?style=flat-square
[download-url]: https://www.npmjs.com/package/iobuffer
