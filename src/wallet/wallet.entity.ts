import { ApiProperty } from '@nestjs/swagger'

export class WalletEntity {
  @ApiProperty({ description: 'The unique identifier of the wallet', example: '65f058277901e68a7df6db35' })
  _id: string

  @ApiProperty({ description: 'The user ID associated with the wallet', example: '61h053277501e68a7d76db85' })
  userId: string

  @ApiProperty({
    description: 'The did ID associated with the Registry',
    example: 'did:Wits61h053277501e68a7d76db85dasasd',
  })
  userDid: string

  @ApiProperty({ description: 'The timestamp when the wallet was created', example: '2024-03-12T13:27:03.696Z' })
  createdAt: Date

  @ApiProperty({ description: 'The timestamp when the wallet was last updated', example: '2024-03-12T13:27:03.696Z' })
  updatedAt: Date
}
