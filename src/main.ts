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
            1: Click the "Upload Pattern Bin File" button and select your pattern bin you wish to generate midi files for.
            <br/>
            <br/>
            2: Optionally, Click the "Upload Pad Config File" button and select your projects PADCONF.BIN file. This lets us build better file names for you including the sample name.
            <br/>
            <br/>
            3: Click the "Save As Midi Files" button.
            <br/>
            <br/>
            Midi files will be downloaded individually.
            If a pad config file was uploaded, the file names will be as follows
            <br/>
            <br/>
            <b>"{BANK_NAME}_{SAMPLE_NAME}.mid"</b>
            <br/>
            <br/>
            Otherwise, file names will be as follows. 
            <br/>
            <br/>
            <b>"{BANK_NAME}_{PAD_ID}.mid"</b>
          </p>
        </div>
        <hr />
        <div class="text_container" id="blurb">
          <p>
            Half way through developing this, I found out that Rolands SP404mk2 application does export to midi.
            But it exports all pads to one midi file which annoyed me while trying to get projects into a daw.
            So this project exports each pad as an individual midi pattern.
          </p>
          <p>
            This is very much a work in progress and has not been battle tested, If you find any bugs, or would like a
            feature added, please submit an issue in <a href="https://github.com/TheDevCactus/sp404mk2_midi_file_generator/issues/new/choose">GitHub</a>.
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