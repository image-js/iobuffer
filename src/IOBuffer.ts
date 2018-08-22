import { decode, encode } from 'utf8';

const defaultByteLength = 1024 * 8;
const charArray: string[] = [];

type InputData = number | ArrayBufferLike | ArrayBufferView | IOBuffer | Buffer;

interface IOBufferOptions {
  offset?: number;
}

/**
 * IOBuffer
 * @constructor
 * @param {number|ArrayBufferLike|ArrayBufferView|IOBuffer|Buffer} [data] - The data to construct the IOBuffer with.
 *
 * If data is a number, it will be the new buffer's length<br>
 * If data is `undefined`, the buffer will be initialized with a default length of 8Kb<br>
 * If data is an ArrayBuffer, SharedArrayBuffer, an ArrayBufferView (Typed Array), an IOBuffer instance,
 * or a Node.js Buffer, a view will be created over the underlying ArrayBuffer.
 * @param {object} [options]
 * @param {number} [options.offset=0] - Ignore the first n bytes of the ArrayBuffer
 * @property {ArrayBuffer} buffer - Reference to the internal ArrayBuffer object
 * @property {number} length - Byte length of the internal ArrayBuffer
 * @property {number} offset - The current offset of the buffer's pointer
 * @property {number} byteLength - Byte length of the internal ArrayBuffer
 * @property {number} byteOffset - Byte offset of the internal ArrayBuffer
 */
export class IOBuffer {
  public buffer: ArrayBufferLike;
  public byteLength: number;
  public byteOffset: number;
  public lastWrittenByte: number;
  public length: number;
  public littleEndian: boolean;
  public offset: number;

  private _data: DataView;
  private _mark: number;
  private _marks: number[];

  constructor(
    data: InputData = defaultByteLength,
    options: IOBufferOptions = {}
  ) {
    let dataIsGiven = false;
    if (typeof data === 'number') {
      data = new ArrayBuffer(data);
    } else {
      dataIsGiven = true;
      this.lastWrittenByte = data.byteLength;
    }

    const offset = options.offset ? options.offset >>> 0 : 0;
    const byteLength = data.byteLength - offset;
    let dvOffset = offset;
    if (ArrayBuffer.isView(data) || data instanceof IOBuffer) {
      if (data.byteLength !== data.buffer.byteLength) {
        dvOffset = data.byteOffset + offset;
      }
      data = data.buffer;
    }
    if (dataIsGiven) {
      this.lastWrittenByte = byteLength;
    } else {
      this.lastWrittenByte = 0;
    }
    this.buffer = data;
    this.length = byteLength;
    this.byteLength = byteLength;
    this.byteOffset = dvOffset;
    this.offset = 0;
    this.littleEndian = true;
    this._data = new DataView(this.buffer, dvOffset, byteLength);
    this._mark = 0;
    this._marks = [];
  }

  /**
   * Checks if the memory allocated to the buffer is sufficient to store more bytes after the offset
   * @param {number} [byteLength=1] The needed memory in bytes
   * @return {boolean} Returns true if there is sufficient space and false otherwise
   */
  public available(byteLength: number = 1): boolean {
    return this.offset + byteLength <= this.length;
  }

  /**
   * Check if little-endian mode is used for reading and writing multi-byte values
   * @return {boolean} Returns true if little-endian mode is used, false otherwise
   */
  public isLittleEndian(): boolean {
    return this.littleEndian;
  }

  /**
   * Set little-endian mode for reading and writing multi-byte values
   * @return {IOBuffer}
   */
  public setLittleEndian(): IOBuffer {
    this.littleEndian = true;
    return this;
  }

  /**
   * Check if big-endian mode is used for reading and writing multi-byte values
   * @return {boolean} Returns true if big-endian mode is used, false otherwise
   */
  public isBigEndian(): boolean {
    return !this.littleEndian;
  }

  /**
   * Switches to big-endian mode for reading and writing multi-byte values
   * @return {IOBuffer}
   */
  public setBigEndian(): IOBuffer {
    this.littleEndian = false;
    return this;
  }

  /**
   * Move the pointer n bytes forward
   * @param {number} n
   * @return {IOBuffer}
   */
  public skip(n: number = 1): IOBuffer {
    this.offset += n;
    return this;
  }

  /**
   * Move the pointer to the given offset
   * @param {number} offset
   * @return {IOBuffer}
   */
  public seek(offset: number): IOBuffer {
    this.offset = offset;
    return this;
  }

  /**
   * Store the current pointer offset.
   * @see {@link IOBuffer#reset}
   * @return {IOBuffer}
   */
  public mark(): IOBuffer {
    this._mark = this.offset;
    return this;
  }

  /**
   * Move the pointer back to the last pointer offset set by mark
   * @see {@link IOBuffer#mark}
   * @return {IOBuffer}
   */
  public reset(): IOBuffer {
    this.offset = this._mark;
    return this;
  }

