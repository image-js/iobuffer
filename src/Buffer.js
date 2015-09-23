'use strict';

class Buffer {
    constructor() {
        this._offset = 0;
        this._mark = 0;
        this._littleEndian = true;
    }

    setBigEndian() {
        this._littleEndian = false;
    }

    setLittleEndian() {
        this._littleEndian = true;
    }

    skip(n) {
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
