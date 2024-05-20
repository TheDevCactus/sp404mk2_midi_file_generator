import { MidiEventBuilder } from "./midi";
import { PadConfigBuilder } from "./pad_config";

type GlobalSate = {
  midi_event_builder: MidiEventBuilder | null;
  pad_config_builder: PadConfigBuilder | null;
  current_pattern_reader: ReadableStreamDefaultReader<Uint8Array> | null;
  current_pad_config_reader: ReadableStreamDefaultReader<Uint8Array> | null;
};

export const global_state: GlobalSate = {
  midi_event_builder: null,
  pad_config_builder: null,
  current_pattern_reader: null,
  current_pad_config_reader: null,
};
