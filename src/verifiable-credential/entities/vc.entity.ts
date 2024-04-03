import { ApiProperty } from '@nestjs/swagger'
import { VcCategory, VcType } from 'src/common/constants/enums'

export class VCEntity {
  @ApiProperty({ example: '65f058277901e68a7df6db35' })
  _id: string

  @ApiProperty({ example: '61h053277501e68a7d76db85' })
  walletId: string

  @ApiProperty({ example: 'did:WitsLab61h053277501e68a7d76db8512121' })
  did: string

  @ApiProperty({ example: VcType.SELF_ISSUED })
  type: string

  @ApiProperty({ example: VcCategory.PROOF_OF_ADDRESS })
  category: string

  @ApiProperty({ example: ['important', 'finance'] })
  tags: string[]

  @ApiProperty({ example: 'example.pdf' })
  name: string
}

export class VCEntityList {
  @ApiProperty({ type: [VCEntity] })
  data: VCEntity[]
}
