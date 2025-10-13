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

  @ManyToOne(() => QuizCategory, { eager: true, onDelete: 'CASCADE' })
  category: QuizCategory;
}


