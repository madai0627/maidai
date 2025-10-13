import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatInfoModule } from './cat_info/cat_info.module';
import { UsersModule } from './users/users.module';
import { RoleModule } from './role/role.module';
import { CatTypeModule } from './cat_type/cat_type.module';
import { FinancePurposeModule } from './finance_purpose/finance_purpose.module';
import { FinanceBudgetModule } from './finance_budget/finance_budget.module';
import { FinanceRecordModule } from './finance_record/finance_record.module';
import { PhotoWallModule } from './photo_wall/photo_wall.module';
import { QuizCategoryModule } from './quiz_category/quiz_category.module';
import { QuizQuestionModule } from './quiz_question/quiz_question.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'tang6688',
      database: 'madai',
      synchronize: true,
      retryDelay: 500,
      retryAttempts: 10,
      autoLoadEntities: true,
    }),
    CatInfoModule,
    UsersModule,
    RoleModule,
    CatTypeModule,
    FinancePurposeModule,
    FinanceBudgetModule,
    FinanceRecordModule,
    PhotoWallModule,
    QuizCategoryModule,
    QuizQuestionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
