'use strict';

const IOBuffer = require('..');

describe('core methods', function () {
  let buffer;
  beforeEach(function () {
    buffer = new IOBuffer();
  });

  it('should start at 0', function () {
    expect(buffer.offset).toBe(0);
  });

  it('should report availability', function () {
    buffer.length = 15;
    expect(buffer.available(15)).toBe(true);
    expect(buffer.available(20)).toBe(false);
    buffer.skip(1);
    expect(buffer.available(15)).toBe(false);
    expect(buffer.available(14)).toBe(true);
    expect(buffer.available(5)).toBe(true);
    buffer.seek(14);
    expect(buffer.available()).toBe(true);
    expect(buffer.available(1)).toBe(true);
    expect(buffer.available(2)).toBe(false);
  });

  it('get/set endianess', function () {
    expect(buffer.littleEndian).toBe(true);
    expect(buffer.isLittleEndian()).toBe(true);
    expect(buffer.isBigEndian()).toBe(false);
    buffer.setBigEndian();
    expect(buffer.littleEndian).toBe(false);
    expect(buffer.isLittleEndian()).toBe(false);
    expect(buffer.isBigEndian()).toBe(true);
    buffer.setLittleEndian();
    expect(buffer.littleEndian).toBe(true);
    expect(buffer.isBigEndian()).toBe(false);
  });

  it('skip', function () {
    buffer.skip();
    expect(buffer.offset).toBe(1);
    buffer.skip();
    buffer.skip(1);
    expect(buffer.offset).toBe(3);
    buffer.skip(5);
    expect(buffer.offset).toBe(8);
  });

  it('seek', function () {
    buffer.seek(0);
    expect(buffer.offset).toBe(0);
    buffer.seek(12);
    expect(buffer.offset).toBe(12);
  });

  it('mark/reset', function () {
    buffer.seek(12);
    buffer.mark();
    buffer.skip(2);
    buffer.seek(3);
    buffer.reset();
    expect(buffer.offset).toBe(12);
  });

  it('pop and push marks', function () {
    buffer.seek(5);
    buffer.pushMark();
    buffer.seek(10);
    buffer.popMark();
    expect(buffer.offset).toBe(5);
    buffer.pushMark();
    buffer.seek(12);
    buffer.pushMark();
    buffer.skip(1);
    expect(buffer.offset).toBe(13);
    buffer.popMark();
    expect(buffer.offset).toBe(12);
    buffer.popMark();
    expect(buffer.offset).toBe(5);
    expect(function () {
      buffer.popMark();
    }).toThrowError(/Mark stack empty/);
  });

  it('rewind', function () {
    buffer.seek(10);
    buffer.rewind();
    expect(buffer.offset).toBe(0);
  });

  it('is chainable', function () {
    const io = new IOBuffer();
    expect(function () {
      io.writeChars('abc')
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
    }).not.toThrowError();
  });
});
