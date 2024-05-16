import './style.css'
import { setup_file_upload_ui } from './file_upload.ts';
import { download_test_midi_file } from './midi_constructor.ts';

const BUILD_PATTERN_FILE_UPLOAD_ELEMENT_ID = "pattern_file_upload";
const BUILD_PATTERN_BUTTON_ELEMENT_ID = "build_pattern";
const SAMPLES_FILE_UPLOAD_ELEMENT_ID = "samples_file_upload";
const BUILD_SAMPLES_BUTTON_ELEMENT_ID = "build_samples";

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
 <div>
  <div class="column">
    <label for="${BUILD_PATTERN_FILE_UPLOAD_ELEMENT_ID}">Pattern Bin File Upload</label>
    <input required type="file" id="${BUILD_PATTERN_FILE_UPLOAD_ELEMENT_ID}" />
    <button disabled id="${BUILD_PATTERN_BUTTON_ELEMENT_ID}">Build Pattern</button>
  </div>
  <div class="column">
    <label for="${SAMPLES_FILE_UPLOAD_ELEMENT_ID}">Samples Bin File Upload</label>
    <input type="file" id="${SAMPLES_FILE_UPLOAD_ELEMENT_ID}" />
    <button id="${BUILD_SAMPLES_BUTTON_ELEMENT_ID}">Build Samples</button>
  </div>
  <button id="test">test</button>
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

setup_file_upload_ui(pattern_builder_file_upload_input, pattern_builder_submit_button);

const test_button = document.querySelector<HTMLButtonElement>("#test");
if (!test_button) {
  throw new Error("Failed to find the test button");
}
test_button.addEventListener("click", () => {
  download_test_midi_file();
});