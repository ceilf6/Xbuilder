/**
 * Recording Implementation
 *
 * 这个文档描述了录屏功能的完整实现流程，从项目页面的录屏开始，
 * 到录屏状态管理，再到录屏记录的保存和编辑。
 */

import { recordingStore } from "./module_RecordingStore";
import { type RecordData, type RecordService } from "./module_RecordingApis";

// 声明 recordingApis 实例
declare const recordingApis: RecordService;

/**
 * 项目页面录屏管理
 */
export function useProjectRecording() {
  let isRecording = false;
  let showRecordingModal = false;

  // 开始录屏流程
  async function startRecording() {
    try {
      await ensureSignedIn();
      recordingStore.startRecording();
      isRecording = true;

      const screenshot = await captureScreenshot();
      const recorder = await startGameRecording(screenshot);
      showRecordingModal = true;
    } catch (error) {
      recordingStore.stopRecording();
      isRecording = false;
      console.error("录屏启动失败:", error);
    }
  }

  // 停止录屏流程
  async function stopRecording(): Promise<RecordingData> {
    try {
      recordingStore.stopRecording();
      isRecording = false;

      const videoBlob = await waitForVideoGeneration();
      const recordingData = await prepareRecordingData(videoBlob);

      return recordingData;
    } catch (error) {
      console.error("停止录屏失败:", error);
      throw error;
    }
  }

  // 保存录屏记录
  async function saveRecording(
    recordingData: RecordingData
  ): Promise<RecordData> {
    try {
      const videoUrl = await uploadVideoFile(recordingData.videoBlob);
      const thumbnailUrl = await uploadThumbnail(recordingData.thumbnail);

      const record = await recordingApis.createRecord({
        projectFullName: getCurrentProject().fullName,
        title: recordingData.title || `${getCurrentProject().name} 录屏`,
        description: recordingData.description || "",
        videoUrl,
        thumbnailUrl,
      });

      return record;
    } catch (error) {
      console.error("保存录屏失败:", error);
      throw error;
    }
  }

  return {
    isRecording,
    showRecordingModal,
    startRecording,
    stopRecording,
    saveRecording,
  };
}

/**
 * 录屏记录列表管理
 */
export function useRecordList() {
  let records: RecordData[] = [];
  let loading = false;

  // 加载录屏列表
  async function loadRecords(params: ListRecordParams) {
    try {
      loading = true;
      const response = await recordingApis.listRecord({
        owner: params.owner || getCurrentUser().username,
        ...(params as any),
      });
      records = response.data;
    } catch (err) {
      console.error("加载录屏列表失败:", err);
    } finally {
      loading = false;
    }
  }

  // 更新单个记录
  function updateRecord(updatedRecord: RecordData) {
    records = records.map((record) =>
      record.id === updatedRecord.id ? updatedRecord : record
    );
  }

  // 移除记录
  function removeRecord(recordId: string) {
    records = records.filter((record) => record.id !== recordId);
  }

  return {
    records,
    loading,
    loadRecords,
    updateRecord,
    removeRecord,
  };
}

/**
 * 录屏记录操作管理
 */
export function useRecordOperations() {
  let editModalVisible = false;
  let currentRecord: RecordData | null = null;

  // 编辑录屏
  async function handleEdit(record: RecordData) {
    currentRecord = record;
    editModalVisible = true;
  }

  // 删除录屏
  async function handleRemove(record: RecordData) {
    try {
      const confirmed = await showConfirmDialog({
        title: `删除录屏 ${record.title}`,
        content: `删除后的录屏无法恢复，确定要删除录屏 ${record.title} 吗？`,
      });

      if (confirmed) {
        await recordingApis.deleteRecord(record.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error("删除录屏失败:", error);
      throw error;
    }
  }

  // 处理编辑完成
  function handleEditComplete(updatedRecord: RecordData) {
    editModalVisible = false;
    currentRecord = null;
    return updatedRecord;
  }

  // 处理编辑取消
  function handleEditCancel() {
    editModalVisible = false;
    currentRecord = null;
  }

  return {
    editModalVisible,
    currentRecord,
    handleEdit,
    handleRemove,
    handleEditComplete,
    handleEditCancel,
  };
}

/**
 * 录屏编辑表单管理
 */
export function useRecordEditForm(record: RecordData) {
  let formData = {
    title: record.title,
    description: record.description,
  };
  let errors: Record<string, string> = {};
  let loading = false;

  // 提交表单
  async function handleSubmit(): Promise<RecordData> {
    try {
      loading = true;
      const updatedRecord = await recordingApis.updateRecord(record.id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
      });
      return updatedRecord;
    } catch (error) {
      console.error("更新录屏失败:", error);
      throw error;
    } finally {
      loading = false;
    }
  }

  // 更新表单字段
  function updateField(field: string, value: string) {
    formData = { ...formData, [field]: value };
  }

  return {
    formData,
    errors,
    loading,
    updateField,
    handleSubmit,
  };
}

/**
 * 使用示例：完整的录屏应用
 */
export function RecordingExample() {
  const recording = useProjectRecording();
  const recordList = useRecordList();
  const recordOperations = useRecordOperations();

  // 渲染录屏按钮
  const renderRecordButton = () => {
    return `
      <button onclick="handleStartRecording()">
        ${recording.isRecording ? "录制中..." : "开始录屏"}
      </button>
    `;
  };

  // 渲染录屏列表
  const renderRecordList = () => {
    return `
      <div class="record-list">
        ${recordList.records
          .map(
            (record) => `
          <div class="record-item">
            <h3>${record.title}</h3>
            <button onclick="handleEdit()">编辑</button>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  };

  // 渲染编辑弹窗
  const renderEditModal = () => {
    if (!recordOperations.currentRecord) return "";

    return `
      <div class="edit-modal">
        <form onsubmit="handleSubmitEdit(event)">
          <input type="text" value="${
            (recordOperations.currentRecord as any).title
          }" />
          <textarea>${
            (recordOperations.currentRecord as any).description
          }</textarea>
          <button type="button" onclick="handleCancelEdit()">取消</button>
          <button type="submit">保存</button>
        </form>
      </div>
    `;
  };

  // 返回完整的 HTML 模板
  return `
    <div class="recording-app">
      ${renderRecordButton()}
      ${renderRecordList()}
      ${renderEditModal()}
    </div>
  `;
}

/**
 * 数据类型定义
 */
interface RecordingData {
  videoBlob: Blob;
  thumbnail: string;
  title?: string;
  description?: string;
  duration: number;
  size: number;
}

interface ListRecordParams {
  owner?: string;
  page?: number;
  pageSize?: number;
  orderBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * 辅助函数声明
 */
declare function ensureSignedIn(): Promise<void>;
declare function captureScreenshot(): Promise<any>;
declare function startGameRecording(screenshot: any): Promise<MediaRecorder>;
declare function waitForVideoGeneration(): Promise<Blob>;
declare function prepareRecordingData(videoBlob: Blob): Promise<RecordingData>;
declare function uploadVideoFile(videoBlob: Blob): Promise<string>;
declare function uploadThumbnail(thumbnail: string): Promise<string>;
declare function showConfirmDialog(options: {
  title: string;
  content: string;
}): Promise<boolean>;
declare function getCurrentProject(): { fullName: string; name: string };
declare function getCurrentUser(): { username: string };
