'use strict';

const Buffer = require('..').Buffer;

describe('Base Buffer class', function () {
    let buffer;
    beforeEach(function () {
        buffer = new Buffer();
    });

    it('should start at 0', function () {
        buffer._offset.should.equal(0);
    });

    it('should report availability', function () {
        buffer.length = 15;
        buffer.available(15).should.be.true();
        buffer.available(20).should.be.false();
        buffer.skip(1);
        buffer.available(15).should.be.false();
        buffer.available(14).should.be.true();
        buffer.available(5).should.be.true();
        buffer.seek(14);
        buffer.available().should.be.true();
        buffer.available(1).should.be.true();
        buffer.available(2).should.be.false();
    });

    it('get/set endianess', function () {
        buffer._littleEndian.should.be.true();
        buffer.setBigEndian();
        buffer._littleEndian.should.be.false();
        buffer.setLittleEndian();
        buffer._littleEndian.should.be.true();
    });

    it('skip', function () {
        buffer.skip();
        buffer._offset.should.equal(1);
        buffer.skip();
        buffer.skip(1);
        buffer._offset.should.equal(3);
        buffer.skip(5);
        buffer._offset.should.equal(8);
    });

    it('seek', function () {
        buffer.seek(0);
        buffer._offset.should.equal(0);
        buffer.seek(12);
        buffer._offset.should.equal(12);
    });

    it('mark/reset', function () {
        buffer.seek(12);
        buffer.mark();
        buffer.skip(2);
        buffer.seek(3);
        buffer.reset();
        buffer._offset.should.equal(12);
    });

    it('rewind', function () {
        buffer.seek(10);
        buffer.rewind();
        buffer._offset.should.equal(0);
    });
});
