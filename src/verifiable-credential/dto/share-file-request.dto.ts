import { ApiProperty } from '@nestjs/swagger'
import { Type as TransformType } from 'class-transformer'
import { IsBoolean, IsNotEmpty, IsNumber, IsPositive, IsString, Min, ValidateNested } from 'class-validator'
export class Restrictions {
  @ApiProperty({ description: 'The expiration time of the file access in hours' })
  @IsNumber({}, { message: 'expiresIn must be a number' })
  @IsPositive({ message: 'expiresIn must be a positive number' })
  @Min(1, { message: 'expiresIn must be greater than or equal to 1' })
  readonly expiresIn: number

  @ApiProperty({ description: 'Specifies whether the file can be viewed only once' })
  @IsBoolean({ message: 'viewOnce must be a boolean' })
  @IsNotEmpty({ message: 'viewOnce cannot be empty' })
  readonly viewOnce: boolean
}

export class ShareFileRequestDto {
  @ApiProperty({ description: 'The type of certificate', example: 'Credential' })
  @IsString({ message: 'certificateType must be a string' })
  @IsNotEmpty({ message: 'certificateType cannot be empty' })
  readonly certificateType: string

  @ApiProperty({ description: 'Remarks about the file access', required: false })
  @IsString({ message: 'remarks must be a string' })
  @IsNotEmpty({ message: 'remarks cannot be empty' })
  readonly remarks: string

  @ApiProperty({ description: 'Restrictions for file access' })
  @TransformType(() => Restrictions)
  @IsNotEmpty({ message: 'restrictions cannot be empty' })
  @ValidateNested()
  readonly restrictions: Restrictions
}
