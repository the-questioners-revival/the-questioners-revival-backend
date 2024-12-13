import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagesService } from './images.service';
import { diskStorage } from 'multer'; // Import diskStorage to customize file storage

@Controller('images')
export class ImagesController {
  constructor(private readonly imageService: ImagesService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        // Define the destination folder for uploaded files
        destination: './uploads/',

        // Customize the filename for each file uploaded
        filename: (req, file, cb) => {
          cb(null, file.originalname); // Pass the new filename to Multer
        },
      }),
    }),
  )
  async uploadImage(@UploadedFile() file: any) {
    const newImage = this.imageService.saveImage(file);

    return newImage;
  }
}
