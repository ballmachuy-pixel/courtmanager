/**
 * AssetService — Centralized file and storage management.
 */

import { BaseService } from './base.service';

export interface UploadResult {
  publicUrl: string | null;
  error: Error | null;
}

export class AssetService extends BaseService {
  constructor(academyId: string) {
    super(academyId);
  }

  /**
   * Upload an image (File or Buffer) to a specific bucket path
   */
  async uploadImage(
    bucket: string,
    path: string,
    file: File | Buffer,
    options: { contentType?: string; upsert?: boolean } = {}
  ): Promise<UploadResult> {
    try {
      const { data, error: uploadError } = await this.supabase.storage
        .from(bucket)
        .upload(path, file, {
          upsert: options.upsert ?? true,
          contentType: options.contentType || (file instanceof File ? file.type : 'image/jpeg')
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = this.supabase.storage.from(bucket).getPublicUrl(path);
      
      return {
        publicUrl: publicUrlData.publicUrl,
        error: null
      };
    } catch (err: any) {
      console.error('[AssetService] Upload error:', err);
      return {
        publicUrl: null,
        error: err
      };
    }
  }

  /**
   * Delete an asset from storage
   */
  async deleteAsset(bucket: string, path: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.supabase.storage.from(bucket).remove([path]);
      return { error };
    } catch (err: any) {
      return { error: err as Error };
    }
  }
}
