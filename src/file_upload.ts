import {
  construct_midi_track_event,
  make_midi_header,
  make_midi_track_chunk,
  MidiEventConstructor,
  MidiFileFormat,
  MidiTrackEvent,
  TICKS_PER_QUARTER,
} from "./midi_constructor";
import { little_endian_bytes_to_num } from "./utils";

let current_pattern_reader: ReadableStreamDefaultReader<Uint8Array> | null =
  null;

function get_reader_on_file_select(event: Event) {
  if (!event.target) {
    throw new Error("Failed to access event target");
  }

  const files = (event.target as HTMLInputElement).files;
  if (!files) {
    throw new Error(
      "Files undefined on event target. make sure input is a file input type"
    );
  }

  const stream = files[0].stream();
  current_pattern_reader = stream.getReader();
}

function handle_submit_button_enabled_disabled_state(
  event: Event,
  submit_button: HTMLButtonElement
) {
  if (!event.target) {
    throw new Error("Failed to access event target");
  }

  const files = (event.target as HTMLInputElement).files;
  if (!files) {
    throw new Error(
      "Files undefined on event target. make sure input is a file input type"
    );
  }

  if (!files.length) {
    submit_button.disabled = true;
    return;
  }

  submit_button.disabled = false;
}

const BYTES_IN_A_SINGLE_VALUE = 8;
const META_DATA_SIZE = 16;
const DEFAULT_PITCH_IF_NOT_PROVIDED = 67;

type PatternEvent = {
  ticks_since_last_event: number;
  pad_pressed: number;
  bank: number;
  pitch: number;
  velocity: number;
  hold_time: number;
};

function make_pattern_event_from_uint8array(array: Uint8Array): PatternEvent {
  console.log(array);
  const event: PatternEvent = {
    ticks_since_last_event: array[0],
    pad_pressed: array[1],
    bank: array[2],
    pitch: array[3] || DEFAULT_PITCH_IF_NOT_PROVIDED,
    velocity: array[4],
    hold_time: little_endian_bytes_to_num(array.slice(-2)),
  };
  return event;
}

type BankID = number;
type PadID = number;
type PadDict<T> = Record<PadID, T>;
type BankDict<T> = Record<BankID, T>;

class MidiBuilder {
  pattern_events: BankDict<PadDict<MidiTrackEvent[]>>;
  constructor() {
    this.pattern_events = {};
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
      console.log(pattern_event.pitch);
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
  build(): MidiFile[] {
    let midi_files: MidiFile[] = [];

    Object.entries(this.pattern_events).forEach(([bank_id, pads]) => {
      Object.entries(pads).forEach(([pad_id, pad_events]) => {
        const header = make_midi_header(
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
          bank: Number(bank_id),
          pad: Number(pad_id),
        });
      });
    });

    return midi_files;
  }
}

type MidiFile = {
  data: Uint8Array;
  bank: number;
  pad: number;
};

function build_midi_file_from_reader(
  reader: ReadableStreamDefaultReader<Uint8Array>
) {
  console.log("Reading file...");
  const builder = new MidiBuilder();

  reader
    .read()
    .then(async function read({ done, value }): Promise<void> {
      if (done) {
        return;
      }
      builder.process_value(value);
      return reader.read().then(read);
    }).then(() => {
      const files = builder.build();
      files.forEach((file) => {
        const link = document.createElement('a');
        const base_64_encoded_stringified_data = btoa(String.fromCharCode(...file.data));
        link.href = `data:audio/midi;base64,${base_64_encoded_stringified_data}`;
        link.download = `${file.bank}-${file.pad}.mid`;
        link.click();
      });
    });
}

export function setup_file_upload_ui(
  file_input: HTMLInputElement,
  submit_button: HTMLButtonElement
) {
  file_input.addEventListener("change", get_reader_on_file_select, false);
  file_input.addEventListener(
    "change",
    (event) => {
      handle_submit_button_enabled_disabled_state(event, submit_button);
    },
    false
  );

  submit_button.addEventListener("mousedown", () => {
    if (!current_pattern_reader) {
      throw new Error(`
        No current reader set, please make sure current_pattern_reader is set to a valid reader,
        you should really make sure that button is disabled if we somehow got here
      `);
    }
    build_midi_file_from_reader(current_pattern_reader);
  });
}
