import { ApiProperty } from '@nestjs/swagger'

export class ShareRequestEntity {
  @ApiProperty({ example: 'fileId123' })
  fileId: string

  @ApiProperty({ example: 'ACCEPTED' })
  status: string

  @ApiProperty({ example: 'https://example.com/fileUrl' })
  fileShareUrl: string

  @ApiProperty({ example: 'userId123' })
  raisedByUser: string

  @ApiProperty({ example: 'fileOwnerUserId123' })
  fileOwnerUser: string

  @ApiProperty({
    example: {
      type: 'public',
      documentType: '10th board result',
      restrictions: {
        expireTimeStamp: 1648764000,
        viewCount: 5,
        downloadEnabled: true,
        sharedWithUsers: ['userId1', 'userId2'],
      },
    },
  })
  fileShareDetails: {
    type: string
    documentType: string
    restrictions: {
      expireTimeStamp: number
      viewCount?: number
      downloadEnabled?: boolean
      sharedWithUsers?: string[]
    }
  }
}

export class ShareRequestsEntityList {
  @ApiProperty({ type: [ShareRequestEntity] })
  data: ShareRequestEntity[]
}

module.exports = {
  ShareRequestEntity,
  ShareRequestsEntityList,
}
