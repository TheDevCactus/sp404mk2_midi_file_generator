
export function get_el_by_id_or_error(id: string) {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error("Element not found, make sure ID's match and that the element is in the DOM");
  }
  return el;
}

export async function process_reader_with_callback<T>(
  reader: ReadableStreamDefaultReader<T>,
  callback: (value: T) => void
) {
  let complete = false;
  while (!complete) {
    let { done, value } = await reader.read();
    if (done) {
      complete = true;
      continue;
    }
    if (value === undefined) {
      throw new Error(
        "No value present while simultaneously not done with reading"
      );
    }
    callback(value);
  }
}

export function download_string_as_file(
  contents: string,
  file_type: string,
  file_name: string
) {
  const link = document.createElement("a");
  link.href = `${file_type},${contents}`;
  link.download = file_name;
  link.click();
}

export function unsigned_number_would_overflow(number: number, bits: number): boolean {
  if (number > Math.pow(2, bits) - 1) {
    return true;
  }
  return false;
}

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

export function little_endian_bytes_to_num(bytes: Uint8Array): number {
  let out = 0;
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i] << (i * 8);
  }
  return out;
}
