import { IsNotEmpty, ValidateNested } from 'class-validator'
import { Restrictions } from './create-share-file-request.dto'

export class RequestShareFileRequestDto {
  @IsNotEmpty()
  readonly type: 'public' | 'private'

  @IsNotEmpty()
  readonly requestedFromUser: string

  @IsNotEmpty()
  readonly documentType: string

  @ValidateNested()
  readonly restrictions: Restrictions
}
