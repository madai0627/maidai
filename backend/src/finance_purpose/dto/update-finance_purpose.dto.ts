import { PartialType } from '@nestjs/mapped-types';
import { CreateFinancePurposeDto } from './create-finance_purpose.dto';

export class UpdateFinancePurposeDto extends PartialType(
  CreateFinancePurposeDto,
) {}
