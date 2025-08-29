export interface ProjectRunnerInstance {
  dispatchKeyToEvent(type: string, key: string, code: string): void;
}

export function ProjectRunner() {
  const projectRunnerRef: any = null;

  function dispatchKeyToEvent(type, key, code) {
    if (!projectRunnerRef) {
      return;
    }
    projectRunnerRef.dispatchKeyToEvent(type, key, code);
  }

  return `<ProjectRunnerV2 ref={projectRunnerRef} />`;
}
