/**
 * Capsule Types - TypeScript interfaces for Capsule API
 * Matches backend schema from model-swap-router
 */

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: MessageRole;
  content: string;
  timestamp?: string;
}

export interface CapsuleContent {
  messages: ChatMessage[];
  metadata?: Record<string, any>;
}

export interface CapsuleMetadata {
  capsule_id: string;
  tag?: string;
  summary?: string;
  created_at: string;
  created_by?: string;
  team?: string;
  latest_version_id?: string;
  version_count: number;
  extracted_from: string[];
}

export interface CapsuleVersion {
  version_id: string;
  capsule_id: string;
  parent_version_id?: string;
  content_hash: string;
  content: CapsuleContent;
  created_at: string;
  created_by?: string;
  extracted_from?: string;
}

export interface CreateCapsuleRequest {
  content: CapsuleContent;
  tag?: string;
  team?: string;
  extracted_from?: string;
}

export interface CreateCapsuleResponse {
  capsule_id: string;
  version_id: string;
  content_hash: string;
  extracted_from?: string;
}

export interface CreateVersionRequest {
  content: CapsuleContent;
  parent_version_id?: string;
  extracted_from?: string;
}

export interface CreateVersionResponse {
  capsule_id: string;
  version_id: string;
  content_hash: string;
  parent_version_id?: string;
  extracted_from?: string;
}

export interface SearchCapsuleRequest {
  summary_query?: string;
  min_version_count?: number;
  max_version_count?: number;
  tag?: string;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  capsule_id: string;
  tag?: string;
  summary?: string;
  created_at: string;
  created_by?: string;
  team?: string;
  version_count: number;
  latest_version_id?: string;
  extracted_from: string[];
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  limit: number;
  offset: number;
}

export interface VersionMetadata {
  version_id: string;
  parent_version_id?: string;
  content_hash: string;
  created_at: string;
  created_by?: string;
  extracted_from?: string;
}

export interface VersionListResponse {
  capsule_id: string;
  versions: VersionMetadata[];
}
