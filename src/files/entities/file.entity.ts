import { ApiProperty } from '@nestjs/swagger'

export class FileEntity {
  @ApiProperty({ example: '65f058277901e68a7df6db35' })
  _id: string

  @ApiProperty({ example: '61h053277501e68a7d76db85' })
  userId: string

  @ApiProperty({ example: 'pdf' })
  fileType: string

  @ApiProperty({ example: ['important', 'finance'] })
  fileTags: string[]

  @ApiProperty({ example: 'example.pdf' })
  fileName: string

  @ApiProperty({ example: false })
  softDeleted: boolean

  @ApiProperty({ example: 'example_file_key' })
  fileKey: string

  @ApiProperty({ example: 'https://example.com/files/example.pdf' })
  fileUrl: string

  @ApiProperty({
    example: {
      author: 'John Doe',
      created_at: '2024-03-12T13:27:03.696Z',
      size: '2MB',
    },
  })
  metadata: Record<string, any>
}

export class FilesListEntity {
  @ApiProperty({ type: [FileEntity] })
  data: FileEntity[]
}
