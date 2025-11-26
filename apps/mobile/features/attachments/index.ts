// Attachments Feature Barrel File

// Components
export {AttachmentKindGrid} from './components/attachment-kind-grid';
export {AttachmentAddOptions} from './components/attachment-add-options';
export {AttachmentUploadPreviewCard} from './components/attachment-upload-preview-card';
export {AttachmentDestinationCard} from './components/attachment-destination-card';
export {AttachmentImagePreview} from './components/attachment-image-preview';
export {AttachmentDocumentPreview} from './components/attachment-document-preview';
export {SelectableImageTile} from './components/selectable-image-tile';
export {VaultActionsMenu} from './components/vault-actions-menu';
export {VaultOptionsMenu} from './components/vault-options-menu';

// Types
export type {AttachmentKindTile} from './components/attachment-kind-grid';
export type {AttachmentKindCount} from './utils/attachment-counts';

// Utils
export {computeAttachmentCounts} from './utils/attachment-counts';

// Hooks
export {useAttachmentUpload} from './hooks/use-attachment-upload';
export {useImageSelection} from './hooks/use-image-selection';
export {useFilteredAttachments} from './hooks/use-filtered-attachments';
export {useAttachmentsOverview} from './hooks/use-attachments-overview';
export {useAttachmentImages} from './hooks/use-attachment-images';
export {
  useAttachmentsByKind,
  useAttachmentDocuments,
  useAttachmentArchives,
  useAttachmentOther,
} from './hooks/use-attachments-by-kind';
export {useAttachmentNavigation} from './hooks/use-attachment-navigation';
export {useAttachmentSearch} from './hooks/use-attachment-search';
export {useAttachmentPress} from './hooks/use-attachment-press';

// Screens
export {AttachmentsOverview} from './screens/attachments-overview';
export {DocumentsList} from './screens/documents';
