import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ExerciseRecordItem } from './exercise_record_item.entity';

/**
 * 学习会话级做题记录
 * 一次练习 / 考试 / 作业整体信息
 */
@Entity('exercise_record')
export class ExerciseRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: '用户ID（实际项目中可关联用户表）' })
  userId: number;

  @Column({
    type: 'tinyint',
    default: 1,
    comment: '来源类型：1-练习 2-考试 3-作业等',
  })
  sourceType: number;

  @Column({ nullable: true, comment: '来源ID，如试卷ID、作业ID' })
  sourceId: number | null;

  @Column({ length: 50, nullable: true, comment: '科目编码，例如 MATH/CHN' })
  subjectCode: string | null;

  @Column({ type: 'datetime', comment: '开始时间' })
  startTime: Date;

  @Column({ type: 'datetime', comment: '结束时间' })
  endTime: Date;

  @Column({ type: 'int', default: 0, comment: '本次答题总用时（秒）' })
  durationSeconds: number;

  @Column({ type: 'int', default: 0, comment: '题目总数' })
  totalCount: number;

  @Column({ type: 'int', default: 0, comment: '答对题数' })
  correctCount: number;

  @Column({ type: 'int', default: 0, comment: '答错题数' })
  wrongCount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '得分' })
  score: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: '满分',
  })
  maxScore: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    comment: '正确率（0-100）',
  })
  accuracy: number;

  @OneToMany(
    () => ExerciseRecordItem,
    (item) => item.record,
    { cascade: ['insert'] },
  )
  items: ExerciseRecordItem[];

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
}


