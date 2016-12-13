'use strict';

const defaultByteLength = 1024 * 8;
const charArray = [];

/**
 * IOBuffer
 * @constructor
 * @param {undefined|number|ArrayBuffer|TypedArray|IOBuffer} data - The data to construct the IOBuffer with.
 * If it's a number it will initialize the buffer with the number as the buffer's length
 * If it's undefined it will initialize the buffer with a default length of 8 Kb
 * If its an ArrayBuffer, a typed array or an IOBuffer instance, it will create a copy of the buffer
 * @param {object} options - An option object
 * @param {number} [option.offset=0} - copy the input data ignoring the first n bytes
 * @property {ArrayBuffer} buffer - Reference to the internal ArrayBuffer object
 * @property {number} length - Byte length of the internal ArrayBuffer
 * @property {number} offset - The current offset of the buffer's pointer
 */
class IOBuffer {
    constructor(data, options) {
        options = options || {};
        var dataIsGiven = false;
        if (data === undefined) {
            data = defaultByteLength;
        }
        if (typeof data === 'number') {
            data = new ArrayBuffer(data);
        } else {
            dataIsGiven = true;
            this._lastWrittenByte = data.byteLength;
        }

        let length = data.byteLength;
        const offset = options.offset ? options.offset>>>0 : 0;
        if (data.buffer) {
            length = data.byteLength - offset;
            if (data.byteLength !== data.buffer.byteLength) { // Node.js buffer from pool
                data = data.buffer.slice(data.byteOffset + offset, data.byteOffset + data.byteLength);
            } else if (offset) {
                data = data.buffer.slice(offset);
            } else {
                data = data.buffer;
            }
        }
        if(dataIsGiven) {
            this._lastWrittenByte = length;
        } else {
            this._lastWrittenByte = 0;
        }
        this.buffer = data;
        this.length = length;
        this.byteLength = length;
        this.byteOffset = 0;
        this.offset = 0;
        this.littleEndian = true;
        this._data = new DataView(this.buffer);
        this._increment = length || defaultByteLength;
        this._mark = 0;
        this._marks = [];
    }

    /**
     * Checks if the memory allocated to the buffer is sufficient to store more bytes after the offset
     * @param {number} [byteLength=1] The needed memory in bytes
     * @returns {boolean} Returns true if there is sufficient space and false otherwise
     */
    available(byteLength) {
        if (byteLength === undefined) byteLength = 1;
        return (this.offset + byteLength) <= this.length;
    }

    /**
     * Check if little-endian mode is used for reading and writing multi-byte values
     * @returns {boolean} Returns true if little-endian mode is used, false otherwise
     */
    isLittleEndian() {
        return this.littleEndian;
    }

    /**
     * Set little-endian mode for reading and writing multi-byte values
     * @returns {IOBuffer}
     */
    setLittleEndian() {
        this.littleEndian = true;
        return this;
    }

    /**
     * Check if big-endian mode is used for reading and writing multi-byte values
     * @returns {boolean} Returns true if big-endian mode is used, false otherwise
     */
    isBigEndian() {
        return !this.littleEndian;
    }

    /**
     * Switches to big-endian mode for reading and writing multi-byte values
     * @returns {IOBuffer}
     */
    setBigEndian() {
        this.littleEndian = false;
        return this;
    }

    /**
     * Move the pointer n bytes forward
     * @param {number} n
     * @returns {IOBuffer}
     */
    skip(n) {
        if (n === undefined) n = 1;
        this.offset += n;
        return this;
    }

    /**
     * Move the pointer to the given offset
     * @param {number} offset
     * @returns {IOBuffer}
     */
    seek(offset) {
        this.offset = offset;
        return this;
    }

    /**
     * Store the current pointer offset.
     * @see {@link IOBuffer#reset}
     * @returns {IOBuffer}
     */
    mark() {
        this._mark = this.offset;
        return this;
    }

    /**
     * Move the pointer back to the last pointer offset set by mark
     * @see {@link IOBuffer#mark}
     * @returns {IOBuffer}
     */
    reset() {
        this.offset = this._mark;
        return this;
    }

    /**
     * Push the current pointer offset to the mark stack
     * @see {@link IOBuffer#popMark}
     * @returns {IOBuffer}
     */
    pushMark() {
        this._marks.push(this.offset);
        return this;
    }

