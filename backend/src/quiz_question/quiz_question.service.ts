import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { QuizQuestion } from './quiz_question.entity';
import { QuizCategory } from '../quiz_category/quiz_category.entity';
import * as XLSX from 'xlsx';

@Injectable()
export class QuizQuestionService {
  constructor(
    @InjectRepository(QuizQuestion)
    private readonly questionRepo: Repository<QuizQuestion>,
    @InjectRepository(QuizCategory)
    private readonly categoryRepo: Repository<QuizCategory>,
  ) {}

  async findAll(options: {
    page: number;
    pageSize: number;
    categoryId?: number;
    keyword?: string;
    difficulty?: number;
  }) {
    const { page, pageSize, categoryId, keyword, difficulty } = options;
    
    const queryBuilder = this.questionRepo
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.category', 'category');

    // 分类筛选
    if (categoryId) {
      queryBuilder.andWhere('category.id = :categoryId', { categoryId });
    }

    // 关键词搜索（搜索题目内容）
    if (keyword) {
      queryBuilder.andWhere('question.content LIKE :keyword', { 
        keyword: `%${keyword}%` 
      });
    }

    // 难度筛选
    if (difficulty) {
      queryBuilder.andWhere('question.difficulty = :difficulty', { difficulty });
    }

    // 分页
    const skip = (page - 1) * pageSize;
    queryBuilder.skip(skip).take(pageSize);

    // 排序
    queryBuilder.orderBy('question.id', 'DESC');

    // 执行查询
    const [questions, total] = await queryBuilder.getManyAndCount();

    return {
      data: questions,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
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

  async batchRemove(ids: number[]) {
    const results = [];
    for (const id of ids) {
      const result = await this.questionRepo.delete(id);
      results.push(result);
    }
    return { affected: results.reduce((sum, r) => sum + r.affected, 0) };
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

  async importFromExcel(buffer: Buffer) {
    try {
      // 解析Excel文件
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // 转换为JSON格式
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (data.length < 2) {
        throw new Error('Excel文件至少需要包含标题行和一行数据');
      }

      const headers = data[0] as string[];
      const rows = data.slice(1) as any[][];

      // 验证表头
      const requiredHeaders = ['分类', '题目', '选项A', '选项B', '选项C', '选项D', '正确答案', '难度'];
      const headerMap: { [key: string]: number } = {};
      
      requiredHeaders.forEach(header => {
        const index = headers.findIndex(h => h && h.toString().trim() === header);
        if (index === -1) {
          throw new Error(`缺少必要的列：${header}`);
        }
        headerMap[header] = index;
      });

      const results = {
        success: 0,
        failed: 0,
        errors: [] as string[],
        categories: new Set<string>()
      };

      // 处理每一行数据
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNum = i + 2; // Excel行号从2开始

        try {
          // 提取数据
          const categoryName = row[headerMap['分类']]?.toString().trim();
          const content = row[headerMap['题目']]?.toString().trim();
          const optionA = row[headerMap['选项A']]?.toString().trim();
          const optionB = row[headerMap['选项B']]?.toString().trim();
          const optionC = row[headerMap['选项C']]?.toString().trim();
          const optionD = row[headerMap['选项D']]?.toString().trim();
          const correctAnswer = row[headerMap['正确答案']]?.toString().trim().toUpperCase();
          const difficulty = parseInt(row[headerMap['难度']]?.toString().trim()) || 1;

          // 验证数据
          if (!categoryName || !content || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
            throw new Error('必填字段不能为空');
          }

          if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
            throw new Error('正确答案必须是A、B、C、D之一');
          }

          if (difficulty < 1 || difficulty > 3) {
            throw new Error('难度必须是1-3之间的数字');
          }

          // 确保分类存在
          let category = await this.categoryRepo.findOne({ where: { name: categoryName } });
          if (!category) {
            category = this.categoryRepo.create({ name: categoryName });
            category = await this.categoryRepo.save(category);
            results.categories.add(categoryName);
          }

          // 检查题目是否已存在
          const existing = await this.questionRepo.findOne({
            where: { content, category: { id: category.id } }
          });

          if (existing) {
            throw new Error('题目已存在');
          }

          // 创建题目
          const question = this.questionRepo.create({
            content,
            optionA,
            optionB,
            optionC,
            optionD,
            correctAnswer: correctAnswer as 'A' | 'B' | 'C' | 'D',
            difficulty,
            category
          });

          await this.questionRepo.save(question);
          results.success++;

        } catch (error) {
          results.failed++;
          results.errors.push(`第${rowNum}行：${error.message}`);
        }
      }

      return {
        message: 'Excel导入完成',
        total: rows.length,
        success: results.success,
        failed: results.failed,
        errors: results.errors,
        newCategories: Array.from(results.categories)
      };

    } catch (error) {
      throw new Error(`Excel解析失败：${error.message}`);
    }
  }
}