  /**
   * Push the current pointer offset to the mark stack
   * @see {@link IOBuffer#popMark}
   * @return {IOBuffer}
   */
  public pushMark(): IOBuffer {
    this._marks.push(this.offset);
    return this;
  }

  /**
   * Pop the last pointer offset from the mark stack, and set the current pointer offset to the popped value
   * @see {@link IOBuffer#pushMark}
   * @return {IOBuffer}
   */
  public popMark(): IOBuffer {
    const offset = this._marks.pop();
    if (offset === undefined) {
      throw new Error('Mark stack empty');
    }
    this.seek(offset);
    return this;
  }

  /**
   * Move the pointer offset back to 0
   * @return {IOBuffer}
   */
  public rewind(): IOBuffer {
    this.offset = 0;
    return this;
  }

  /**
   * Make sure the buffer has sufficient memory to write a given byteLength at the current pointer offset
   * If the buffer's memory is insufficient, this method will create a new buffer (a copy) with a length
   * that is twice (byteLength + current offset)
   * @param {number} [byteLength = 1]
   * @return {IOBuffer}
   */
  public ensureAvailable(byteLength: number = 1): IOBuffer {
    if (!this.available(byteLength)) {
      const lengthNeeded = this.offset + byteLength;
      const newLength = lengthNeeded * 2;
      const newArray = new Uint8Array(newLength);
      newArray.set(new Uint8Array(this.buffer));
      this.buffer = newArray.buffer;
      this.length = this.byteLength = newLength;
      this._data = new DataView(this.buffer);
    }
    return this;
  }

  /**
   * Read a byte and return false if the byte's value is 0, or true otherwise
   * Moves pointer forward
   * @return {boolean}
   */
  public readBoolean(): boolean {
    return this.readUint8() !== 0;
  }

  /**
   * Read a signed 8-bit integer and move pointer forward
   * @return {number}
   */
  public readInt8(): number {
    return this._data.getInt8(this.offset++);
  }

  /**
   * Read an unsigned 8-bit integer and move pointer forward
   * @return {number}
   */
  public readUint8(): number {
    return this._data.getUint8(this.offset++);
  }

  /**
   * Alias for {@link IOBuffer#readUint8}
   * @return {number}
   */
  public readByte(): number {
    return this.readUint8();
  }

