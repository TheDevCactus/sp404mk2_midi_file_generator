
/**
 * @name unsigned_number_would_overflow
 * @description Check if a number would overflow if it was converted to a certain amount of bits
 * @param number Number to check for overflow
 * @param bits Amount of bits to limit for overflow check
 * @returns If the number would overflow or not
 */
export function unsigned_number_would_overflow(number: number, bits: number): boolean {
  if (number > Math.pow(2, bits) - 1) {
    return true;
  }
  return false;
}

/**
 * @name NumToByteConverter
 * @description Utility for converting numbers to their byte representation
 */
export const NumToByteConverter = {
  unsigned_32_bit(number: number): Uint8Array {
    if (unsigned_number_would_overflow(number, 32)) {
      throw new Error("Number would overflow");
    }
    const bytes = new Uint8Array(4);
    bytes[0] = number >> 24;
    bytes[1] = number >> 16;
    bytes[2] = number >> 8;
    bytes[3] = number;
    return bytes;
  },
  unsigned_16_bit(number: number): Uint8Array {
    if (unsigned_number_would_overflow(number, 16)) {
      throw new Error("Number would overflow");
    }
    const bytes = new Uint8Array(2);
    bytes[0] = number >> 8;
    bytes[1] = number;
    return bytes;
  },
  // copilot wrote this, very well could be scuffed
  variable_length(number: number): Uint8Array {
    let bytes = [];
    do {
      let byte = number & 0x7F;
      if (bytes.length > 0) {
        byte |= 0x80;
      }
      bytes.unshift(byte);
      number >>= 7;
    } while (number > 0);
    return new Uint8Array(bytes);
  }
}

/**
 * @name little_endian_bytes_to_num
 * @description Convert a little endian formatted byte array to a number
 * @param bytes Byte array to convert to a number
 * @returns number represented by the byte array
 */
export function little_endian_bytes_to_num(bytes: Uint8Array): number {
  let out = 0;
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i] << (i * 8);
  }
  return out;
}
