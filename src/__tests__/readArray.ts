import { IOBuffer } from '../IOBuffer';

describe('readArray', () => {
  it('0 bytes', () => {
    const buffer = new IOBuffer(new Uint8Array([1, 2]));

    const result = buffer.readArray(0, 'int8');
    // return empty typed array
    expect(result).toStrictEqual(new Int8Array([]));
    // do not change offset
    expect(buffer.offset).toBe(0);
  });

  it('uint8', () => {
    const buffer = new IOBuffer(new Uint8Array([1, 2, 3, 4]));
    buffer.setLittleEndian();
    buffer.readArray(0, 'int8');
    const sameLE = buffer.readArray(4, 'uint8');
    expect(buffer.offset).toBe(4);

    buffer.setBigEndian();
    buffer.offset = 0;
    const sameBE = buffer.readArray(4, 'uint8');
    expect(buffer.offset).toBe(4);

    expect(sameLE).toStrictEqual(sameBE);
  });

  it('int 16', () => {
    /*
    LE system stores [258, 259] as [2, 1, 3, 1]
    BE system as [1, 2, 1, 3]
  */
    const dataFromLE = new Uint8Array([2, 1, 3, 1]);
    const dataFromBE = new Uint8Array([1, 2, 1, 3]);
    const firstNumber = 258;
    const secondNumber = 259;

    // little endian
    let buffer = new IOBuffer(dataFromLE);
    const LeRes = buffer.readArray(2, 'uint16');
    expect(buffer.offset).toBe(4);
    expect(LeRes[0]).toBe(firstNumber);
    expect(LeRes[1]).toBe(secondNumber);

    // big endian
    buffer = new IOBuffer(dataFromBE);
    buffer.setBigEndian();
    const BeRes = buffer.readArray(2, 'uint16');
    expect(buffer.offset).toBe(4);
    expect(BeRes[0]).toBe(firstNumber);
    expect(BeRes[1]).toBe(secondNumber);
  });

  it('int 32', () => {
    const dataFromLE = new Uint8Array([1, 0, 0, 0, 2, 0, 0, 0]);
    const dataFromBE = new Uint8Array([0, 0, 0, 1, 0, 0, 0, 2]);
    const firstNumber = 1;
    const secondNumber = 2;

    // little endian
    let buffer = new IOBuffer(dataFromLE);
    const LeRes = buffer.readArray(2, 'int32');
    expect(buffer.offset).toBe(8);
    expect(LeRes[0]).toBe(firstNumber);
    expect(LeRes[1]).toBe(secondNumber);

    // big endian
    buffer = new IOBuffer(dataFromBE);
    buffer.setBigEndian();
    const BeRes = buffer.readArray(2, 'int32');
    expect(buffer.offset).toBe(8);
    expect(BeRes[0]).toBe(firstNumber);
    expect(BeRes[1]).toBe(secondNumber);
  });
  it('uint 64', () => {
    const dataFromLE = new Uint8Array([
      1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0,
    ]);
    const dataFromBE = new Uint8Array([
      0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 2,
    ]);
    const firstNumber = 1n;
    const secondNumber = 2n;

    // little endian
    let buffer = new IOBuffer(dataFromLE);
    const LeRes = buffer.readArray(2, 'uint64');
    expect(buffer.offset).toBe(16);
    expect(LeRes[0]).toBe(firstNumber);
    expect(LeRes[1]).toBe(secondNumber);

    // big endian
    buffer = new IOBuffer(dataFromBE);
    buffer.setBigEndian();
    const BeRes = buffer.readArray(2, 'uint64');
    expect(buffer.offset).toBe(16);
    expect(BeRes[0]).toBe(firstNumber);
    expect(BeRes[1]).toBe(secondNumber);
  });
  it('float 32', () => {
    const data = new Uint8Array([0, 2, 0, 1, 0, 0, 0, 0]);
    //numbers taken from readFloat32BE and LE in Node.js
    const le = 2.351132194607322e-38;
    const be = 1.8367239361444675e-40;

    // little endian
    let buffer = new IOBuffer(data);
    const res = buffer.readArray(2, 'float32');
    expect(buffer.offset).toBe(8);
    expect(res[0]).toBe(le);
    expect(res[1]).toBe(0);

    // big endian
    buffer.offset = 0;
    buffer.setBigEndian();
    const resBE = buffer.readArray(2, 'float32');
    expect(buffer.offset).toBe(8);
    expect(resBE[0]).toBe(be);
    expect(resBE[1]).toBe(0);
  });
});
