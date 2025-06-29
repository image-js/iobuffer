import { decode, encode } from './text.ts';

const defaultByteLength = 1024 * 8;

const hostBigEndian = (() => {
  const array = new Uint8Array(4);
  const view = new Uint32Array(array.buffer);
  return !((view[0] = 1) & (array[0] as number));
})();

export type InputData = number | ArrayBufferLike | ArrayBufferView | IOBuffer;

const typedArrays = {
  int8: globalThis.Int8Array,
  uint8: globalThis.Uint8Array,
  int16: globalThis.Int16Array,
  uint16: globalThis.Uint16Array,
  int32: globalThis.Int32Array,
  uint32: globalThis.Uint32Array,
  uint64: globalThis.BigUint64Array,
  int64: globalThis.BigInt64Array,
  float32: globalThis.Float32Array,
  float64: globalThis.Float64Array,
};

type TypedArrays = typeof typedArrays;

export interface IOBufferOptions {
  /**
   * Ignore the first n bytes of the ArrayBuffer.
   */
  offset?: number;
}

export class IOBuffer {
  /**
   * Reference to the internal ArrayBuffer object.
   */
  public buffer: ArrayBufferLike;

  /**
   * Byte length of the internal ArrayBuffer.
   */
  public byteLength: number;

  /**
   * Byte offset of the internal ArrayBuffer.
   */
  public byteOffset: number;

  /**
   * Byte length of the internal ArrayBuffer.
   */
  public length: number;

  /**
   * The current offset of the buffer's pointer.
   */
  public offset: number;

  private lastWrittenByte: number;
  private littleEndian: boolean;

  private _data: DataView;
  private _mark: number;
  private _marks: number[];

