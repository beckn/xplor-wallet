import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator'
import { Restrictions } from './share-file-request.dto'

export class UpdateVcQueryRequestDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'wallet must not be empty' })
  @IsString({ message: 'walletId must be a string' })
  walletId: string

  @ApiProperty()
  @IsNotEmpty({ message: 'requestId must not be empty' })
  @IsString({ message: 'requestId must be a string' })
  requestId: string
}

export class UpdateVcRequestDto {
  @ApiProperty({ description: 'Remarks about the file access', required: false })
  @IsString({ message: 'remarks must be a string' })
  @IsNotEmpty({ message: 'remarks cannot be empty' })
  readonly remarks: string

  @ApiProperty({ description: 'Shared with entity', required: false })
  @IsString({ message: 'sharedWithEntity must be a string' })
  @IsOptional()
  readonly sharedWithEntity: string

  @ApiProperty({ description: 'Restrictions for file access' })
  @IsNotEmpty({ message: 'restrictions cannot be empty' })
  @ValidateNested()
  readonly restrictions: Restrictions
}
