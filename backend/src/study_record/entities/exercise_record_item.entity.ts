import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ExerciseRecord } from './exercise_record.entity';
import { QuizQuestion } from '../../quiz_question/quiz_question.entity';

/**
 * 单题级做题记录
 * 对应一次会话中的一题
 */
@Entity('exercise_record_item')
export class ExerciseRecordItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ExerciseRecord, (record) => record.items, {
    onDelete: 'CASCADE',
  })
  record: ExerciseRecord;

  @Column({ comment: '用户ID（冗余，便于按用户查询）' })
  userId: number;

  @ManyToOne(() => QuizQuestion, { eager: true, onDelete: 'CASCADE' })
  question: QuizQuestion;

  @Column({ length: 50, nullable: true, comment: '科目编码' })
  subjectCode: string | null;

  @Column({ length: 1, comment: '用户选择的答案' })
  userAnswer: string;

  @Column({ comment: '是否答对' })
  isCorrect: boolean;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: '本题得分',
  })
  score: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: '本题满分',
  })
  maxScore: number;

  @Column({ type: 'int', default: 0, comment: '本题作答用时（秒）' })
  durationSeconds: number;

  @Column({ type: 'datetime', comment: '提交时间' })
  submitTime: Date;

  @Column({
    default: true,
    comment: '是否计入错题本（部分题型可不计入）',
  })
  isMarkedWrong: boolean;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
}


