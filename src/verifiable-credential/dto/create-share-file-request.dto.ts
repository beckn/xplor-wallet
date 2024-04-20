import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator'

export class Restrictions {
  @ApiProperty()
  @IsNotEmpty()
  readonly expiresIn: number

  @ApiProperty()
  @IsOptional()
  readonly viewOnce?: boolean

  constructor(expiresIn: number, viewOnce?: boolean) {
    this.expiresIn = expiresIn
    this.viewOnce = viewOnce
  }
}

export class VcShareDetails {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly certificateType: string

  @ApiProperty()
  @ValidateNested()
  readonly restrictions: Restrictions

  constructor(certificateType: string, restrictions: Restrictions) {
    this.certificateType = certificateType
    this.restrictions = restrictions
  }
}

export class CreateShareFileRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly vcId: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly status: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly restrictedUrl: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly raisedByWallet: string

  @ApiProperty()
  @IsString()
  readonly vcOwnerWallet: string

  @ApiProperty()
  @IsString()
  readonly remarks: string

  @ApiProperty()
  @ValidateNested()
  readonly vcShareDetails: VcShareDetails

  constructor(
    vcId: string,
    status: string,
    restrictedUrl: string,
    raisedByWallet: string,
    vcOwnerWallet: string,
    remarks: string,
    fileShareDetails: VcShareDetails,
  ) {
    this.vcId = vcId
    this.status = status
    this.restrictedUrl = restrictedUrl
    this.raisedByWallet = raisedByWallet
    this.vcOwnerWallet = vcOwnerWallet
    this.remarks = remarks
    this.vcShareDetails = fileShareDetails
  }
}
