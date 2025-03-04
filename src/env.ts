let hostIsBigEndian: boolean | undefined;

/**
 * Checks if the host system is big-endian.
 * @returns `true` if the host system is big-endian, `false` if it is little-endian.
 */
export function isHostBigEndian() {
  return hostIsBigEndian ?? (hostIsBigEndian = detectEndianness());
}

function detectEndianness() {
  const array = new Uint8Array(4);
  const view = new Uint32Array(array.buffer);
  return !((view[0] = 1) & array[0]);
}

/**
 * Returns a new buffer with the same contents as the input buffer, but with a larger size.
 * Try to at least double the size of the buffer to avoid frequent reallocations.
 * @param buffer - The buffer to increase the size of.
 * @param minimumSize - The minimum size of the new buffer.
 * @returns The new buffer.
 */
export function increaseBufferSize(
  buffer: ArrayBuffer,
  minimumSize: number,
): ArrayBuffer {
  let maxAllowedLength = 2 ** 29; // 512MB
  if (minimumSize > maxAllowedLength) {
    // The check is expensive, don't do it until a large buffer is requested.
    maxAllowedLength = getMaxUint8ArrayLength();
    if (minimumSize > maxAllowedLength) {
      throw new RangeError(
        `Cannot create a buffer with more than ${maxAllowedLength} bytes`,
      );
    }
  }
  // Don't try to allocate more than the maximum allowed length.
  const doubleOrMax = Math.min(buffer.byteLength * 2, maxAllowedLength);
  const newLength = Math.max(doubleOrMax, minimumSize);
  const newBuffer = new ArrayBuffer(newLength);
  new Uint8Array(newBuffer).set(new Uint8Array(buffer));
  return newBuffer;
}

let maxUint8ArrayLength: number | undefined;

/**
 * Detects and returns the maximum length that of an `ArrayBuffer`.
 * @returns The maximum length that an `ArrayBuffer` can have.
 */
export function getMaxUint8ArrayLength() {
  return (
    maxUint8ArrayLength ?? (maxUint8ArrayLength = detectMaxUint8ArrayLength())
  );
}

function detectMaxUint8ArrayLength() {
  // Use a binary search to find the maximum length of an Uint8Array.
  let low = 1;
  let high = Number.MAX_SAFE_INTEGER - 1;
  while (low < high) {
    const mid = Math.trunc((low + high) / 2);
    try {
      // eslint-disable-next-line no-new
      new Uint8Array(mid);
      low = mid + 1;
    } catch {
      high = mid;
    }
  }
  return low - 1;
}
