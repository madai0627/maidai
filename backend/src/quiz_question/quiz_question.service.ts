import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizQuestion } from './quiz_question.entity';
import { QuizCategory } from '../quiz_category/quiz_category.entity';

@Injectable()
export class QuizQuestionService {
  constructor(
    @InjectRepository(QuizQuestion)
    private readonly questionRepo: Repository<QuizQuestion>,
    @InjectRepository(QuizCategory)
    private readonly categoryRepo: Repository<QuizCategory>,
  ) {}

  findAllByCategory(categoryId: number) {
    return this.questionRepo.find({ where: { category: { id: categoryId } } });
  }

  create(data: {
    content: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: 'A' | 'B' | 'C' | 'D';
    categoryId: number;
    difficulty?: number;
  }) {
    return this.categoryRepo.findOneBy({ id: data.categoryId }).then((cat) => {
      const entity = this.questionRepo.create({
        content: data.content,
        optionA: data.optionA,
        optionB: data.optionB,
        optionC: data.optionC,
        optionD: data.optionD,
        correctAnswer: data.correctAnswer,
        difficulty: data.difficulty || 1,
        category: cat!,
      });
      return this.questionRepo.save(entity);
    });
  }

  update(id: number, data: Partial<QuizQuestion> & { categoryId?: number }) {
    const updateData: any = { ...data };
    
    if (data.categoryId) {
      return this.categoryRepo.findOneBy({ id: data.categoryId }).then((cat) => {
        updateData.category = cat!;
        delete updateData.categoryId;
        return this.questionRepo.update(id, updateData);
      });
    }
    
    // 确保 difficulty 字段被正确处理
    if (updateData.difficulty !== undefined) {
      updateData.difficulty = Number(updateData.difficulty);
    }
    
    return this.questionRepo.update(id, updateData);
  }

  remove(id: number) {
    return this.questionRepo.delete(id);
  }

  async seedInterview() {
    const ensureCategory = async (name: string) => {
      let cat = await this.categoryRepo.findOne({ where: { name } });
      if (!cat) {
        cat = this.categoryRepo.create({ name });
        await this.categoryRepo.save(cat);
      }
      return cat;
    };

    const jsCat = await ensureCategory('JavaScript 基础');
    const vueCat = await ensureCategory('Vue 框架');
    const webCat = await ensureCategory('浏览器与性能');

    const items: Array<{
      categoryId: number;
      content: string;
      optionA: string; optionB: string; optionC: string; optionD: string;
      correctAnswer: 'A'|'B'|'C'|'D';
    }> = [
      {
        categoryId: jsCat.id,
        content: '以下哪个不会创建块级作用域？',
        optionA: 'function 声明', optionB: 'let 声明', optionC: 'const 声明', optionD: 'var 声明',
        correctAnswer: 'D',
      },
      {
        categoryId: jsCat.id,
        content: '关于 this 的指向，以下说法正确的是：',
        optionA: '箭头函数的 this 在调用时动态绑定', optionB: '箭头函数没有自己的 this，取决于定义时外层作用域', optionC: 'call 可以改变箭头函数 this', optionD: 'bind 会立即执行函数',
        correctAnswer: 'B',
      },
      {
        categoryId: jsCat.id,
        content: '数组去重最合适的方式是：',
        optionA: 'arr.filter(Boolean)', optionB: 'new Set(arr) 配合展开', optionC: 'arr.map()', optionD: 'arr.forEach()',
        correctAnswer: 'B',
      },
      {
        categoryId: vueCat.id,
        content: 'Vue 3 中响应式的核心实现基于：',
        optionA: 'Object.defineProperty', optionB: 'Proxy', optionC: '发布订阅手写实现', optionD: 'MutationObserver',
        correctAnswer: 'B',
      },
      {
        categoryId: vueCat.id,
        content: '以下哪个写法不会触发组件更新？',
        optionA: '直接修改 ref 的 value', optionB: '给 reactive 对象新增不存在的属性', optionC: '替换 reactive 对象为新对象', optionD: '修改 reactive 对象已有属性',
        correctAnswer: 'B',
      },
      {
        categoryId: vueCat.id,
        content: '在 <script setup> 中获取路由实例应使用：',
        optionA: 'this.$router', optionB: 'useRouter()', optionC: 'inject("router")', optionD: 'getCurrentInstance().proxy.$router',
        correctAnswer: 'B',
      },
      {
        categoryId: webCat.id,
        content: '减少首屏白屏时间最有效的方式是：',
        optionA: '把所有 CSS 放在底部', optionB: '开启 HTTP/3', optionC: '对关键路径资源进行内联或预加载', optionD: '只用 setTimeout 延迟脚本',
        correctAnswer: 'C',
      },
      {
        categoryId: webCat.id,
        content: '关于防抖与节流，以下描述正确的是：',
        optionA: '防抖保证高频触发中按时间间隔执行', optionB: '节流在触发后 N ms 内忽略后续触发', optionC: '防抖适合输入框搜索，节流适合滚动监听', optionD: '两者等价',
        correctAnswer: 'C',
      },
    ];

    // Avoid creating duplicates: naive check by content
    const existing = await this.questionRepo.find({ select: { id: true, content: true } as any });
    const existingSet = new Set(existing.map((q: any) => q.content));

    for (const it of items) {
      if (existingSet.has(it.content)) continue;
      await this.create(it);
    }

    return { created: true, categories: [jsCat, vueCat, webCat].map(c => ({ id: c.id, name: c.name })), added: items.length - existing.filter((q: any) => items.find(i => i.content === q.content)).length };
  }
}


