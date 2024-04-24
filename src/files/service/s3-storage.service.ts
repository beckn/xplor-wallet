import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as AWS from 'aws-sdk'
import { AWSError } from 'aws-sdk'
import { IStorageService } from '../../common/constants/interface-storage-service'
import { MaxVCShareHours } from '../../common/constants/name-constants'
import { GrafanaLoggerService } from 'src/grafana/service/grafana.service'

@Injectable()
export class S3StorageService implements IStorageService {
  AWS_S3_BUCKET
  s3
  constructor(private readonly configService: ConfigService, private readonly loggerService: GrafanaLoggerService) {
    this.AWS_S3_BUCKET = this.configService.get('STORAGE_BUCKET_NAME')
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('SECRET_ACCESS_KEY'),
      signatureVersion: 'v4',
      region: this.configService.get('STORAGE_REGION'),
    })
  }

  async deleteFileUrl(fileKey: string) {
    try {
      const params = {
        Bucket: this.AWS_S3_BUCKET,
        Key: fileKey,
      }
      await this.s3.deleteObject(params).promise()
      return true
    } catch (err) {
      this.loggerService.sendDebug({
        message: `error deleting file from S3 Bucket ${err}`,
        methodName: this.deleteFileUrl.name,
      })
      return false
    }
  }

  async refreshFileUrl(fileKey: string): Promise<string> {
    return await this.getSignedFileUrl(MaxVCShareHours, fileKey)
  }

  /**
   * Uploads a file from Multer to AWS S3 bucket and returns the stored files details
   */
  async uploadFile(file: Express.Multer.File | any): Promise<any> {
    const fileResult = {}
    const uploadedFile = await this.s3_upload(file.buffer, new Date().getTime() + file.originalname, file.mimetype)
    fileResult['uploadedFile'] = uploadedFile
    fileResult['signedUrl'] = await this.getSignedFileUrl(MaxVCShareHours, uploadedFile['key'])
    return fileResult
  }

  /**
   * Signs the uploaded File for given expiration hours and fileKey
   */
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

      return signedUrl
    } catch (err) {
      this.loggerService.sendDebug({
        message: `Error generating signed URL:  ${err as AWSError}`,
        methodName: this.deleteFileUrl.name,
      })
      throw err
    }
  }

  /**
   * Internal implementation to upload the file to bucket
   */
  private async s3_upload(file, name, mimetype) {
    const params = {
      Bucket: this.AWS_S3_BUCKET,
      Key: String(name),
      Body: file,
      ContentType: mimetype,
      ContentDisposition: 'inline',
      CreateBucketConfiguration: {
        LocationConstraint: this.configService.get('STORAGE_REGION'),
      },
    }
    const s3Response = await this.s3.upload(params).promise()
    return s3Response
  }
}
