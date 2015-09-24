'use strict';

class Buffer {
    constructor() {
        this.buffer = null;
        this.length = 0;
        this._data = null;
        this._offset = 0;
        this._mark = 0;
        this._littleEndian = true;
    }

    available(byteLength) {
        if (byteLength === undefined) byteLength = 1;
        return (this._offset + byteLength) <= this.length;
    }

    setBigEndian() {
        this._littleEndian = false;
    }

    setLittleEndian() {
        this._littleEndian = true;
    }

    skip(n) {
        if (n === undefined) n = 1;
        this._offset += n;
    }

    seek(offset) {
        this._offset = offset;
    }

    mark() {
        this._mark = this._offset;
    }

    reset() {
        this._offset = this._mark;
    }

    rewind() {
        this._offset = 0;
    }
}

module.exports = Buffer;
