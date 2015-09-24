'use strict';

const Buffer = require('./Buffer');

class InputBuffer extends Buffer {
    constructor(data) {
        super();
        if (data.buffer) {
            data = data.buffer;
        }
        this.buffer = data;
        this.length = data.byteLength;
        this._data = new DataView(data);
    }

    readInt8() {
        return this._data.getInt8(this.offset++);
    }

    readUint8() {
        return this._data.getUint8(this.offset++);
    }

    readByte() {
        return this._data.getUint8(this.offset++);
    }

    readBytes(n) {
        if (n === undefined) n = 1;
        var bytes = new Uint8Array(n);
        for (var i = 0; i < n; i++) {
            bytes[i] = this.readByte();
        }
        return bytes;
    }

    readInt16() {
        var value = this._data.getInt16(this.offset, this.littleEndian);
        this.offset += 2;
        return value;
    }

    readUint16() {
        var value = this._data.getUint16(this.offset, this.littleEndian);
        this.offset += 2;
        return value;
    }

    readInt32() {
        var value = this._data.getInt32(this.offset, this.littleEndian);
        this.offset += 4;
        return value;
    }

    readUint32() {
        var value = this._data.getUint32(this.offset, this.littleEndian);
        this.offset += 4;
        return value;
    }

    readFloat32() {
        var value = this._data.getFloat32(this.offset, this.littleEndian);
        this.offset += 4;
        return value;
    }

    readFloat64() {
        var value = this._data.getFloat64(this.offset, this.littleEndian);
        this.offset += 8;
        return value;
    }

    readChar() {
        return String.fromCharCode(this.readInt8());
    }

    readChars(n) {
        if (n === undefined) n = 1;
        var str = '';
        for (var i = 0; i < n; i++) {
            str += this.readChar();
        }
        return str;
    }
}

module.exports = InputBuffer;
