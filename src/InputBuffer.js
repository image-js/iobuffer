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
        return this._data.getInt8(this._offset++);
    }

    readUint8() {
        return this._data.getUint8(this._offset++);
    }

    readInt16() {
        var value = this._data.getInt16(this._offset, this._littleEndian);
        this._offset += 2;
        return value;
    }

    readUint16() {
        var value = this._data.getUint16(this._offset, this._littleEndian);
        this._offset += 2;
        return value;
    }

    readInt32() {
        var value = this._data.getInt32(this._offset, this._littleEndian);
        this._offset += 4;
        return value;
    }

    readUint32() {
        var value = this._data.getUint32(this._offset, this._littleEndian);
        this._offset += 4;
        return value;
    }

    readFloat32() {
        var value = this._data.getFloat32(this._offset, this._littleEndian);
        this._offset += 4;
        return value;
    }

    readFloat64() {
        var value = this._data.getFloat64(this._offset, this._littleEndian);
        this._offset += 8;
        return value;
    }
}

module.exports = InputBuffer;
