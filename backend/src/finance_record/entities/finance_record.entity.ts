import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('finance_record')
export class FinanceRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 12, scale: 2, comment: '金额' })
  amount: string;

  @Column({ comment: '分类' })
  category: string;

  @Column({ comment: '用途' })
  purpose: string;

  @Column({ comment: '备注', default: '' })
  remark: string;

  @CreateDateColumn({ comment: '时间' })
  created_at: Date;
}
