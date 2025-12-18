import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancePurpose } from './entities/finance_purpose.entity';
import { FinancePurposeService } from './finance_purpose.service';
import { FinancePurposeController } from './finance_purpose.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FinancePurpose])],
  controllers: [FinancePurposeController],
  providers: [FinancePurposeService],
})
export class FinancePurposeModule {}
