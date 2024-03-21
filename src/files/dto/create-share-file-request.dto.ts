import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator'

export class Restrictions {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  readonly expiresIn: number

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  readonly viewCount?: number

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  readonly downloadEnabled?: boolean

  @ApiProperty()
  @IsOptional()
  @IsArray()
  readonly sharedWithUsers?: string[]

  constructor(expiresIn: number, viewCount?: number, downloadEnabled?: boolean, sharedWithUsers?: string[]) {
    this.expiresIn = expiresIn
    this.viewCount = viewCount
    this.downloadEnabled = downloadEnabled
    this.sharedWithUsers = sharedWithUsers
  }
}

export class FileShareDetails {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly type: 'public' | 'private'

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly documentType: string

  @ApiProperty()
  @ValidateNested()
  readonly restrictions: Restrictions

  constructor(type: 'public' | 'private', documentType: string, restrictions: Restrictions) {
    this.type = type
    this.documentType = documentType
    this.restrictions = restrictions
  }
}

export class CreateShareFileRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly fileId: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly status: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly fileShareUrl: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly raisedByUser: string

  @ApiProperty()
  @IsString()
  readonly fileOwnerUser: string

  @ApiProperty()
  @ValidateNested()
  readonly fileShareDetails: FileShareDetails

  constructor(
    fileId: string,
    status: string,
    fileShareUrl: string,
    raisedByUser: string,
    fileOwnerUser: string,
    fileShareDetails: FileShareDetails,
  ) {
    this.fileId = fileId
    this.status = status
    this.fileShareUrl = fileShareUrl
    this.raisedByUser = raisedByUser
    this.fileOwnerUser = fileOwnerUser
    this.fileShareDetails = fileShareDetails
  }
}
