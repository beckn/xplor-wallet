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

      console.log('Signed URL:', signedUrl)
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
        LocationConstraint: process.env.STORAGE_REGION,
      },
    }

    try {
      const s3Response = await this.s3.upload(params).promise()
      return s3Response
    } catch (e) {
      console.log(e)
    }
  }
}
