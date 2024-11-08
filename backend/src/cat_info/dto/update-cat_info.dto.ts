import { PartialType } from '@nestjs/mapped-types';
import { CreateCatInfoDto } from './create-cat_info.dto';

export class UpdateCatInfoDto extends PartialType(CreateCatInfoDto) {}
