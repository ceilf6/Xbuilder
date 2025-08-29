export interface IframeWindow extends Window {
  __xb_is_stale?: boolean;
}

export interface ProjectRunnerV2 {
  dispatchKeyToEvent(type: string, key: string, code: string): void;
}

export abstract class ProjectRunnerV2 implements ProjectRunnerV2 {
  protected iframeWindow: IframeWindow | null = null;

  dispatchKeyToEvent(type: string, key: string, code: string): void {
    if (!this.iframeWindow) {
      console.warn("ProjectRunner: iframe not ready, ignoring key event");
      return;
    }

    const doc = this.iframeWindow.document;
    const canvas = doc.querySelector("#game-canvas") as HTMLElement | null;

    const event = new KeyboardEvent(type, {
      key,
      code,
      bubbles: true,
      cancelable: true,
    });

    if (canvas) {
      // Preferred: dispatch to game canvas
      canvas.focus();
      canvas.dispatchEvent(event);
    } else {
      // Fallback: dispatch to document
      console.warn(
        "ProjectRunner: game canvas not found, dispatching to document"
      );
      this.iframeWindow.focus();
      doc.dispatchEvent(event);
    }
  }
}
