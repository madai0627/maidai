import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { QuizCategory } from '../quiz_category/quiz_category.entity';

@Entity('quiz_question')
export class QuizQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @Column()
  optionA: string;

  @Column()
  optionB: string;

  @Column()
  optionC: string;

  @Column()
  optionD: string;

  @Column({ length: 1 })
  correctAnswer: string; // A/B/C/D

  @Column({ comment: '题目难度：1-简单 2-中等 3-困难', default: 1 })
  difficulty: number;

  @ManyToOne(() => QuizCategory, { eager: true, onDelete: 'CASCADE' })
  category: QuizCategory;
}


