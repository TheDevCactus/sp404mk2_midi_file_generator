import './style.css'
import { register_ui_handlers_and_listeners } from './file_upload.ts';

const BUILD_PATTERN_FILE_UPLOAD_ELEMENT_ID = "pattern_file_upload";
const BUILD_PATTERN_BUTTON_ELEMENT_ID = "build_pattern";
const SAVE_OUTPUT_PATTERNS_BUTTON_ELEMENT_ID = "save_pattern_to_midi_files";
const PREVIEW_CONTAINER_ID = "preview_container";

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
 <div>
  <div class="column">
    <label for="${BUILD_PATTERN_FILE_UPLOAD_ELEMENT_ID}">Pattern Bin File Upload</label>
    <input required type="file" id="${BUILD_PATTERN_FILE_UPLOAD_ELEMENT_ID}" />
    <button disabled id="${BUILD_PATTERN_BUTTON_ELEMENT_ID}">Build Pattern</button>
    <div id="${PREVIEW_CONTAINER_ID}"></div>
    <button disabled id="${SAVE_OUTPUT_PATTERNS_BUTTON_ELEMENT_ID}">Save Pattern To Midi Files</button>
  </div>
 </div>
`

const pattern_builder_file_upload_input = document.querySelector<HTMLInputElement>(`#${BUILD_PATTERN_FILE_UPLOAD_ELEMENT_ID}`);
if (!pattern_builder_file_upload_input) {
  throw new Error("Failed to find the pattern file upload input. make sure ids match")
}
const pattern_builder_submit_button = document.querySelector<HTMLButtonElement>(`#${BUILD_PATTERN_BUTTON_ELEMENT_ID}`);
if (!pattern_builder_submit_button) {
  throw new Error("Failed to find the pattern builders submit button. make sure ids match");
}
const save_output_patterns_button = document.querySelector<HTMLButtonElement>(`#${SAVE_OUTPUT_PATTERNS_BUTTON_ELEMENT_ID}`);
if (!save_output_patterns_button) {
  throw new Error("Failed to find the save pattern to midi files button. make sure ids match");
}
const preview_container = document.querySelector<HTMLDivElement>(`#${PREVIEW_CONTAINER_ID}`);
if (!preview_container) {
  throw new Error("Failed to find preview container in dom. make sure ids match");
}
register_ui_handlers_and_listeners(pattern_builder_file_upload_input, pattern_builder_submit_button, save_output_patterns_button, preview_container);
