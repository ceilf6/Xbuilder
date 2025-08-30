import { RecordData } from "./module_RecordingApis";

/**
 * Context (list) where the record item is used
 */
export type RecordItemContext = "public" | "mine" | "edit";

/**
 * Record Item component for displaying individual recordings
 *
 * Supports different contexts with varying functionality:
 * - public: Public record listings (view-only)
 * - mine: User's own records (with edit/delete)
 * - edit: Edit mode with additional operations
 */
export declare function RecordItem(
  props: {
    record: RecordData;
    context?: RecordItemContext;
  },
  emits: {
    /** Emitted when record item is selected/clicked */
    selected: () => void;
  }
);

/**
 * Record item operations and hooks
 */
export declare const recordItemOperations: {
  useEditRecord(): (record: RecordData) => Promise<RecordData>;

  useRemoveRecord(): (id: string, title: string) => Promise<void>;

  convertRecordUrl(universalUrl: string): string;

  getVideoDuration(videoUrl: string): Promise<number | null>;

  formatDuration(seconds: number): string;
};

/**
 * Record item display properties
 */
export interface RecordItemDisplay {
  thumbnailUrl: string;

  shouldShowAvatar: boolean;

  isOwner: boolean;

  operatable: boolean;

  to: string;
}
