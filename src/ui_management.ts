import {
  build_midi_files_from_midi_event_builder,
  MidiEventBuilder,
} from "./midi";
import { bank_name_lookup, PadConfigBuilder } from "./pad_config";
import { global_state } from "./state";
import { download_string_as_file, process_reader_with_callback } from "./utils";

const PAD_OFFSET = 47;
const PADS_PER_BANK = 16;
const TIME_SPACING_PAD_ID = 128;

function get_reader_from_file_select_event(event: Event) {
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
  return stream.getReader();
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

function handle_midi_file_download() {
  if (!global_state.midi_event_builder) {
    throw new Error(
      "Attempted to download midi files that are not built yet. make sure to build midi files before attempting to call this function"
    );
  }

  const files = build_midi_files_from_midi_event_builder(
    global_state.midi_event_builder
  );
  files.forEach((file) => {
    if (Number(file.pad) === TIME_SPACING_PAD_ID) {
      return;
    }

    const base_64_contents = btoa(String.fromCharCode(...file.data));

    const is_second_layer_bank = file.bank_layer === 1;
    const bank_id_offset = is_second_layer_bank ? 5 : 0;
    const actual_bank_id = Math.floor((file.pad - PAD_OFFSET) / PADS_PER_BANK) + bank_id_offset;
    const actual_pad = (file.pad - PAD_OFFSET) % PADS_PER_BANK;
    const bank_name = bank_name_lookup[actual_bank_id as keyof typeof bank_name_lookup];

    if (!global_state.pad_config_builder || Object.keys(global_state.pad_config_builder.bank_info).length === 0) {
      download_string_as_file(
        base_64_contents,
        "data:audio/midi;base64",
        `${bank_name}-${actual_pad + 1}`
      );
      return;
    }

    const sample_name = global_state.pad_config_builder?.bank_info[bank_name][actual_pad];
    download_string_as_file(
      base_64_contents,
      "data:audio/midi;base64",
      `${bank_name}-${sample_name}`
    );
  });
}

export function register_ui_handlers_and_listeners(
  pattern_input: HTMLButtonElement,
  pad_config_input: HTMLButtonElement,
  submit_button: HTMLButtonElement
) {
  pattern_input.addEventListener("mousedown", () => {
    const el = document.createElement("input");
    el.type = "file";
    el.addEventListener("change", (e: Event) => {
      const reader = get_reader_from_file_select_event(e);
      global_state.current_pattern_reader = reader;
      handle_submit_button_enabled_disabled_state(e, submit_button);
    });
    el.click();
  });

  pad_config_input.addEventListener("mousedown", () => {
    const el = document.createElement("input");
    el.type = "file";
    el.addEventListener("change", (e: Event) => {
      const reader = get_reader_from_file_select_event(e);
      global_state.current_pad_config_reader = reader;
      handle_submit_button_enabled_disabled_state(e, submit_button);
    });
    el.click();
  });

  submit_button.addEventListener("mousedown", async () => {
    global_state.midi_event_builder = new MidiEventBuilder();
    global_state.pad_config_builder = new PadConfigBuilder();

    if (!global_state.current_pattern_reader) {
      throw new Error(`No current reader set`);
    }

    let work_load: Promise<void>[] = [];
    if (global_state.current_pad_config_reader) {
      work_load.push(
        process_reader_with_callback<Uint8Array>(
          global_state.current_pad_config_reader,
          global_state.pad_config_builder?.process_value
        )
      );
    }
    work_load.push(
      process_reader_with_callback<Uint8Array>(
        global_state.current_pattern_reader,
        global_state.midi_event_builder?.process_value
      )
    );
    await Promise.all(work_load);

    handle_midi_file_download();
  });
}
