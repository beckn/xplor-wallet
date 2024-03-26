import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsPositive, Min, ValidateNested } from 'class-validator'

class Restrictions {
  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @Min(1)
  readonly expiresIn: number

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Min(1)
  readonly viewCount: number

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  readonly downloadEnabled: boolean

  @ApiProperty()
  @IsOptional()
  @IsArray()
  readonly sharedWithUsers: []
}

export class ShareFileRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  readonly type: 'public' | 'private'

  @ApiProperty()
  @IsNotEmpty()
  readonly documentType: string

  @ApiProperty()
  @ValidateNested()
  readonly restrictions: Restrictions
}
