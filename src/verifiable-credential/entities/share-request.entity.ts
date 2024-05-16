import { ApiProperty } from '@nestjs/swagger'

export class ShareRequestEntity {
  @ApiProperty({ example: 'request_fnkjdsnfkjsdnfjk' })
  _id: string

  @ApiProperty({ example: 'vc_fnkjdsnfkjsdnfjk' })
  vcId: string

  @ApiProperty({ example: 'ACCEPTED' })
  status: string

  @ApiProperty({ example: 'https://example.com/fileUrl' })
  restrictedUrl: string

  @ApiProperty({ example: 'wallet_628fdsfsds34324' })
  raisedByWallet: string

  @ApiProperty({ example: 'I am sharing this file.' })
  remarks: string

  @ApiProperty({ example: 'wallet_628fdsfsds34324' })
  vcOwnerWallet: string

  @ApiProperty({
    example: {
      certificateType: '10th board result',
      restrictions: {
        expireTimeStamp: '2024-07-04T05:03:03Z',
        viewOnce: false,
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
