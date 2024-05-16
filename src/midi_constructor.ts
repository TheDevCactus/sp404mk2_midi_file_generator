import { NumToByteConverter, unsigned_number_would_overflow } from "./utils";

const MIDI_HEADER_LENGTH = 6;
const REQUIRED_MINIMUM_CHUNK_SIZE = 8;
// This is the tpq that the SP404 mk2 uses
export const TICKS_PER_QUARTER = 480;

export enum MidiFileFormat {
  SingleTrack = 0,
  SimultaneousTracks = 1,
  SequentialTracks = 2,
}

export enum ChunkType {
  Header,
  Track,
}

export type MidiTrackEvent = {
  v_time: number;
  event: Uint8Array;
};

export function construct_midi_track_event(
  offset_since_last_event: number,
  event: Uint8Array
) {
  return {
    v_time: offset_since_last_event,
    event: event
  }
};

export const MidiEventConstructor = {
  note_off(channel: number, note: number, velocity: number): Uint8Array {
    const out = new Uint8Array(3);
    out[0] = 0b10000000 | channel;
    out[1] = note;
    out[2] = velocity;
    return out;
  },
  note_on(channel: number, note: number, velocity: number): Uint8Array {
    const out = new Uint8Array(3);
    out[0] = 0b10010000 | channel;
    out[1] = note;
    out[2] = velocity;
    return out;
  },
  polyphonic_key_pressure(channel: number, note: number, pressure: number): Uint8Array {
    const out = new Uint8Array(3);
    out[0] = 0b10100000 | channel;
    out[1] = note;
    out[2] = pressure;
    return out;
  },
  control_change(channel: number, controller: number, value: number): Uint8Array {
    const out = new Uint8Array(3);
    out[0] = 0b10110000 | channel;
    out[1] = controller;
    out[2] = value;
    return out;
  },
  program_change(channel: number, program_number: number): Uint8Array {
    const out = new Uint8Array(2);
    out[0] = 0b11000000 | channel;
    out[1] = program_number;
    return out;
  },
  channel_pressure(channel: number, value: number): Uint8Array {
    const out = new Uint8Array(2);
    out[0] = 0b11010000 | channel;
    out[1] = value;
    return out;
  },
  pitch_wheel_change(channel: number, value: number): Uint8Array {
    const out = new Uint8Array(3);
    out[0] = 0b11100000 | channel;
    out[1] = value & 0x7F;
    out[2] = (value >> 7) & 0x7F;
    return out;
  },
};

function is_valid_amount_of_tracks_for_file_format(
  file_format: MidiFileFormat,
  number_of_tracks: number
): boolean {
  if (file_format === MidiFileFormat.SingleTrack && number_of_tracks !== 1) {
    return false;
  }
  return true;
}

function make_midi_chunk(
  chunk_type: ChunkType,
  chunk_length: number
): Uint8Array {
  const chunk_length_bytes = NumToByteConverter.unsigned_32_bit(chunk_length);
  const out = new Uint8Array(REQUIRED_MINIMUM_CHUNK_SIZE + chunk_length);
  switch (chunk_type) {
    case ChunkType.Header:
      out[0] = "M".charCodeAt(0);
      out[1] = "T".charCodeAt(0);
      out[2] = "h".charCodeAt(0);
      out[3] = "d".charCodeAt(0);
      break;
    case ChunkType.Track:
      out[0] = "M".charCodeAt(0);
      out[1] = "T".charCodeAt(0);
      out[2] = "r".charCodeAt(0);
      out[3] = "k".charCodeAt(0);
      break;
    default:
      throw new Error(
        "Attempted to create a midi chunk with a type which is unimplemented"
      );
  }

  out.set(chunk_length_bytes, 4);
  return out;
}

export function make_midi_header(
  file_format: MidiFileFormat,
  number_of_tracks: number,
  ticks_per_quarter_note: number
): Uint8Array {
  if (!is_valid_amount_of_tracks_for_file_format(file_format, number_of_tracks)) {
    throw new Error("Number of tracks not allowed for specified file format");
  }

  const out = new Uint8Array(14);
  out.set(make_midi_chunk(ChunkType.Header, MIDI_HEADER_LENGTH));

  out[8] = (file_format >> 8) & 0xFF;
  out[9] = file_format & 0xFF;
  out.set(NumToByteConverter.unsigned_16_bit(number_of_tracks), 10);

  if (unsigned_number_would_overflow(ticks_per_quarter_note, 15)) {
    throw new Error("Ticks per quarter note would overflow the maximum 15 bits");
  }
  out.set(NumToByteConverter.unsigned_16_bit(ticks_per_quarter_note), 12);

  return out;
}

function get_total_length_of_track_events(track_events: MidiTrackEvent[]): number {
  const total_length = track_events.reduce((length, event) => {
    return length + event.event.length + NumToByteConverter.variable_length(event.v_time).length;
  }, 0);
  return total_length;
}

export function make_midi_track_chunk(track_events: MidiTrackEvent[]): Uint8Array {
  const total_length = get_total_length_of_track_events(track_events);
  const out = make_midi_chunk(ChunkType.Track, total_length);

  let current_index = 8;
  track_events.forEach((event) => {
    const bytes = NumToByteConverter.variable_length(event.v_time);
    out.set(bytes, current_index);
    current_index += bytes.length;
    out.set(event.event, current_index);
    current_index += event.event.length;
  });

  return out;
}
