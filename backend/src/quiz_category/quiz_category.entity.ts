import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('quiz_category')
export class QuizCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;
}