    /**
     * Pop the last pointer offset from the mark stack, and set the current pointer offset to the popped value
     * @see {@link IOBuffer#pushMark}
     * @returns {IOBuffer}
     */
    popMark() {
        const offset = this._marks.pop();
        if(offset === undefined) throw new Error('Mark stack empty');
        this.seek(offset);
        return this;
    }

    /**
     * Move the pointer offset back to 0
     * @returns {IOBuffer}
     */
    rewind() {
        this.offset = 0;
        return this;
    }

    /**
     * Make sure the buffer has sufficient memory to write a given byteLength at the current pointer offset
     * If the buffer's memory is insufficient, this method will double the internal buffer's length
     * @param {number} byteLength
     * @returns {IOBuffer}
     */
    ensureAvailable(byteLength) {
        if (byteLength === undefined) byteLength = 1;
        if (!this.available(byteLength)) {
            const newIncrement = this._increment + this._increment;
            this._increment = newIncrement;
            const newLength = this.length + newIncrement;
            const newArray = new Uint8Array(newLength);
            newArray.set(new Uint8Array(this.buffer));
            this.buffer = newArray.buffer;
            this.length = newLength;
            this._data = new DataView(this.buffer);
        }
        return this;
    }

    /**
     * Read a byte and return false if the byte's value is 0, or true otherwise
     * Moves pointer forward
     * @returns {boolean}
     */
    readBoolean() {
        return this.readUint8() !== 0;
    }

    /**
     * Read a signed 8-bit integer and move pointer forward
     * @returns {number}
     */
    readInt8() {
        return this._data.getInt8(this.offset++);
    }

    /**
     * Read an unsigned 8-bit integer and move pointer forward
     * @returns {number}
     */
    readUint8() {
        return this._data.getUint8(this.offset++);
    }

    /**
     * Alias for {@link IOBuffer#readUint8}
     * @returns {number}
     */
    readByte() {
        return this.readUint8();
    }

    /**
     * Read n bytes and move pointer forward.
     * @param n
     * @returns {Uint8Array}
     */
    readBytes(n) {
        if (n === undefined) n = 1;
        var bytes = new Uint8Array(n);
        for (var i = 0; i < n; i++) {
            bytes[i] = this.readByte();
        }
        return bytes;
    }

    /**
     * Read a 16-bit signed integer and move pointer forward
     * @returns {number}
     */
    readInt16() {
        var value = this._data.getInt16(this.offset, this.littleEndian);
        this.offset += 2;
        return value;
    }

    /**
     * Read a 16-bit unsigned integer and move pointer forward
     * @returns {number}
     */
    readUint16() {
        var value = this._data.getUint16(this.offset, this.littleEndian);
        this.offset += 2;
        return value;
    }

    /**
     * Read a 32-bit signed integer and move pointer forward
     * @returns {number}
     */
    readInt32() {
        var value = this._data.getInt32(this.offset, this.littleEndian);
        this.offset += 4;
        return value;
    }

    /**
     * Read a 32-bit unsigned integer and move pointer forward
     * @returns {number}
     */
    readUint32() {
        var value = this._data.getUint32(this.offset, this.littleEndian);
        this.offset += 4;
        return value;
    }

    /**
     * Read a 32-bit floating number and move pointer forward
     * @returns {number}
     */
    readFloat32() {
        var value = this._data.getFloat32(this.offset, this.littleEndian);
        this.offset += 4;
        return value;
    }

    /**
     * Read a 64-bit floating number and move pointer forward
     * @returns {number}
     */
    readFloat64() {
        var value = this._data.getFloat64(this.offset, this.littleEndian);
        this.offset += 8;
        return value;
    }

    /**
     * Read 1-byte ascii character and move pointer forward
     * @returns {string}
     */
    readChar() {
        return String.fromCharCode(this.readInt8());
    }

    /**
     * Read n 1-byte ascii characters and move pointer forward
     * @param n
     * @returns {string}
     */
    readChars(n) {
        if (n === undefined) n = 1;
        charArray.length = n;
        for (var i = 0; i < n; i++) {
            charArray[i] = this.readChar();
        }
        return charArray.join('');
    }

    /**
     * Write 0xff if the passed value is truthy, 0x00 otherwise
     * @param {any} value
     * @returns {IOBuffer}
     */
    writeBoolean(value) {
        this.writeUint8(value ? 0xff : 0x00);
        return this;
    }

