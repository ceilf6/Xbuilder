import { RecordData, RecordService } from "./module_RecordingApis";

export declare function RecordEditModal(
  props: {
    record: RecordData;

    visible: boolean;

    recordService: RecordService;
  },

  emits: {
    cancelled: () => void;
    resolved: (updatedRecord: RecordData) => void;
  }
);

/**
 * Form validation result type
 */
export type FormValidationResult = string | null;

/**
 * Edit form data structure
 */
export interface RecordEditForm {
  title: string;

  description: string;
}

/**
 * Form validation functions
 */
export declare const formValidation: {
  validateTitle(title: string): FormValidationResult;

  validateDescription(description: string): FormValidationResult;
};

/**
 * Form constraints
 */
export declare const formConstraints: {
  MAX_TITLE_LENGTH: 100;

  MAX_DESCRIPTION_LENGTH: 1000;
};
