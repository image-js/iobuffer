import { IOBuffer } from '../IOBuffer';

describe('test toArray', () => {
  it('from scratch', () => {
    const io1 = new IOBuffer();
    expect(io1.toArray().byteLength).toBe(0);
    io1.writeUint32(100);
    io1.skip(10);
    io1.writeChars('abc');
    io1.seek(4);
    io1.writeUint32(200);
    const arr1 = io1.toArray();
    expect(arr1.byteLength).toBe(17);
    expect(String.fromCharCode(arr1[14])).toBe('a');

    const io2 = new IOBuffer(10);
    expect(io2.toArray().byteLength).toBe(0);
    io2.writeUint32(10);
    expect(io2.toArray().byteLength).toBe(4);
  });

  it('from value', () => {
    {
      const io = new IOBuffer(new ArrayBuffer(7));
      expect(io.toArray().byteLength).toBe(7);
    }

    const io2 = new IOBuffer(new Uint8Array(11));
    expect(io2.toArray().byteLength).toBe(11);

    const io3 = new IOBuffer(new IOBuffer(9));
    expect(io3.toArray().byteLength).toBe(9);

    {
      const io = new IOBuffer(new IOBuffer(13), { offset: 5 });
      expect(io.toArray().byteLength).toBe(8);
    }
  });

  it('getBuffer', () => {
    {
      const io = new IOBuffer(new ArrayBuffer(7));
      const buffer = io.getBuffer();
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer).toHaveLength(7);
    }

    {
      const OldBuffer = global.Buffer;
      global.Buffer = undefined;

      const io = new IOBuffer(new ArrayBuffer(7));
      const buffer = io.getBuffer();

      expect(buffer).toBeInstanceOf(Uint8Array);
      expect(buffer).not.toBeInstanceOf(OldBuffer);
      expect(buffer).toHaveLength(7);

      global.Buffer = OldBuffer;
    }
  });
});
