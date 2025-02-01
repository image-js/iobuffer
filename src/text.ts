/**
 * Decode a Uint8Array to a string.
 * @param bytes - The Uint8Array to decode.
 * @param encoding - The encoding to use. Defaults to 'utf8'.
 * @returns The decoded string.
 */
export function decode(bytes: Uint8Array, encoding = 'utf8'): string {
  const decoder = new TextDecoder(encoding);
  return decoder.decode(bytes);
}

const encoder = new TextEncoder();

/**
 * Encode a string as UTF-8 to a Uint8Array.
 * @param str - The string to encode.
 * @returns The encoded Uint8Array.
 */
export function encode(str: string): Uint8Array {
  return encoder.encode(str);
}
