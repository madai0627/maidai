import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('finance_budget')
export class FinanceBudget {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 12, scale: 2, comment: '预算金额' })
  amount: string;

  @UpdateDateColumn({ comment: '修改时间' })
  updated_at: Date;
}


