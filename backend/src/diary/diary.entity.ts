import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * 日记实体
 * 用于存储用户的日记记录，包含情绪标签、图片和标签
 */
@Entity('diary')
@Index(['user_id', 'diary_date']) // 复合索引：用户+日期查询优化
@Index(['user_id', 'mood']) // 复合索引：情绪统计优化
export class Diary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: '用户ID，关联users表' })
  user_id: number;

  @Column({ length: 200, nullable: true, comment: '日记标题（可选）' })
  title: string;

  @Column('text', { comment: '日记正文内容' })
  content: string;

  @Column({
    length: 20,
    comment: '情绪标签：happy/good/neutral/sad/angry',
  })
  mood: string;

  @Column({ length: 20, nullable: true, comment: '天气（P2功能）' })
  weather: string;

  @Column({ length: 100, nullable: true, comment: '位置（P2功能）' })
  location: string;

  @Column('date', { comment: '日记日期（支持补写）' })
  diary_date: Date;

  @Column('json', { nullable: true, comment: '图片数组，存储Base64字符串' })
  images: string[];

  @Column('json', { nullable: true, comment: '标签数组' })
  tags: string[];

  @Column({ default: false, comment: '是否删除（软删除）' })
  is_deleted: boolean;

  @CreateDateColumn({ comment: '创建时间' })
  created_at: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updated_at: Date;
}

/**
 * 情绪类型常量
 */
export const MOOD_TYPES = ['happy', 'good', 'neutral', 'sad', 'angry'] as const;
export type MoodType = (typeof MOOD_TYPES)[number];

/**
 * 情绪标签配置
 */
export const MOOD_LABELS = {
  happy: { emoji: '😄', label: '开心', color: '#67c23a' },
  good: { emoji: '😊', label: '平静', color: '#409eff' },
  neutral: { emoji: '😐', label: '一般', color: '#909399' },
  sad: { emoji: '😢', label: '低落', color: '#e6a23c' },
  angry: { emoji: '😠', label: '烦躁', color: '#f56c6c' },
};
