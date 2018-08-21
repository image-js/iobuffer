'use strict';

const IOBuffer = require('..');

describe('test with offset', function () {
  it('should accept other IOBuffer with offset option', function () {
    const io1 = new IOBuffer(10);
    io1.writeBytes([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const io2 = new IOBuffer(io1, { offset: 4 });
    expect(io2).toHaveLength(6);
    expect(io2._lastWrittenByte).toBe(6);
    expect(io2.readByte()).toBe(4);
    expect(io2.readByte()).toBe(5);
    expect(io2.readByte()).toBe(6);
    expect(io2.readByte()).toBe(7);
  });
  it('should add offset for new data', function () {
    const io = new IOBuffer(128, { offset: 10 });
    expect(io.byteLength).toBe(118);
  });
});
