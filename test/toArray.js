'use strict';


'use strict';

const IOBuffer = require('..');

describe('test toArray', function () {
    it('from scratch', function () {
        const io1 = new IOBuffer();
        io1.toArray().byteLength.should.equal(0);
        io1.writeUint32(100);
        io1.skip(10);
        io1.writeChars('abc');
        io1.seek(4);
        io1.writeUint32(200);
        const arr1 = io1.toArray();
        arr1.byteLength.should.equal(17);
        String.fromCharCode(arr1[14]).should.equal('a');

        const io2 = new IOBuffer(10);
        io2.toArray().byteLength.should.equal(0);
        io2.writeUint32(10);
        io2.toArray().byteLength.should.equal(4);
    });

    it('from value', function () {
        {
            const io = new IOBuffer(new ArrayBuffer(7));
            io.toArray().byteLength.should.equal(7);
        }

        const io2 = new IOBuffer(new Uint8Array(11));
        io2.toArray().byteLength.should.equal(11);

        const io3 = new IOBuffer(new IOBuffer(9));
        io3.toArray().byteLength.should.equal(9);

        {
            const io = new IOBuffer(new IOBuffer(13), {offset:5});
            io.toArray().byteLength.should.equal(8);
        }
    })
});
