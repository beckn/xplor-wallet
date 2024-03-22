<<<<<<< HEAD
import { ConsoleLogger, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as AWS from 'aws-sdk'
import { AWSError } from 'aws-sdk'

@Injectable()
export class S3StorageService {
  AWS_S3_BUCKET
  s3
  constructor(private readonly configService: ConfigService) {
    this.AWS_S3_BUCKET = this.configService.get('STORAGE_BUCKET_NAME')
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('SECRET_ACCESS_KEY'),
      signatureVersion: 'v4',
      region: this.configService.get('STORAGE_REGION'),
    })
  }

  async uploadFile(file: Express.Multer.File | any) {
    ConsoleLogger
    return await this.s3_upload(file.buffer, new Date().getTime() + file.originalname, file.mimetype)
=======
import * as AWS from 'aws-sdk'
import { AWSError } from 'aws-sdk'
import * as fs from 'fs'
export class S3StorageService {
  AWS_S3_BUCKET = process.env.STORAGE_BUCKET_NAME

  s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    signatureVersion: 'v4',
    region: process.env.STORAGE_REGION,
  })

  async uploadFile(file) {
    console.log(file)
    const { filename } = file
    const fileStream = fs.createReadStream(file.path)
    return await this.s3_upload(fileStream, filename, file.mimetype)
>>>>>>> develop
  }

  async getSignedFileUrl(expiresIn: number, fileKey: string): Promise<string> {
    try {
      // Define the parameters for generating the pre-signed URL
      const params = {
        Bucket: this.AWS_S3_BUCKET,
        Key: fileKey,
        Expires: expiresIn * 60 * 60,
      }

      // Generate the pre-signed URL using getSignedUrlPromise method
      const signedUrl = await this.s3.getSignedUrlPromise('getObject', params)

<<<<<<< HEAD
=======
      console.log('Signed URL:', signedUrl)
>>>>>>> develop
      return signedUrl
    } catch (e) {
      console.error('Error generating signed URL:', e as AWSError)
      throw e
    }
  }

  private async s3_upload(file, name, mimetype) {
    const params = {
      Bucket: this.AWS_S3_BUCKET,
      Key: String(name),
      Body: file,
      ContentType: mimetype,
      ContentDisposition: 'inline',
      CreateBucketConfiguration: {
<<<<<<< HEAD
        LocationConstraint: this.configService.get('STORAGE_REGION'),
      },
    }
    const s3Response = await this.s3.upload(params).promise()
    return s3Response
=======
        LocationConstraint: process.env.STORAGE_REGION,
      },
    }

    try {
      const s3Response = await this.s3.upload(params).promise()
      return s3Response
    } catch (e) {
      console.log(e)
    }
>>>>>>> develop
  }
}
