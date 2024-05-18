import "./style.css";
import { register_ui_handlers_and_listeners } from "./ui_management.ts";

const UPLOAD_PATTERN_BIN_FILE_ELEMENT_ID = "pattern_file_upload";
const UPLOAD_PAD_CONFIG_FILE_ELEMENT_ID = "pad_config_file_upload";
const SAVE_AS_MIDI_FILE_BUTTON_ELEMENT_ID = "build_midi_files";

function get_el_by_id_or_error(id: string) {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error("Element not found, make sure ID's match and that the element is in the DOM");
  }
  return el;
}

function initialize_ui() {
  document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
    <img src="bg_img.png" width="600" id="bg_img" />
    <div id="outer_container">
      <div id="inner_container">
        <h2>SP404 Midi File Generator 0.1</h2>
        <button id="${UPLOAD_PATTERN_BIN_FILE_ELEMENT_ID}">Upload Pattern Bin File</button>
        <button id="${UPLOAD_PAD_CONFIG_FILE_ELEMENT_ID}">Upload Pad Config File - Optional</button>
        <button disabled id="${SAVE_AS_MIDI_FILE_BUTTON_ELEMENT_ID}">Save As Midi Files</button>
        <div class="text_container" id="instructions_container">
          <h4>Usage</h4>
          <p>
            1: Click the "Upload Pattern Bin File" and select your pattern bin you wish to generate midi files for.
            <br/>
            <br/>
            2: Click the "Save As Midi Files" button.
            <br/>
            <br/>
            3: Midi file names
            <br/>
            <br/>
            &nbsp;&nbsp;a: Pad Config Uploaded 
            <br/>
            &nbsp;&nbsp;"{BANK_NAME}_{SAMPLE_NAME}.mid"
            <br/>
            <br/>
            &nbsp;&nbsp;b: Pad Config Not Uploaded 
            <br/>
            &nbsp;&nbsp;"{BANK_NAME}_{PAD_ID}.mid"
          </p>
        </div>
        <hr />
        <div class="text_container" id="blurb">
          <p>
            Rolands application does export to midi but it exports all pads to one midi file which annoyed me while trying to get projects into a daw.
            So this project exports each pad as an individual midi pattern.
          </p>
        </div>
      </div>
    </div>
    <footer>
      <a href="https://buymeacoffee.com/morgan_brown">Throw me a dollar</a>
      <a href="https://thedevcactus.github.io/SamplerBlog/">$250 Sampler project</a>
      <a href="https://github.com/TheDevCactus/sp404mk2_midi_file_generator">My Github (sourcecode for this site)</a>
    </footer>
  `;

  register_ui_handlers_and_listeners(
    get_el_by_id_or_error(UPLOAD_PATTERN_BIN_FILE_ELEMENT_ID) as HTMLButtonElement,
    get_el_by_id_or_error(UPLOAD_PAD_CONFIG_FILE_ELEMENT_ID) as HTMLButtonElement,
    get_el_by_id_or_error(SAVE_AS_MIDI_FILE_BUTTON_ELEMENT_ID) as HTMLButtonElement
  );
}

initialize_ui();