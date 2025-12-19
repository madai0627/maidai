import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { QuizQuestion } from '../../quiz_question/quiz_question.entity';

/**
 * 错题记录表
 * userId + question 维度唯一
 */
@Entity('wrong_question')
export class WrongQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: '用户ID' })
  userId: number;

  @ManyToOne(() => QuizQuestion, { eager: true, onDelete: 'CASCADE' })
  question: QuizQuestion;

  @Column({ type: 'datetime', comment: '第一次做错时间' })
  firstWrongTime: Date;

  @Column({ type: 'datetime', comment: '最近一次做错时间' })
  lastWrongTime: Date;

  @Column({ type: 'int', default: 0, comment: '累计做错次数' })
  wrongCount: number;

  @Column({
    type: 'int',
    default: 0,
    comment: '错后又答对的次数，用于判断掌握程度',
  })
  correctAfterWrongCount: number;

  @Column({
    type: 'tinyint',
    default: 0,
    comment: '错题状态：0-未复习 1-复习中 2-已掌握',
  })
  status: number;

  @Column({ length: 50, nullable: true, comment: '科目编码' })
  subjectCode: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '知识点编码集合（预留，逗号分隔或 JSON）',
  })
  knowledgeCodes: string | null;

  @Column({
    type: 'tinyint',
    default: 1,
    comment: '最近一次来源类型：1-练习 2-考试 3-作业等',
  })
  lastSourceType: number;

  @Column({ nullable: true, comment: '最近一次来源ID，如试卷ID' })
  lastSourceId: number | null;

  @Column({
    type: 'tinyint',
    default: 0,
    comment: '是否删除标记（软删除）',
  })
  isDeleted: number;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
}


