'use strict';

const IOBuffer = require('..');

describe('test with offset', function () {
    it('should accept other IOBuffer with offset option', function () {
        const io1 = new IOBuffer(10);
        io1.writeBytes([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
        const io2 = new IOBuffer(io1, {offset: 4});
        io2.length.should.equal(6);
        io2._lastWrittenByte.should.equal(6);
        io2.readByte().should.equal(4);
        io2.readByte().should.equal(5);
        io2.readByte().should.equal(6);
        io2.readByte().should.equal(7);
    });
});
