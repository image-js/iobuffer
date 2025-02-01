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
