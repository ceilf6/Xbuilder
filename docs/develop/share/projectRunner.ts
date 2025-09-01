export interface ProjectRunnerInstance {
  dispatchKeyToEvent(type: string, key: string, code: string): void;
}

export function ProjectRunner() {
  const projectRunnerRef: any = null;

  function dispatchKeyToEvent(type: string, key: string, code: string) {
    if (!projectRunnerRef) {
      console.warn("ProjectRunner 实例未初始化");
      return;
    }
    projectRunnerRef.dispatchKeyToEvent(type, key, code);
  }

  return {
    dispatchKeyToEvent,
    getInstance: () => projectRunnerRef,

    render: () => {
      return `
        <div class="project-runner">
          <!-- 项目运行器 UI -->
        </div>
      `;
    },
  };
}
