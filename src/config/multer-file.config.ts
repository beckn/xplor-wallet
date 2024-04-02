import { HttpException, HttpStatus } from '@nestjs/common'
import { MulterModuleOptions } from '@nestjs/platform-express'
import { extname } from 'path'

export const multerFileUploadConfig: MulterModuleOptions = {
  limits: {
    files: 1,
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
      // Handle any synchronous errorss
      cb(error, false)
    }
  },
  // storage: diskStorage({
  //   destination: './file-uploads',
  //   filename: (req, file, cb) => {
  //     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
  //     const extension = extname(file.originalname)
  //     cb(null, file.fieldname + '-' + uniqueSuffix + extension)
  //   },
  // }),
}
