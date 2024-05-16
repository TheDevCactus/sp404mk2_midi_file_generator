import {
  build_midi_files_from_midi_event_builder,
  MidiEventBuilder,
} from "./midi";
import { global_state } from "./state";

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
  global_state.current_pattern_reader = stream.getReader();
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

async function handle_bin_file_ingress(
  reader: ReadableStreamDefaultReader<Uint8Array>
) {
  global_state.builder = new MidiEventBuilder();

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
    global_state.builder.process_value(value);
  }
}

async function handle_midi_file_download() {
  if (!global_state.builder) {
    throw new Error(
      "Attempted to download midi files that are not built yet. make sure to build midi files before attempting to call this function"
    );
  }

  const files = build_midi_files_from_midi_event_builder(global_state.builder);
  files.forEach((file) => {
    if (Number(file.bank) === 0 && Number(file.pad) === 128) {
      return;
    }
    const link = document.createElement("a");
    const base_64_encoded_stringified_data = btoa(
      String.fromCharCode(...file.data)
    );
    link.href = `data:audio/midi;base64,${base_64_encoded_stringified_data}`;
    link.download = `${file.bank}-${file.pad}.mid`;
    link.click();
  });
}

export function register_ui_handlers_and_listeners(
  file_input: HTMLButtonElement,
  submit_button: HTMLButtonElement,
) {
  file_input.addEventListener("mousedown", () => {
    const el = document.createElement('input');
    el.type = "file";
    el.addEventListener("change", get_reader_on_file_select);
    el.addEventListener("change", (event) => {
      handle_submit_button_enabled_disabled_state(event, submit_button);
    });
    el.click();
  });

  submit_button.addEventListener("mousedown", async () => {
    if (!global_state.current_pattern_reader) {
      throw new Error(`
        No current reader set, please make sure current_pattern_reader is set to a valid reader,
        you should really make sure that button is disabled if we somehow got here
      `);
    }
    await handle_bin_file_ingress(global_state.current_pattern_reader);
    handle_midi_file_download();
  });

}
