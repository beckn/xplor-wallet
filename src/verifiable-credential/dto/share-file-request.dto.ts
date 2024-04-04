import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsPositive, Min, ValidateNested } from 'class-validator'

class Restrictions {
  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @Min(1)
  readonly expiresIn: number

  @IsNotEmpty()
  @ApiProperty()
  readonly viewOnce: boolean
}

export class ShareFileRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  readonly certificateType: string

  @ApiProperty()
  @ValidateNested()
  readonly restrictions: Restrictions
}
