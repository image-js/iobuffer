import './text-encoding-polyfill';

const decoder = new TextDecoder('utf-8');

export function decode(bytes: Uint8Array): string {
  return decoder.decode(bytes);
}

const encoder = new TextEncoder();

export function encode(str: string): Uint8Array {
  return encoder.encode(str);
}
