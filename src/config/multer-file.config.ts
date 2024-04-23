import { HttpException, HttpStatus } from '@nestjs/common'
import { MulterModuleOptions } from '@nestjs/platform-express'
import { extname } from 'path'

export const multerFileUploadConfig: MulterModuleOptions = {
  limits: {
    files: 1,
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    try {
      // Synchronous validation logic
      if (file.mimetype.match(/\/(jpg|jpeg|png|pdf|doc|json|xml|)$/) || file.mimetype == 'application/octet-stream') {
        // Allow storage of file
        cb(null, true)
      } else {
        // Reject file
        cb(new HttpException(`Unsupported file type ${extname(file.originalname)}`, HttpStatus.BAD_REQUEST), false)
      }
    } catch (error) {
      // Handle any synchronous errors
      cb(error, false)
    }
  },
}
