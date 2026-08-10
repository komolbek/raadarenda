import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { UTApi } from 'uploadthing/server';

interface MulterFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

@Injectable()
export class AdminUploadService {
  private readonly logger = new Logger(AdminUploadService.name);
  // Reads UPLOADTHING_TOKEN from the environment.
  private readonly utapi = new UTApi();

  async uploadImage(file?: MulterFile) {
    if (!file || !file.buffer) {
      throw new BadRequestException('No image file provided');
    }

    if (file.mimetype && !file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }

    const upload = new File([file.buffer], file.originalname || 'image.jpg', {
      type: file.mimetype || 'image/jpeg',
    });

    try {
      const result = await this.utapi.uploadFiles(upload);
      if (result.error || !result.data) {
        this.logger.error(
          `UploadThing upload failed: ${JSON.stringify(result.error)}`,
        );
        throw new InternalServerErrorException('Image upload failed');
      }

      // v7 exposes `ufsUrl`; `url` is kept for backwards compatibility.
      const data = result.data as { ufsUrl?: string; url?: string; key: string };
      return { url: data.ufsUrl || data.url, key: data.key };
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      this.logger.error(`Image upload error: ${String(err)}`);
      throw new InternalServerErrorException('Image upload failed');
    }
  }
}
