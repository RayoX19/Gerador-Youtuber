export type Mode = 'create' | 'edit' | 'video';

export type CreateFunction = 'free' | 'sticker' | 'text' | 'comic' | 'banner' | 'thumbnail' | 'adult';

export type EditFunction = 'add-remove' | 'retouch' | 'style' | 'compose';

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export interface UploadedImage {
  file: File;
  previewUrl: string;
}

// Types for AI Assistant
export interface KnowledgeEntry {
    keywords: string[];
    response: string;
}

// --- NEW TYPES for AI Developer ---
export interface ModifiedFile {
    path: string;
    content: string;
}

export interface CodeModification {
    explanation: string;
    files: ModifiedFile[];
}

// --- UPDATED ChatMessage ---
export interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
    codeModification?: CodeModification;
}