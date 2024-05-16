import { MidiEventBuilder } from "./midi";

type GlobalSate = {
  builder: MidiEventBuilder | null;
  current_pattern_reader: ReadableStreamDefaultReader<Uint8Array> | null;
}

export const global_state: GlobalSate = {
  builder: null,
  current_pattern_reader: null
}