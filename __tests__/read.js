'use strict';

const IOBuffer = require('..');

const Buffer = require('buffer').Buffer;

describe('read data', function () {
  const data = new Uint32Array([0xff00ff00, 0x00ff00ff]);
  let buffer;
  beforeEach(function () {
    buffer = new IOBuffer(data);
  });

  it('construct', function () {
    // ArrayBuffer
    var buffer = new IOBuffer(new ArrayBuffer(4));
    expect(buffer).toHaveLength(4);
    // Typed array
    buffer = new IOBuffer(new Uint8Array(2));
    expect(buffer).toHaveLength(2);
    buffer = new IOBuffer(new Uint16Array(2));
    expect(buffer).toHaveLength(4);
    // Node.js buffer
    buffer = new IOBuffer(Buffer.alloc(5));
    expect(buffer).toHaveLength(5);
  });

  it('readBoolean', function () {
    expect(buffer.readBoolean()).toBe(false);
    expect(buffer.readBoolean()).toBe(true);
    expect(buffer.readBoolean()).toBe(false);
    expect(buffer.readBoolean()).toBe(true);
  });

  it('readInt8', function () {
    expect(buffer.readInt8()).toBe(0);
    expect(buffer.readInt8()).toBe(-1);
    expect(buffer.readInt8()).toBe(0);
    expect(buffer.readInt8()).toBe(-1);
    expect(buffer.readInt8()).toBe(-1);
    expect(buffer.readInt8()).toBe(0);
    expect(buffer.readInt8()).toBe(-1);
    expect(buffer.readInt8()).toBe(0);
  });

  it('readUint8 / readByte / readBytes', function () {
    expect(buffer.readUint8()).toBe(0);
    expect(buffer.readUint8()).toBe(255);
    expect(buffer.readByte()).toBe(0);
    expect(buffer.readByte()).toBe(255);
    expect(Array.from(buffer.readBytes())).toEqual([255]);
    expect(Array.from(buffer.readBytes(3))).toEqual([0, 255, 0]);
  });

  it('readInt16', function () {
    expect(buffer.readInt16()).toBe(-256);
    expect(buffer.readInt16()).toBe(-256);
    expect(buffer.readInt16()).toBe(255);
    expect(buffer.readInt16()).toBe(255);
  });

  it('readUint16', function () {
    expect(buffer.readUint16()).toBe(65280);
    expect(buffer.readUint16()).toBe(65280);
    expect(buffer.readUint16()).toBe(255);
    expect(buffer.readUint16()).toBe(255);
  });

  it('readInt32', function () {
    expect(buffer.readInt32()).toBe(-16711936);
    expect(buffer.readInt32()).toBe(16711935);
  });

  it('readUint32', function () {
    expect(buffer.readUint32()).toBe(4278255360);
    expect(buffer.readUint32()).toBe(16711935);
  });

  it('readFloat32', function () {
    expect(buffer.readFloat32()).toMatchSnapshot();
    expect(buffer.readFloat32()).toMatchSnapshot();
  });

  it('readFloat64', function () {
    expect(buffer.readFloat64()).toMatchSnapshot();
  });

  it('readChar(s)', function () {
    var chars = 'hello'.split('').map((char) => char.charCodeAt(0));
    var buffer = new IOBuffer(new Uint8Array(chars));
    expect(buffer.readChar()).toBe('h');
    expect(buffer.readChars()).toBe('e');
    expect(buffer.readChars(3)).toBe('llo');
  });

  it('readUtf8', function () {
    var buffer = new IOBuffer(
      Buffer.from([42, 0x34, 0x32, 0xe2, 0x82, 0xac, 42])
    );
    expect(buffer.readByte()).toBe(42);
    var str = buffer.readUtf8(5);
    expect(str).toBe('42€');
    expect(buffer.readByte()).toBe(42);
  });
});
