export interface TaskAttachment {
  id: string;
  taskId: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  uploadedAt: string;
  uploadedByStakeholderId: string;
}

export interface TaskAttachmentsResponse {
  items: TaskAttachment[];
}

export interface UploadAttachmentResponse {
  id: string;
}
