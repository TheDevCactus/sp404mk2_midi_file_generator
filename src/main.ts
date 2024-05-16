import './style.css'
import { register_ui_handlers_and_listeners } from './file_upload.ts';

const BUILD_PATTERN_FILE_UPLOAD_ELEMENT_ID = "pattern_file_upload";
const SAVE_AS_MIDI_FILE_BUTTON_ELEMENT_ID = "build_midi_files";

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
 <img src="bg_img.png" width="600" id="bg_img" />
 <div id="outer_container">
  <div id="inner_container">
    <h2>SP404 Midi File Generator</h2>
    <button id="${BUILD_PATTERN_FILE_UPLOAD_ELEMENT_ID}">Upload Pattern Bin File</button>
    <button disabled id="${SAVE_AS_MIDI_FILE_BUTTON_ELEMENT_ID}">Save As Midi Files</button>
    <div class="text_container" id="instructions_container">
      <h4>Usage</h4>
      <p>
        1: Click the "Upload Pattern Bin File" and select your pattern bin you wish to generate midi files for.
        <br/>
        <br/>
        2: Click the "Build Midi Files" button.
        <br/>
        <br/>
        3: Midi files names will be in the following format
        <br/>
        <br/>
        "{BANK_ID}_{PAD_ID}.mid"
        <br/>
        <br/>
        I know this is whack, Coming soon i'll allow for also uploading the .SMP files for your exported project which will allow for better naming of the exports.
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
`

const pattern_builder_file_upload_input = document.querySelector<HTMLButtonElement>(`#${BUILD_PATTERN_FILE_UPLOAD_ELEMENT_ID}`);
if (!pattern_builder_file_upload_input) {
  throw new Error("Failed to find the pattern file upload input. make sure ids match")
}
const pattern_builder_submit_button = document.querySelector<HTMLButtonElement>(`#${SAVE_AS_MIDI_FILE_BUTTON_ELEMENT_ID}`);
if (!pattern_builder_submit_button) {
  throw new Error("Failed to find the pattern builders submit button. make sure ids match");
}

register_ui_handlers_and_listeners(pattern_builder_file_upload_input, pattern_builder_submit_button);