  /**
   * Read n bytes and move pointer forward.
   * @param {number} n
   * @return {Uint8Array}
   */
  public readBytes(n: number = 1): Uint8Array {
    const bytes = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      bytes[i] = this.readByte();
    }
    return bytes;
  }

  /**
   * Read a 16-bit signed integer and move pointer forward
   * @return {number}
   */
  public readInt16(): number {
    const value = this._data.getInt16(this.offset, this.littleEndian);
    this.offset += 2;
    return value;
  }

  /**
   * Read a 16-bit unsigned integer and move pointer forward
   * @return {number}
   */
  public readUint16(): number {
    const value = this._data.getUint16(this.offset, this.littleEndian);
    this.offset += 2;
    return value;
  }

  /**
   * Read a 32-bit signed integer and move pointer forward
   * @return {number}
   */
  public readInt32(): number {
    const value = this._data.getInt32(this.offset, this.littleEndian);
    this.offset += 4;
    return value;
  }

  /**
   * Read a 32-bit unsigned integer and move pointer forward
   * @return {number}
   */
  public readUint32(): number {
    const value = this._data.getUint32(this.offset, this.littleEndian);
    this.offset += 4;
    return value;
  }

  /**
   * Read a 32-bit floating number and move pointer forward
   * @return {number}
   */
  public readFloat32(): number {
    const value = this._data.getFloat32(this.offset, this.littleEndian);
    this.offset += 4;
    return value;
  }

  /**
   * Read a 64-bit floating number and move pointer forward
   * @return {number}
   */
  public readFloat64(): number {
    const value = this._data.getFloat64(this.offset, this.littleEndian);
    this.offset += 8;
    return value;
  }

  /**
   * Read 1-byte ascii character and move pointer forward
   * @return {string}
   */
  public readChar(): string {
    return String.fromCharCode(this.readInt8());
  }

  /**
   * Read n 1-byte ascii characters and move pointer forward
   * @param {number} n
   * @return {string}
   */
  public readChars(n: number = 1): string {
    charArray.length = n;
    for (let i = 0; i < n; i++) {
      charArray[i] = this.readChar();
    }
    return charArray.join('');
  }

  /**
   * Read the next n bytes, return a UTF-8 decoded string and move pointer forward
   * @param {number} n
   * @return {string}
   */
  public readUtf8(n: number = 1): string {
    const bString = this.readChars(n);
    return decode(bString);
  }

  /**
   * Write 0xff if the passed value is truthy, 0x00 otherwise
   * @param {any} value
   * @return {IOBuffer}
   */
  public writeBoolean(value: any): IOBuffer {
    this.writeUint8(value ? 0xff : 0x00);
    return this;
  }

  /**
   * Write value as an 8-bit signed integer
   * @param {number} value
   * @return {IOBuffer}
   */
  public writeInt8(value: number): IOBuffer {
    this.ensureAvailable(1);
    this._data.setInt8(this.offset++, value);
    this._updateLastWrittenByte();
    return this;
  }

  /**
   * Write value as a 8-bit unsigned integer
   * @param {number} value
   * @return {IOBuffer}
   */
  public writeUint8(value: number): IOBuffer {
    this.ensureAvailable(1);
    this._data.setUint8(this.offset++, value);
    this._updateLastWrittenByte();
    return this;
  }

  /**
   * An alias for {@link IOBuffer#writeUint8}
   * @param {number} value
   * @return {IOBuffer}
   */
  public writeByte(value: number): IOBuffer {
    return this.writeUint8(value);
  }

  /**
   * Write bytes
   * @param {ArrayLike<number>} bytes
   * @return {IOBuffer}
   */
  public writeBytes(bytes: ArrayLike<number>): IOBuffer {
    this.ensureAvailable(bytes.length);
    // tslint:disable-next-line prefer-for-of
    for (let i = 0; i < bytes.length; i++) {
      this._data.setUint8(this.offset++, bytes[i]);
    }
    this._updateLastWrittenByte();
    return this;
  }

  /**
   * Write value as an 16-bit signed integer
   * @param {number} value
   * @return {IOBuffer}
   */
  public writeInt16(value: number): IOBuffer {
    this.ensureAvailable(2);
    this._data.setInt16(this.offset, value, this.littleEndian);
    this.offset += 2;
    this._updateLastWrittenByte();
    return this;
  }

  /**
   * Write value as a 16-bit unsigned integer
   * @param {number} value
   * @return {IOBuffer}
   */
  public writeUint16(value: number): IOBuffer {
    this.ensureAvailable(2);
    this._data.setUint16(this.offset, value, this.littleEndian);
    this.offset += 2;
    this._updateLastWrittenByte();
    return this;
  }

  /**
   * Write a 32-bit signed integer at the current pointer offset
   * @param {number} value
   * @return {IOBuffer}
   */
  public writeInt32(value: number): IOBuffer {
    this.ensureAvailable(4);
    this._data.setInt32(this.offset, value, this.littleEndian);
    this.offset += 4;
    this._updateLastWrittenByte();
    return this;
  }

  /**
   * Write a 32-bit unsigned integer at the current pointer offset
   * @param {number} value - The value to set
   * @return {IOBuffer}
   */
  public writeUint32(value: number): IOBuffer {
    this.ensureAvailable(4);
    this._data.setUint32(this.offset, value, this.littleEndian);
    this.offset += 4;
    this._updateLastWrittenByte();
    return this;
  }

  /**
   * Write a 32-bit floating number at the current pointer offset
   * @param {number} value - The value to set
   * @return {IOBuffer}
   */
  public writeFloat32(value: number): IOBuffer {
    this.ensureAvailable(4);
    this._data.setFloat32(this.offset, value, this.littleEndian);
    this.offset += 4;
    this._updateLastWrittenByte();
    return this;
  }

  /**
   * Write a 64-bit floating number at the current pointer offset
   * @param {number} value
   * @return {IOBuffer}
   */
  public writeFloat64(value: number): IOBuffer {
    this.ensureAvailable(8);
    this._data.setFloat64(this.offset, value, this.littleEndian);
    this.offset += 8;
    this._updateLastWrittenByte();
    return this;
  }

  /**
   * Write the charCode of the passed string's first character to the current pointer offset
   * @param {string} str - The character to set
   * @return {IOBuffer}
   */
  public writeChar(str: string): IOBuffer {
    return this.writeUint8(str.charCodeAt(0));
  }

  /**
   * Write the charCodes of the passed string's characters to the current pointer offset
   * @param {string} str
   * @return {IOBuffer}
   */
  public writeChars(str: string): IOBuffer {
    for (let i = 0; i < str.length; i++) {
      this.writeUint8(str.charCodeAt(i));
    }
    return this;
  }

  /**
   * UTF-8 encode and write the passed string to the current pointer offset
   * @param {string} str
   * @return {IOBuffer}
   */
  public writeUtf8(str: string): IOBuffer {
    const bString = encode(str);
    return this.writeChars(bString);
  }

  /**
   * Export a Uint8Array view of the internal buffer.
   * The view starts at the byte offset and its length
   * is calculated to stop at the last written byte or the original length.
   * @return {Uint8Array}
   */
  public toArray(): Uint8Array {
    return new Uint8Array(this.buffer, this.byteOffset, this.lastWrittenByte);
  }

  /**
   * Update the last written byte offset
   * @private
   */
  private _updateLastWrittenByte() {
    if (this.offset > this.lastWrittenByte) {
      this.lastWrittenByte = this.offset;
    }
  }
}
