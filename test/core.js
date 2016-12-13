'use strict';

const IOBuffer = require('..');

describe('core methods', function () {
    let buffer;
    beforeEach(function () {
        buffer = new IOBuffer();
    });

    it('should start at 0', function () {
        buffer.offset.should.equal(0);
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
        buffer.littleEndian.should.be.true();
        buffer.isLittleEndian().should.be.true();
        buffer.isBigEndian().should.be.false();
        buffer.setBigEndian();
        buffer.littleEndian.should.be.false();
        buffer.isLittleEndian().should.be.false();
        buffer.isBigEndian().should.be.true();
        buffer.setLittleEndian();
        buffer.littleEndian.should.be.true();
        buffer.isBigEndian().should.be.false();
    });

    it('skip', function () {
        buffer.skip();
        buffer.offset.should.equal(1);
        buffer.skip();
        buffer.skip(1);
        buffer.offset.should.equal(3);
        buffer.skip(5);
        buffer.offset.should.equal(8);
    });

    it('seek', function () {
        buffer.seek(0);
        buffer.offset.should.equal(0);
        buffer.seek(12);
        buffer.offset.should.equal(12);
    });

    it('mark/reset', function () {
        buffer.seek(12);
        buffer.mark();
        buffer.skip(2);
        buffer.seek(3);
        buffer.reset();
        buffer.offset.should.equal(12);
    });

    it('pop and push marks', function () {
        buffer.seek(5);
        buffer.pushMark();
        buffer.seek(10);
        buffer.popMark();
        buffer.offset.should.equal(5);
        buffer.pushMark();
        buffer.seek(12);
        buffer.pushMark();
        buffer.skip(1);
        buffer.offset.should.equal(13);
        buffer.popMark();
        buffer.offset.should.equal(12);
        buffer.popMark();
        buffer.offset.should.equal(5);
        (function () {
            buffer.popMark();
        }).should.throw(/Mark stack empty/);

    });

    it('rewind', function () {
        buffer.seek(10);
        buffer.rewind();
        buffer.offset.should.equal(0);
    });

    it('is chainable', function() {
        const io = new IOBuffer();
        (function() {
            io
                .writeChars('abc')
                .writeUint32(10)
                .writeBoolean(true)
                .writeByte(2)
                .writeChar('x')
                .rewind()
                .skip(5)
                .mark()
                .pushMark()
                .seek(30)
                .reset()
                .popMark()
                .ensureAvailable(100)
                .setLittleEndian()
                .setBigEndian()
                .reset();
        }).should.not.throw();

    });
});
