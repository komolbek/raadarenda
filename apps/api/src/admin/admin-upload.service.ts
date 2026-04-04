import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminUploadService {
  async uploadImage(_file: any) {
    // TODO: Integrate UploadThing later
    return {
      url: `https://utfs.io/placeholder/${Date.now()}.jpg`,
      placeholder: true,
      message: 'Upload integration pending. This is a placeholder response.',
    };
  }
}
