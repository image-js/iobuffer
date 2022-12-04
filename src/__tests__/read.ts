import { IOBuffer } from '../IOBuffer';

describe('read data', () => {
  const data = new Uint32Array([0xff00ff00, 0x00ff00ff]);
  let buffer: IOBuffer;
  beforeEach(() => {
    buffer = new IOBuffer(data);
  });

  it('construct', () => {
    // ArrayBuffer
    let theBuffer = new IOBuffer(new ArrayBuffer(4));
    expect(theBuffer).toHaveLength(4);
    // Typed array
    theBuffer = new IOBuffer(new Uint8Array(2));
    expect(theBuffer).toHaveLength(2);
    theBuffer = new IOBuffer(new Uint16Array(2));
    expect(theBuffer).toHaveLength(4);
    // Node.js buffer
    theBuffer = new IOBuffer(Buffer.alloc(5));
    expect(theBuffer).toHaveLength(5);
  });

  it('read too far', () => {
    buffer.readUint16();
    buffer.readUint32();
    expect(() => buffer.readUint32()).toThrow(RangeError);
  });

  it('readBoolean', () => {
    expect(buffer.readBoolean()).toBe(false);
    expect(buffer.readBoolean()).toBe(true);
    expect(buffer.readBoolean()).toBe(false);
    expect(buffer.readBoolean()).toBe(true);
  });

  it('readInt8', () => {
    expect(buffer.readInt8()).toBe(0);
    expect(buffer.readInt8()).toBe(-1);
    expect(buffer.readInt8()).toBe(0);
    expect(buffer.readInt8()).toBe(-1);
    expect(buffer.readInt8()).toBe(-1);
    expect(buffer.readInt8()).toBe(0);
    expect(buffer.readInt8()).toBe(-1);
    expect(buffer.readInt8()).toBe(0);
  });

  it('readUint8 / readByte / readBytes', () => {
    expect(buffer.readUint8()).toBe(0);
    expect(buffer.readUint8()).toBe(255);
    expect(buffer.readByte()).toBe(0);
    expect(buffer.readByte()).toBe(255);
    expect(Array.from(buffer.readBytes())).toStrictEqual([255]);
    expect(Array.from(buffer.readBytes(3))).toStrictEqual([0, 255, 0]);
  });

  it('readInt16', () => {
    expect(buffer.readInt16()).toBe(-256);
    expect(buffer.readInt16()).toBe(-256);
    expect(buffer.readInt16()).toBe(255);
    expect(buffer.readInt16()).toBe(255);
  });

  it('readUint16', () => {
    expect(buffer.readUint16()).toBe(65280);
    expect(buffer.readUint16()).toBe(65280);
    expect(buffer.readUint16()).toBe(255);
    expect(buffer.readUint16()).toBe(255);
  });

  it('readInt32', () => {
    expect(buffer.readInt32()).toBe(-16711936);
    expect(buffer.readInt32()).toBe(16711935);
  });

  it('readUint32', () => {
    expect(buffer.readUint32()).toBe(4278255360);
    expect(buffer.readUint32()).toBe(16711935);
  });

  it('readFloat32', () => {
    expect(buffer.readFloat32()).toMatchSnapshot();
    expect(buffer.readFloat32()).toMatchSnapshot();
  });

  it('readFloat64', () => {
    expect(buffer.readFloat64()).toMatchSnapshot();
  });

  it('readBigInt64', () => {
    expect(buffer.readBigInt64()).toMatchSnapshot();
  });

  it('readBigUint64', () => {
    expect(buffer.readBigUint64()).toMatchSnapshot();
  });

  it('readChar(s)', () => {
    const chars = 'hello'.split('').map((char) => char.charCodeAt(0));
    const theBuffer = new IOBuffer(new Uint8Array(chars));
    expect(theBuffer.readChar()).toBe('h');
    expect(theBuffer.readChars()).toBe('e');
    expect(theBuffer.readChars(3)).toBe('llo');
  });

  it('readUtf8', () => {
    const theBuffer = new IOBuffer(
      Buffer.from([42, 0x34, 0x32, 0xe2, 0x82, 0xac, 42]),
    );
    expect(theBuffer.readByte()).toBe(42);
    const str = theBuffer.readUtf8(5);
    expect(str).toBe('42€');
    expect(theBuffer.readByte()).toBe(42);
    theBuffer.seek(1);
    expect(theBuffer.readUtf8()).toBe('4');
  });

  it('decodeText', () => {
    const theBuffer = new IOBuffer(
      Buffer.from([
        42, 0x34, 0x32, 0xe2, 0x82, 0xac, 42, 0x72, 0x75, 0x6e, 0x21, 0xcf,
        0x79, 0x6f, 0x73, 0x65, 0x6d, 0x69, 0x74, 0x65,
      ]),
    );
    expect(theBuffer.readByte()).toBe(42);
    const strE1 = theBuffer.decodeText(5);
    expect(strE1).toBe('42€');
    expect(theBuffer.readByte()).toBe(42);
    const strE2 = theBuffer.decodeText(4, 'windows-1251');
    expect(strE2).toBe('run!');
    expect(theBuffer.decodeText(1, 'windows-1251')).toBe('П');
    expect(theBuffer.decodeText(8, 'ISO-8859-2')).toBe('yosemite');
  });

  it('readArray 0 bytes must leave buffer unchanged', () => {
    const theBuffer = new IOBuffer(new Int8Array([1, 2]));
    const result = theBuffer.readArray(0, 'int8');
    expect(result).toStrictEqual(new Int8Array([]));
    expect(theBuffer.offset).toBe(0);
  });

  it('readArray single bytes', () => {
    const theBuffer = new IOBuffer(new Uint8Array([1, 2, 1, 3]));
    theBuffer.setLittleEndian();
    theBuffer.readArray(0, 'int8');
    const sameLE = theBuffer.readArray(4, 'uint8');
    expect(theBuffer.offset).toBe(4);

    theBuffer.setBigEndian();
    theBuffer.offset = 0;
    const sameBE = theBuffer.readArray(4, 'uint8');
    expect(theBuffer.offset).toBe(4);
    expect(sameLE).toStrictEqual(sameBE);
  });

  it('readArray compare endianness', () => {
    /*
  LE system stores [258, 259] as [2, 1, 3, 1]
  BE system as [1, 2, 1, 3]
  */
    const dataFromLE = new Uint8Array([2, 1, 3, 1]);
    const dataFromBE = new Uint8Array([1, 2, 1, 3]);
    const firstNumber = 258;
    const secondNumber = 259;

    // little endian
    let theBuffer = new IOBuffer(dataFromLE);
    const LeRes = theBuffer.readArray(2, 'uint16');
    expect(theBuffer.offset).toBe(4);
    expect(firstNumber).toBe(LeRes[0]);
    expect(secondNumber).toBe(LeRes[1]);

    //big endian
    theBuffer = new IOBuffer(dataFromBE);
    theBuffer.setBigEndian();
    const BeRes = theBuffer.readArray(2, 'uint16');
    expect(theBuffer.offset).toBe(4);
    expect(firstNumber).toBe(BeRes[0]);
    expect(secondNumber).toBe(BeRes[1]);
  });
});
