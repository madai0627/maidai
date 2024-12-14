import { PartialType } from '@nestjs/mapped-types';
import { CreateCatTypeDto } from './create-cat_type.dto';

export class UpdateCatTypeDto extends PartialType(CreateCatTypeDto) {}
