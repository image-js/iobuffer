import { IOBuffer } from '../IOBuffer';

describe('write data', () => {
  let buffer: IOBuffer;
  beforeEach(() => {
    buffer = new IOBuffer(16);
  });

  it('writeBoolean', () => {
    buffer.writeBoolean(null);
    buffer.writeBoolean(true);
    buffer.writeBoolean(false);
    buffer.writeBoolean(1);
    buffer.writeBoolean('a');
    buffer.writeBoolean(0);
    buffer.writeBoolean({});
    buffer.writeBoolean('');
    check(buffer);
  });

  it('writeInt8', () => {
    buffer.writeInt8(0);
    buffer.writeInt8(-1);
    buffer.writeInt8(0);
    buffer.writeInt8(-1);
    buffer.writeInt8(-1);
    buffer.writeInt8(0);
    buffer.writeInt8(-1);
    buffer.writeInt8(0);
    check(buffer);
  });

  it('writeUint8 / writeByte / writeBytes', () => {
    buffer.writeUint8(0);
    buffer.writeUint8(255);
    buffer.writeByte(0);
    buffer.writeByte(255);
    buffer.writeBytes([255]);
    buffer.writeBytes([0, 255, 0]);
    check(buffer);
  });

  it('writeInt16', () => {
    buffer.writeInt16(-256);
    buffer.writeInt16(-256);
    buffer.writeInt16(255);
    buffer.writeInt16(255);
    check(buffer);
  });

  it('writeUint16', () => {
    buffer.writeUint16(65280);
    buffer.writeUint16(65280);
    buffer.writeUint16(255);
    buffer.writeUint16(255);
    check(buffer);
  });

  it('writeInt32', () => {
    buffer.writeInt32(-16711936);
    buffer.writeInt32(16711935);
    check(buffer);
  });

  it('writeUint32', () => {
    buffer.writeUint32(4278255360);
    buffer.writeUint32(16711935);
    check(buffer);
  });

  it('writeFloat32', () => {
    buffer.writeFloat32(-1.71e38);
    buffer.writeFloat32(2.34e-38);
    buffer.rewind();
    expect(buffer.readFloat32()).toMatchSnapshot();
    expect(buffer.readFloat32()).toMatchSnapshot();
  });

  it('writeFloat64', () => {
    buffer.writeFloat64(7.06e-304);
    buffer.rewind();
    expect(buffer.readFloat64()).toMatchSnapshot();
  });

  it('writeBigInt64', () => {
    buffer.writeBigInt64(-1234567890n);
    buffer.rewind();
    expect(buffer.readBigInt64()).toMatchSnapshot();
  });

  it('writeBigUint64', () => {
    buffer.writeBigUint64(1234567890n);
    buffer.rewind();
    expect(buffer.readBigInt64()).toMatchSnapshot();
  });

  it('writeChar(s)', () => {
    const theBuffer = new IOBuffer(5);
    theBuffer.writeChar('h');
    theBuffer.writeChars('e');
    theBuffer.writeChars('llo');
    theBuffer.rewind();
    expect(theBuffer.readChars(5)).toBe('hello');
  });

  it('write with too small AB', () => {
    const theBuffer = new IOBuffer(1);
    theBuffer.writeFloat64(1);
    expect(theBuffer.byteLength).toBeGreaterThanOrEqual(4);
    expect(theBuffer).toHaveLength(theBuffer.byteLength);
  });

  it('ensureAvailable', () => {
    const theBuffer = new IOBuffer(2);
    theBuffer.ensureAvailable();
    expect(theBuffer.byteLength).toBe(2);
    theBuffer.skip(2);
    theBuffer.ensureAvailable();
    expect(theBuffer.byteLength).toBeGreaterThanOrEqual(3);
    theBuffer.seek(20);
    theBuffer.ensureAvailable(30);
    expect(theBuffer.byteLength).toBeGreaterThanOrEqual(50);
  });

  it('writeUtf8', () => {
    const theBuffer = new IOBuffer();
    theBuffer.writeByte(42);
    theBuffer.writeUtf8('42€');
    theBuffer.writeByte(42);
    const uint8 = theBuffer.toArray();
    expect(uint8).toHaveLength(7);
    expect(uint8).toStrictEqual(
      Uint8Array.of(42, 0x34, 0x32, 0xe2, 0x82, 0xac, 42),
    );
  });
});

const good = new Uint8Array(new Uint32Array([0xff00ff00, 0x00ff00ff]).buffer);

function check(buffer: IOBuffer): void {
  expect(buffer).toHaveLength(16);
  const ta = buffer.toArray();
  expect(ta).toStrictEqual(good);
}
