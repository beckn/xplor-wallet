import { IsArray, IsBoolean, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator'

export class CreateFileDto {
  @IsString()
  @IsNotEmpty()
  readonly userId: string

  @IsString()
  @IsNotEmpty()
  readonly fileType: string

  @IsArray()
  @IsString({ each: true })
  readonly fileTags: string[]

  @IsString()
  @IsNotEmpty()
  readonly fileName: string

  @IsBoolean()
  @IsOptional()
  readonly softDeleted?: boolean

  @IsString()
  @IsNotEmpty()
  fileKey: string // AWS Key for the file

  @IsString()
  @IsNotEmpty()
  fileUrl: string // Restricted url to be hit from front end

  @IsOptional()
  @IsObject()
  readonly metadata?: Record<string, any>

  constructor(
    userId: string,
    fileType: string,
    fileTags: string[],
    fileName: string,
    fileKey: string,
    fileUrl: string,
    softDeleted?: boolean,
    metadata?: Record<string, any>,
  ) {
    this.userId = userId
    this.fileType = fileType
    this.fileTags = fileTags
    this.fileName = fileName
    this.softDeleted = softDeleted
    this.fileKey = fileKey
    this.fileUrl = fileUrl
    this.metadata = metadata
  }
}