  /**
   * Create a new IOBuffer.
   * @param data - The data to construct the IOBuffer with.
   * If data is a number, it will be the new buffer's length<br>
   * If data is `undefined`, the buffer will be initialized with a default length of 8Kb<br>
   * If data is an ArrayBuffer, SharedArrayBuffer, an ArrayBufferView (Typed Array), an IOBuffer instance,
   * or a Node.js Buffer, a view will be created over the underlying ArrayBuffer.
   * @param options - An object for the options.
   * @returns A new IOBuffer instance.
   */
  public constructor(
    data: InputData = defaultByteLength,
    options: IOBufferOptions = {},
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
   * Checks if the memory allocated to the buffer is sufficient to store more
   * bytes after the offset.
   * @param byteLength - The needed memory in bytes.
   * @returns `true` if there is sufficient space and `false` otherwise.
   */
  public available(byteLength = 1): boolean {
    return this.offset + byteLength <= this.length;
  }

  /**
   * Check if little-endian mode is used for reading and writing multi-byte
   * values.
   * @returns `true` if little-endian mode is used, `false` otherwise.
   */
  public isLittleEndian(): boolean {
    return this.littleEndian;
  }

  /**
   * Set little-endian mode for reading and writing multi-byte values.
   * @returns This.
   */
  public setLittleEndian(): this {
    this.littleEndian = true;
    return this;
  }

  /**
   * Check if big-endian mode is used for reading and writing multi-byte values.
   * @returns `true` if big-endian mode is used, `false` otherwise.
   */
  public isBigEndian(): boolean {
    return !this.littleEndian;
  }

  /**
   * Switches to big-endian mode for reading and writing multi-byte values.
   * @returns This.
   */
  public setBigEndian(): this {
    this.littleEndian = false;
    return this;
  }

  /**
   * Move the pointer n bytes forward.
   * @param n - Number of bytes to skip.
   * @returns This.
   */
  public skip(n = 1): this {
    this.offset += n;
    return this;
  }

  /**
   * Move the pointer n bytes backward.
   * @param n - Number of bytes to move back.
   * @returns This.
   */
  public back(n = 1): this {
    this.offset -= n;
    return this;
  }

  /**
   * Move the pointer to the given offset.
   * @param offset - The offset to move to.
   * @returns This.
   */
  public seek(offset: number): this {
    this.offset = offset;
    return this;
  }

  /**
   * Store the current pointer offset.
   * @see {@link IOBuffer#reset}
   * @returns This.
   */
  public mark(): this {
    this._mark = this.offset;
    return this;
  }

  /**
   * Move the pointer back to the last pointer offset set by mark.
   * @see {@link IOBuffer#mark}
   * @returns This.
   */
  public reset(): this {
    this.offset = this._mark;
    return this;
  }

  /**
   * Push the current pointer offset to the mark stack.
   * @see {@link IOBuffer#popMark}
   * @returns This.
   */
  public pushMark(): this {
    this._marks.push(this.offset);
    return this;
  }

  /**
   * Pop the last pointer offset from the mark stack, and set the current
   * pointer offset to the popped value.
   * @see {@link IOBuffer#pushMark}
   * @returns This.
   */
  public popMark(): this {
    const offset = this._marks.pop();
    if (offset === undefined) {
      throw new Error('Mark stack empty');
    }
    this.seek(offset);
    return this;
  }

  /**
   * Move the pointer offset back to 0.
   * @returns This.
   */
  public rewind(): this {
    this.offset = 0;
    return this;
  }

  /**
   * Make sure the buffer has sufficient memory to write a given byteLength at
   * the current pointer offset.
   * If the buffer's memory is insufficient, this method will create a new
   * buffer (a copy) with a length that is twice (byteLength + current offset).
   * @param byteLength - The needed memory in bytes.
   * @returns This.
   */
  public ensureAvailable(byteLength = 1): this {
    if (!this.available(byteLength)) {
      const lengthNeeded = this.offset + byteLength;
      const newLength = lengthNeeded * 2;
      const newArray = new Uint8Array(newLength);
      newArray.set(new Uint8Array(this.buffer));
      this.buffer = newArray.buffer;
      this.length = newLength;
      this.byteLength = newLength;
      this._data = new DataView(this.buffer);
    }
    return this;
  }

  /**
   * Read a byte and return false if the byte's value is 0, or true otherwise.
   * Moves pointer forward by one byte.
   * @returns The read boolean.
   */
  public readBoolean(): boolean {
    return this.readUint8() !== 0;
  }

  /**
   * Read a signed 8-bit integer and move pointer forward by 1 byte.
   * @returns The read byte.
   */
  public readInt8(): number {
    return this._data.getInt8(this.offset++);
  }

  /**
   * Read an unsigned 8-bit integer and move pointer forward by 1 byte.
   * @returns The read byte.
   */
  public readUint8(): number {
    return this._data.getUint8(this.offset++);
  }

  /**
   * Alias for {@link IOBuffer#readUint8}.
   * @returns The read byte.
   */
  public readByte(): number {
    return this.readUint8();
  }

  /**
   * Read `n` bytes and move pointer forward by `n` bytes.
   * @param n - Number of bytes to read.
   * @returns The read bytes.
   */
  public readBytes(n = 1): Uint8Array {
    return this.readArray(n, 'uint8');
  }

  /**
   * Creates an array of corresponding to the type `type` and size `size`.
   * For example type `uint8` will create a `Uint8Array`.
   * @param size - size of the resulting array
   * @param type - number type of elements to read
   * @returns The read array.
   */
  public readArray<T extends keyof typeof typedArrays>(
    size: number,
    type: T,
  ): InstanceType<TypedArrays[T]> {
    const bytes = typedArrays[type].BYTES_PER_ELEMENT * size;
    const offset = this.byteOffset + this.offset;
    const slice = this.buffer.slice(offset, offset + bytes);
    if (
      this.littleEndian === hostBigEndian &&
      type !== 'uint8' &&
      type !== 'int8'
    ) {
      const slice = new Uint8Array(this.buffer.slice(offset, offset + bytes));
      slice.reverse();
      const returnArray = new typedArrays[type](slice.buffer);
      this.offset += bytes;
      returnArray.reverse();
      return returnArray as InstanceType<TypedArrays[T]>;
    }
    const returnArray = new typedArrays[type](slice);
    this.offset += bytes;
    return returnArray as InstanceType<TypedArrays[T]>;
  }

  /**
   * Read a 16-bit signed integer and move pointer forward by 2 bytes.
   * @returns The read value.
   */
  public readInt16(): number {
    const value = this._data.getInt16(this.offset, this.littleEndian);
    this.offset += 2;
    return value;
  }

  /**
   * Read a 16-bit unsigned integer and move pointer forward by 2 bytes.
   * @returns The read value.
   */
  public readUint16(): number {
    const value = this._data.getUint16(this.offset, this.littleEndian);
    this.offset += 2;
    return value;
  }

  /**
   * Read a 32-bit signed integer and move pointer forward by 4 bytes.
   * @returns The read value.
   */
  public readInt32(): number {
    const value = this._data.getInt32(this.offset, this.littleEndian);
    this.offset += 4;
    return value;
  }

  /**
   * Read a 32-bit unsigned integer and move pointer forward by 4 bytes.
   * @returns The read value.
   */
  public readUint32(): number {
    const value = this._data.getUint32(this.offset, this.littleEndian);
    this.offset += 4;
    return value;
  }

  /**
   * Read a 32-bit floating number and move pointer forward by 4 bytes.
   * @returns The read value.
   */
  public readFloat32(): number {
    const value = this._data.getFloat32(this.offset, this.littleEndian);
    this.offset += 4;
    return value;
  }

  /**
   * Read a 64-bit floating number and move pointer forward by 8 bytes.
   * @returns The read value.
   */
  public readFloat64(): number {
    const value = this._data.getFloat64(this.offset, this.littleEndian);
    this.offset += 8;
    return value;
  }

  /**
   * Read a 64-bit signed integer number and move pointer forward by 8 bytes.
   * @returns The read value.
   */
  public readBigInt64(): bigint {
    const value = this._data.getBigInt64(this.offset, this.littleEndian);
    this.offset += 8;
    return value;
  }

  /**
   * Read a 64-bit unsigned integer number and move pointer forward by 8 bytes.
   * @returns The read value.
   */
  public readBigUint64(): bigint {
    const value = this._data.getBigUint64(this.offset, this.littleEndian);
    this.offset += 8;
    return value;
  }

  /**
   * Read a 1-byte ASCII character and move pointer forward by 1 byte.
   * @returns The read character.
   */
  public readChar(): string {
    // eslint-disable-next-line unicorn/prefer-code-point
    return String.fromCharCode(this.readInt8());
  }

  /**
   * Read `n` 1-byte ASCII characters and move pointer forward by `n` bytes.
   * @param n - Number of characters to read.
   * @returns The read characters.
   */
  public readChars(n = 1): string {
    let result = '';
    for (let i = 0; i < n; i++) {
      result += this.readChar();
    }
    return result;
  }

  /**
   * Read the next `n` bytes, return a UTF-8 decoded string and move pointer
   * forward by `n` bytes.
   * @param n - Number of bytes to read.
   * @returns The decoded string.
   */
  public readUtf8(n = 1): string {
    return decode(this.readBytes(n));
  }

  /**
   * Read the next `n` bytes, return a string decoded with `encoding` and move pointer
   * forward by `n` bytes.
   * If no encoding is passed, the function is equivalent to @see {@link IOBuffer#readUtf8}
   * @param n - Number of bytes to read.
   * @param encoding - The encoding to use. Default is 'utf8'.
   * @returns The decoded string.
   */
  public decodeText(n = 1, encoding = 'utf8'): string {
    return decode(this.readBytes(n), encoding);
  }

  /**
   * Write 0xff if the passed value is truthy, 0x00 otherwise and move pointer
   * forward by 1 byte.
   * @param value - The value to write.
   * @returns This.
   */
  public writeBoolean(value: unknown): this {
    this.writeUint8(value ? 0xff : 0x00);
    return this;
  }

  /**
   * Write `value` as an 8-bit signed integer and move pointer forward by 1 byte.
   * @param value - The value to write.
   * @returns This.
   */
  public writeInt8(value: number): this {
    this.ensureAvailable(1);
    this._data.setInt8(this.offset++, value);
    this._updateLastWrittenByte();
    return this;
  }

  /**
   * Write `value` as an 8-bit unsigned integer and move pointer forward by 1
   * byte.
   * @param value - The value to write.
   * @returns This.
   */
  public writeUint8(value: number): this {
    this.ensureAvailable(1);
    this._data.setUint8(this.offset++, value);
    this._updateLastWrittenByte();
    return this;
  }

  /**
   * An alias for {@link IOBuffer#writeUint8}.
   * @param value - The value to write.
   * @returns This.
   */
  public writeByte(value: number): this {
    return this.writeUint8(value);
  }

  /**
   * Write all elements of `bytes` as uint8 values and move pointer forward by
   * `bytes.length` bytes.
   * @param bytes - The array of bytes to write.
   * @returns This.
   */
  public writeBytes(bytes: ArrayLike<number>): this {
    this.ensureAvailable(bytes.length);
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < bytes.length; i++) {
      this._data.setUint8(this.offset++, bytes[i] as number);
    }
    this._updateLastWrittenByte();
    return this;
  }

