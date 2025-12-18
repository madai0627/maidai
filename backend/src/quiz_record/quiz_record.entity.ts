import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { QuizQuestion } from '../quiz_question/quiz_question.entity';

@Entity('quiz_record')
export class QuizRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: '用户ID（简化版，实际项目中应关联用户表）' })
  userId: number;

  @ManyToOne(() => QuizQuestion, { eager: true, onDelete: 'CASCADE' })
  question: QuizQuestion;

  @Column({ length: 1, comment: '用户选择的答案' })
  userAnswer: string;

  @Column({ comment: '是否正确' })
  isCorrect: boolean;

  @Column({ comment: '题目分值', default: 10 })
  score: number;

  @CreateDateColumn({ comment: '答题时间' })
  createdAt: Date;
}
