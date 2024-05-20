import { little_endian_bytes_to_num, NumToByteConverter, unsigned_number_would_overflow } from "./utils";

const MIDI_HEADER_LENGTH = 6;
const REQUIRED_MINIMUM_CHUNK_SIZE = 8;
// This is the tpq that the SP404 mk2 uses
export const TICKS_PER_QUARTER = 480;

const BYTES_IN_A_SINGLE_VALUE = 8;
const META_DATA_SIZE = 16;
const MIDI_MIDDLE_C = 67;
const SP404_ROOT_C_PITCH = 0x8d;

type PatternEvent = {
  ticks_since_last_event: number;
  pad_pressed: number;
  bank: number;
  pitch: number;
  velocity: number;
  hold_time: number;
};

type MidiFile = {
  data: Uint8Array;
  bank_layer: number;
  pad: number;
};

type BankID = number;
type PadID = number;
type PadDict<T> = Record<PadID, T>;
type BankDict<T> = Record<BankID, T>;
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


function sp404_pitch_to_midi_note(pitch: number): number {
  const out = pitch - SP404_ROOT_C_PITCH + MIDI_MIDDLE_C;
  return out;
}

function make_pattern_event_from_uint8array(array: Uint8Array): PatternEvent {
  const event: PatternEvent = {
    ticks_since_last_event: array[0],
    pad_pressed: array[1],
    bank: array[2],
    pitch: array[3] ? sp404_pitch_to_midi_note(array[3]) : MIDI_MIDDLE_C,
    velocity: array[4],
    hold_time: little_endian_bytes_to_num(array.slice(-2)),
  };
  return event;
}

export function build_midi_files_from_midi_event_builder(midi_builder: MidiEventBuilder) {
  let midi_files: MidiFile[] = [];

  Object.entries(midi_builder.pattern_events).forEach(([bank_id, pads]) => {
    Object.entries(pads).forEach(([pad_id, pad_events]) => {
      const header = make_midi_header_chunk(
        MidiFileFormat.SingleTrack,
        1,
        TICKS_PER_QUARTER
      );
      const track_chunk = make_midi_track_chunk(pad_events);
      const midiFile = new Uint8Array(header.length + track_chunk.length);

      midiFile.set(header, 0);
      midiFile.set(track_chunk, header.length);
      midi_files.push({
        data: midiFile,
        bank_layer: Number(bank_id),
        pad: Number(pad_id),
      });
    });
  });

  return midi_files;
}

export class MidiEventBuilder {
  pattern_events: BankDict<PadDict<MidiTrackEvent[]>>;
  constructor() {
    this.pattern_events = {};

    this.process_value = this.process_value.bind(this);
  }
  process_value(value: Uint8Array) {
    const value_data = value.slice(0, -META_DATA_SIZE);
    let current_global_tick_offset_from_start = 0;
    for (let i = 0; i < value_data.length; i += BYTES_IN_A_SINGLE_VALUE) {
      const value = value_data.slice(i, i + BYTES_IN_A_SINGLE_VALUE);
      const pattern_event = make_pattern_event_from_uint8array(value);
      current_global_tick_offset_from_start +=
        pattern_event.ticks_since_last_event;
      if (
        !Object.prototype.hasOwnProperty.call(
          this.pattern_events,
          pattern_event.bank
        )
      ) {
        this.pattern_events[pattern_event.bank] = {};
      }
      if (
        !Object.prototype.hasOwnProperty.call(
          this.pattern_events[pattern_event.bank],
          pattern_event.pad_pressed
        )
      ) {
        this.pattern_events[pattern_event.bank][pattern_event.pad_pressed] = [];
      }
      const last_event_from_bank_and_pad =
        this.pattern_events[pattern_event.bank][pattern_event.pad_pressed][-1];

      let time;
      if (!last_event_from_bank_and_pad) {
        time = current_global_tick_offset_from_start;
      } else {
        time =
          current_global_tick_offset_from_start -
          last_event_from_bank_and_pad.v_time;
      }
      this.pattern_events[pattern_event.bank][pattern_event.pad_pressed].push(
        construct_midi_track_event(
          time,
          MidiEventConstructor.note_on(
            1,
            pattern_event.pitch,
            pattern_event.velocity
          )
        )
      );
      this.pattern_events[pattern_event.bank][pattern_event.pad_pressed].push(
        construct_midi_track_event(
          time + pattern_event.hold_time,
          MidiEventConstructor.note_off(
            1,
            pattern_event.pitch,
            pattern_event.velocity
          )
        )
      );
    }

    const meta_data = value.slice(-META_DATA_SIZE);
    if (
      meta_data[14] * (TICKS_PER_QUARTER * 4) !==
      current_global_tick_offset_from_start
    ) {
      throw new Error(
        "Amount of ticks present in patterns does not match the incoming patterns bar length"
      );
    }
  }
}

export function construct_midi_track_event(
  offset_since_last_event: number,
  event: Uint8Array
): MidiTrackEvent {
  const out: MidiTrackEvent = {
    v_time: offset_since_last_event,
    event: event
  }
  return out;
};

function get_total_length_of_track_events(track_events: MidiTrackEvent[]): number {
  const total_length = track_events.reduce((length, event) => {
    return length + event.event.length + NumToByteConverter.variable_length(event.v_time).length;
  }, 0);
  return total_length;
}

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

export function make_midi_header_chunk(
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