  /**
   * Write `value` as a 16-bit signed integer and move pointer forward by 2
   * bytes.
   * @param value - The value to write.
   * @returns This.
   */
  public writeInt16(value: number): this {
    this.ensureAvailable(2);
    this._data.setInt16(this.offset, value, this.littleEndian);
    this.offset += 2;
    this._updateLastWrittenByte();
    return this;
  }

  /**
   * Write `value` as a 16-bit unsigned integer and move pointer forward by 2
   * bytes.
   * @param value - The value to write.
   * @returns This.
   */
  public writeUint16(value: number): this {
    this.ensureAvailable(2);
    this._data.setUint16(this.offset, value, this.littleEndian);
    this.offset += 2;
    this._updateLastWrittenByte();
    return this;
  }

  /**
   * Write `value` as a 32-bit signed integer and move pointer forward by 4
   * bytes.
   * @param value - The value to write.
   * @returns This.
   */
  public writeInt32(value: number): this {
    this.ensureAvailable(4);
    this._data.setInt32(this.offset, value, this.littleEndian);
    this.offset += 4;
    this._updateLastWrittenByte();
    return this;
  }

  /**
   * Write `value` as a 32-bit unsigned integer and move pointer forward by 4
   * bytes.
   * @param value - The value to write.
   * @returns This.
   */
  public writeUint32(value: number): this {
    this.ensureAvailable(4);
    this._data.setUint32(this.offset, value, this.littleEndian);
    this.offset += 4;
    this._updateLastWrittenByte();
    return this;
  }

