import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('finance_purpose')
export class FinancePurpose {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: '用途' })
  purpose: string;

  @Column({ comment: '备注', default: '' })
  remark: string;

  @CreateDateColumn({ comment: '时间' })
  created_at: Date;
}
