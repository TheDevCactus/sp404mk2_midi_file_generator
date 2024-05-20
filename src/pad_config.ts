
type PadID = string;
type PadInfo = {

};
type PadCollection = Record<PadID, PadInfo>;
type BankID = string;
type BankInfo = Record<BankID, PadCollection>;

const PROJECT_NAME_OFFSET = 128;
const PROJECT_NAME_SIZE = 24;
const BANKS_ON_MACHINE = 10;

const BYTES_IN_BANK = 384;
const FIRST_BANK_OFFSET = 0x00006C20;
const SAMPLE_NAME_SIZE = 24;

export const bank_name_lookup = {
  0: 'A',
  1: 'B',
  2: 'C',
  3: 'D',
  4: 'E',
  5: 'F',
  6: 'G',
  7: 'H',
  8: 'I',
  9: 'J',
} as const;

const EMPTY_PAD = "                       \x00";

export class PadConfigBuilder {
  bank_info: BankInfo;
  constructor() {
    this.bank_info = {};

    this.process_value = this.process_value.bind(this);
  }
  process_value(value: Uint8Array) {
    const project_name = value.slice(PROJECT_NAME_OFFSET, PROJECT_NAME_OFFSET + PROJECT_NAME_SIZE);
    console.log(project_name);
    for (let i = 0; i < BANKS_ON_MACHINE; i++) {
      const first_byte_offset = FIRST_BANK_OFFSET + BYTES_IN_BANK * i;
      const bank_name = bank_name_lookup[i as keyof typeof bank_name_lookup];
      if (!Object.prototype.hasOwnProperty.call(this.bank_info, bank_name)) {
        this.bank_info[bank_name] = {};
      }
      const pad_names_for_bank = value.slice(first_byte_offset, first_byte_offset + BYTES_IN_BANK);
      if (pad_names_for_bank[0] === 0xFF) {
        continue;
      }
      for (let j = 0; j < BYTES_IN_BANK; j += SAMPLE_NAME_SIZE) {
        const pad_index = j / SAMPLE_NAME_SIZE;
        const sample_name_raw = pad_names_for_bank.slice(j, j + SAMPLE_NAME_SIZE);
        const slice_at = sample_name_raw.findIndex((value) => {
          return value === 0x00;
        })
        const sliced_name_raw = sample_name_raw.slice(0, slice_at);
        const stringified_sample_name = new TextDecoder().decode(sliced_name_raw);
        if (stringified_sample_name === EMPTY_PAD) {
          continue;
        }
        this.bank_info[bank_name][pad_index] = stringified_sample_name
      }
    }

    console.log(this.bank_info);

  }
}