import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { QuizQuestion } from '../quiz_question/quiz_question.entity';

@Entity('quiz_favorite')
export class QuizFavorite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: '用户ID' })
  userId: number;

  @ManyToOne(() => QuizQuestion, { eager: true, onDelete: 'CASCADE' })
  question: QuizQuestion;

  @CreateDateColumn({ comment: '收藏时间' })
  createdAt: Date;
}
