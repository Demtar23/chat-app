import { cloudinary } from '../config/cloudinary';
import { Readable } from 'stream';

export async function uploadAvatar(
  buffer: Buffer,
  userId: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'avatars',
        public_id: `avatar_${userId}`,
        overwrite: true,
        transformation: [
          { width: 256, height: 256, crop: 'fill', gravity: 'face' },
          { fetch_format: 'webp', quality: 'auto' },
        ],
      },
      (error, result) => {
        if (error || !result)
          return reject(error ?? new Error('Upload failed'));
        resolve(result.secure_url);
      },
    );

    Readable.from(buffer).pipe(uploadStream);
  });
}

export async function deleteAvatar(userId: string): Promise<void> {
  await cloudinary.uploader.destroy(`avatars/avatar_${userId}`);
}
