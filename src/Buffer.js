'use strict';

class Buffer {
    constructor() {
        this.buffer = null;
        this.length = 0;
        this.offset = 0;
        this.littleEndian = true;
        this._mark = 0;
        this._data = null;
    }

    available(byteLength) {
        if (byteLength === undefined) byteLength = 1;
        return (this.offset + byteLength) <= this.length;
    }

    isLittleEndian() {
        return this.littleEndian;
    }

    setLittleEndian() {
        this.littleEndian = true;
    }

    isBigEndian() {
        return !this.littleEndian;
    }

    setBigEndian() {
        this.littleEndian = false;
    }

    skip(n) {
        if (n === undefined) n = 1;
        this.offset += n;
    }

    seek(offset) {
        this.offset = offset;
    }

    mark() {
        this._mark = this.offset;
    }

    reset() {
        this.offset = this._mark;
    }

    rewind() {
        this.offset = 0;
    }
}

module.exports = Buffer;
