import { IsObject, IsOptional } from 'class-validator'

export class MetadataFiltersRequestDto {
  @IsOptional()
  @IsObject()
  filters: Record<string, any>
}
