import { ApiProperty } from '@nestjs/swagger'
import { Type as TransformType } from 'class-transformer'
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min, ValidateNested } from 'class-validator'

export class RestrictionsDto {
  @ApiProperty({ description: 'Number of seconds until the file link expires' })
  @IsNotEmpty({ message: 'expiresIn must not be empty' })
  @IsNumber({}, { message: 'expiresIn must be a number' })
  @IsPositive({ message: 'expiresIn must be a positive number' })
  @Min(1, { message: 'expiresIn must be greater than or equal to 1' })
  readonly expiresIn: number

  @ApiProperty({ description: 'Indicates whether the file link can be viewed once' })
  @IsBoolean({ message: 'viewOnce must be a boolean' })
  @IsNotEmpty({ message: 'viewOnce cannot be empty' })
  readonly viewOnce?: boolean

  constructor(expiresIn: number, viewOnce?: boolean) {
    this.expiresIn = expiresIn
    this.viewOnce = viewOnce
  }
}

export class RequestShareFileRequestDto {
  @ApiProperty({ description: 'The ID of the wallet from which the file is requested' })
  @IsNotEmpty({ message: 'Requested from wallet must be provided' })
  readonly requestedFromWallet: string

  @ApiProperty({ description: 'Type of the certificate' })
  @IsNotEmpty({ message: 'Certificate type must be provided' })
  @IsString({ message: 'Certificate type must be string' })
  readonly certificateType: string

  @ApiProperty({ description: 'Optional remarks for the file request' })
  @IsNotEmpty({ message: 'remarks must not be empty' })
  @IsString({ message: 'remarks must be string' })
  readonly remarks: string

  @ApiProperty({ description: 'Restrictions for sharing the file' })
  @TransformType(() => RestrictionsDto)
  @IsNotEmpty({ message: 'restrictions cannot be empty' })
  @ValidateNested()
  readonly restrictions: RestrictionsDto
}
