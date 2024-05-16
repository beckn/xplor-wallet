import { ApiProperty } from '@nestjs/swagger'

export class FileEntity {
  @ApiProperty({ example: '65f058277901e68a7df6db35' })
  _id: string

  @ApiProperty({ example: '61h053277501e68a7d76db85' })
  walletId: string

  @ApiProperty({ example: 'application/pdf' })
  fileType: string

  @ApiProperty({ example: 'https://example.com/files/example.pdf' })
  storedUrl: string

  @ApiProperty({ example: 'example.pdf' })
  fileKey: string
}

export class FilesListEntity {
  @ApiProperty({ type: [FileEntity] })
  data: FileEntity[]
}
