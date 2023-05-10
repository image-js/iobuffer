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

  it('uint 16', () => {
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
    //numbers taken from Buffer.readInt32LE in Node.js
    const dataFromLE = new Uint8Array([1, 5, 3, 31, 3, 4, 40, 8]);
    const dataFromBE = new Uint8Array([31, 3, 5, 1, 8, 40, 4, 3]);
    const firstNumber = 520291585;
    const secondNumber = 136840195;

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
    //numbers taken from Buffer.readBigUIntLE in Node.js
    const dataFromLE = new Uint8Array([
      1, 5, 3, 31, 3, 4, 40, 8, 1, 5, 3, 31, 6, 4, 45, 9,
    ]);
    const dataFromBE = new Uint8Array([
      8, 40, 4, 3, 31, 3, 5, 1, 9, 45, 4, 6, 31, 3, 5, 1,
    ]);
    const firstNumber = 587724162823554305n;
    const secondNumber = 661189144629937409n;

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
    //numbers taken from Buffer.readFloatLE in Node.js
    const dataFromLE = new Uint8Array([1, 5, 3, 31, 3, 4, 40, 8]);
    const dataFromBE = new Uint8Array([31, 3, 5, 1, 8, 40, 4, 3]);

    const firstNumber = 2.774446815681537e-20;
    const secondNumber = 5.056037679289265e-34;

    // little endian
    let buffer = new IOBuffer(dataFromLE);
    const res = buffer.readArray(2, 'float32');
    expect(buffer.offset).toBe(8);
    expect(res[0]).toBe(firstNumber);
    expect(res[1]).toBe(secondNumber);

    // big endian
    buffer = new IOBuffer(dataFromBE);
    buffer.offset = 0;
    buffer.setBigEndian();
    const resBE = buffer.readArray(2, 'float32');
    expect(buffer.offset).toBe(8);
    expect(resBE[0]).toBe(firstNumber);
    expect(resBE[1]).toBe(secondNumber);
  });
  it('float 64', () => {
    //numbers taken from Buffer.readDoubleLE in Node.js
    const dataFromLE = new Uint8Array([
      1, 5, 3, 31, 3, 4, 40, 8, 1, 5, 3, 31, 6, 4, 45, 9,
    ]);
    const dataFromBE = new Uint8Array([
      8, 40, 4, 3, 31, 3, 5, 1, 9, 45, 4, 6, 31, 3, 5, 1,
    ]);
    const firstNumber = 2.272943520084162e-269;
    const secondNumber = 1.7997291369381062e-264;

    // little endian
    let buffer = new IOBuffer(dataFromLE);
    const res = buffer.readArray(2, 'float64');
    expect(buffer.offset).toBe(16);
    expect(res[0]).toBe(firstNumber);
    expect(res[1]).toBe(secondNumber);

    // big endian
    buffer = new IOBuffer(dataFromBE);
    buffer.offset = 0;
    buffer.setBigEndian();
    const resBE = buffer.readArray(2, 'float64');
    expect(buffer.offset).toBe(16);
    expect(resBE[0]).toBe(firstNumber);
    expect(resBE[1]).toBe(secondNumber);
  });
  it('offset not multiple', () => {
    const buffer = new IOBuffer(new Uint8Array([1, 2, 3, 4, 5, 6]));

    //offset is multiple
    buffer.offset = 2;
    const res = buffer.readArray(2, 'int16');
    expect(buffer.offset).toBe(6);
    expect(res[0]).toBe(3 + (4 << 8));
    expect(res[1]).toBe(5 + (6 << 8));

    //offset is not multiple and make sure that we don't have such error `start offset of Int16Array should be a multiple of 2`
    buffer.offset = 1;
    const resNotMultipleOffset = buffer.readArray(2, 'int16');
    expect(buffer.offset).toBe(5);
    expect(resNotMultipleOffset[0]).toBe(2 + (3 << 8));
    expect(resNotMultipleOffset[1]).toBe(4 + (5 << 8));
  });
});
