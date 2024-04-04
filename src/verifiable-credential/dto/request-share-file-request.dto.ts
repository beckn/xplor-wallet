import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsOptional, ValidateNested } from 'class-validator'

export class RestrictionsDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  readonly expiresIn: number

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  readonly viewOnce?: boolean

  constructor(expiresIn: number, viewOnce?: boolean) {
    this.expiresIn = expiresIn
    this.viewOnce = viewOnce
  }
}
export class RequestShareFileRequestDto {
  @IsNotEmpty()
  readonly requestedFromWallet: string

  @IsNotEmpty()
  readonly certificateType: string

  @ValidateNested()
  readonly restrictions: RestrictionsDto
}