  /**
   * Write `value` as a 32-bit floating number and move pointer forward by 4
   * bytes.
   * @param value - The value to write.
   * @returns This.
   */
  public writeFloat32(value: number): this {
    this.ensureAvailable(4);
    this._data.setFloat32(this.offset, value, this.littleEndian);
    this.offset += 4;
    this._updateLastWrittenByte();
    return this;
  }

  /**
   * Write `value` as a 64-bit floating number and move pointer forward by 8
   * bytes.
   * @param value - The value to write.
   * @returns This.
   */
  public writeFloat64(value: number): this {
    this.ensureAvailable(8);
    this._data.setFloat64(this.offset, value, this.littleEndian);
    this.offset += 8;
    this._updateLastWrittenByte();
    return this;
  }

  /**
   * Write `value` as a 64-bit signed bigint and move pointer forward by 8
   * bytes.
   * @param value - The value to write.
   * @returns This.
   */
  public writeBigInt64(value: bigint): this {
    this.ensureAvailable(8);
    this._data.setBigInt64(this.offset, value, this.littleEndian);
    this.offset += 8;
    this._updateLastWrittenByte();
    return this;
  }

  /**
   * Write `value` as a 64-bit unsigned bigint and move pointer forward by 8
   * bytes.
   * @param value - The value to write.
   * @returns This.
   */
  public writeBigUint64(value: bigint): this {
    this.ensureAvailable(8);
    this._data.setBigUint64(this.offset, value, this.littleEndian);
    this.offset += 8;
    this._updateLastWrittenByte();
    return this;
  }

  /**
   * Write the charCode of `str`'s first character as an 8-bit unsigned integer
   * and move pointer forward by 1 byte.
   * @param str - The character to write.
   * @returns This.
   */
  public writeChar(str: string): this {
    // eslint-disable-next-line unicorn/prefer-code-point
    return this.writeUint8(str.charCodeAt(0));
  }

  /**
   * Write the charCodes of all `str`'s characters as 8-bit unsigned integers
   * and move pointer forward by `str.length` bytes.
   * @param str - The characters to write.
   * @returns This.
   */
  public writeChars(str: string): this {
    for (let i = 0; i < str.length; i++) {
      // eslint-disable-next-line unicorn/prefer-code-point
      this.writeUint8(str.charCodeAt(i));
    }
    return this;
  }

  /**
   * UTF-8 encode and write `str` to the current pointer offset and move pointer
   * forward according to the encoded length.
   * @param str - The string to write.
   * @returns This.
   */
  public writeUtf8(str: string): this {
    return this.writeBytes(encode(str));
  }

  /**
   * Export a Uint8Array view of the internal buffer.
   * The view starts at the byte offset and its length
   * is calculated to stop at the last written byte or the original length.
   * @returns A new Uint8Array view.
   */
  public toArray(): Uint8Array {
    return new Uint8Array(this.buffer, this.byteOffset, this.lastWrittenByte);
  }

  /**
   *  Get the total number of bytes written so far, regardless of the current offset.
   * @returns - Total number of bytes.
   */
  public getWrittenByteLength() {
    return this.lastWrittenByte - this.byteOffset;
  }

  /**
   * Update the last written byte offset
   * @private
   */
  private _updateLastWrittenByte(): void {
    if (this.offset > this.lastWrittenByte) {
      this.lastWrittenByte = this.offset;
    }
  }
}