    /**
     * Write value as an 8-bit signed integer
     * @param value
     * @returns {IOBuffer}
     */
    writeInt8(value) {
        this.ensureAvailable(1);
        this._data.setInt8(this.offset++, value);
        this._updateLastWrittenByte();
        return this;
    }

    /**
     * Write value as a 8-bit unsigned integer
     * @param value
     * @returns {IOBuffer}
     */
    writeUint8(value) {
        this.ensureAvailable(1);
        this._data.setUint8(this.offset++, value);
        this._updateLastWrittenByte();
        return this;
    }

    /**
     * An alias for {@link IOBuffer#writeUint8}
     * @param value
     * @returns {IOBuffer}
     */
    writeByte(value) {
        return this.writeUint8(value);
    }

    /**
     * Write bytes
     * @param {Array|Uint8Array} bytes
     * @returns {IOBuffer}
     */
    writeBytes(bytes) {
        this.ensureAvailable(bytes.length);
        for (var i = 0; i < bytes.length; i++) {
            this._data.setUint8(this.offset++, bytes[i]);
        }
        this._updateLastWrittenByte();
        return this;
    }

    /**
     * Write value as an 16-bit signed integer
     * @param value
     * @returns {IOBuffer}
     */
    writeInt16(value) {
        this.ensureAvailable(2);
        this._data.setInt16(this.offset, value, this.littleEndian);
        this.offset += 2;
        this._updateLastWrittenByte();
        return this;
    }

    /**
     * Write value as a 16-bit unsigned integer
     * @param value
     * @returns {IOBuffer}
     */
    writeUint16(value) {
        this.ensureAvailable(2);
        this._data.setUint16(this.offset, value, this.littleEndian);
        this.offset += 2;
        this._updateLastWrittenByte();
        return this;
    }

    /**
     * Write a 32-bit signed integer at the current pointer offset
     * @param value
     * @returns {IOBuffer}
     */
    writeInt32(value) {
        this.ensureAvailable(4);
        this._data.setInt32(this.offset, value, this.littleEndian);
        this.offset += 4;
        this._updateLastWrittenByte();
        return this;
    }

    /**
     * Write a 32-bit unsigned integer at the current pointer offset
     * @param value - The value to set
     * @returns {IOBuffer}
     */
    writeUint32(value) {
        this.ensureAvailable(4);
        this._data.setUint32(this.offset, value, this.littleEndian);
        this.offset += 4;
        this._updateLastWrittenByte();
        return this;
    }

    /**
     * Write a 32-bit floating number at the current pointer offset
     * @param value - The value to set
     * @returns {IOBuffer}
     */
    writeFloat32(value) {
        this.ensureAvailable(4);
        this._data.setFloat32(this.offset, value, this.littleEndian);
        this.offset += 4;
        this._updateLastWrittenByte();
        return this;
    }

    /**
     * Write a 64-bit floating number at the current pointer offset
     * @param value
     * @returns {IOBuffer}
     */
    writeFloat64(value) {
        this.ensureAvailable(8);
        this._data.setFloat64(this.offset, value, this.littleEndian);
        this.offset += 8;
        this._updateLastWrittenByte();
        return this;
    }

    /**
     * Write the charCode of the passed string's first character to the current pointer offset
     * @param {string} str - The character to set
     * @returns {IOBuffer}
     */
    writeChar(str) {
        return this.writeUint8(str.charCodeAt(0));
    }

    /**
     * Write the charCodes of the passed string's characters to the current pointer offset
     * @param str
     * @returns {IOBuffer}
     */
    writeChars(str) {
        for (var i = 0; i < str.length; i++) {
            this.writeUint8(str.charCodeAt(i));
        }
        return this;
    }

    /**
     * Export a view of the internal buffer. The view spans from offset 0 to the largest written offset
     * @returns {Uint8Array}
     */
    toArray() {
        return new Uint8Array(this.buffer, 0, this._lastWrittenByte);
    }

    /**
     * Update the last written byte offset
     * @private
     */
    _updateLastWrittenByte() {
        if(this.offset > this._lastWrittenByte) {
            this._lastWrittenByte = this.offset;
        }
    }
}

module.exports = IOBuffer;
