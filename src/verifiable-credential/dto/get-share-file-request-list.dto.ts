import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'
import { ShareRequestAction } from '../../common/constants/enums'

export class GetShareFileRequestsDto {
  @ApiProperty({ description: 'The type of document', required: false })
  @IsOptional()
  @IsString({ message: 'documentType must be a string' })
  documentType?: string

  @ApiProperty({ description: 'The wallet ID', example: 'wallet123' })
  @IsString({ message: 'walletId must be a string' })
  walletId: string

  @ApiProperty({ description: 'The status of the share request', enum: ShareRequestAction, required: false })
  @IsOptional()
  @IsString({ message: 'status must be a string' })
  status?: ShareRequestAction

  @ApiProperty({ description: 'The page number', example: 1 })
  page: number

  @ApiProperty({ description: 'The page size', example: 10 })
  pageSize: number
}
