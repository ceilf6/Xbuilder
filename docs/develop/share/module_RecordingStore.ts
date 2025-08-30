/**
 * Centralized recording state management store
 *
 * Provides reactive recording state that can be shared across components.
 * Manages recording status, timing, and cross-component synchronization.
 */
export declare class RecordingStore {
  readonly isRecording: Readonly<Ref<boolean>>;
  readonly recordingStartTime: Readonly<Ref<number | null>>;
  readonly recordingDuration: Readonly<Ref<number>>;
  startRecording(): void;

  stopRecording(): void;

  getRecordingDuration(): number;

  formatRecordingTime(): string;

  dispose(): void;
}

export declare const recordingStore: RecordingStore;

/**
 * Vue Ref type for TypeScript support
 */
interface Ref<T> {
  value: T;
}
