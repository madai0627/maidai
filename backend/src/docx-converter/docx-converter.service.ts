import { Injectable } from '@nestjs/common';
import * as mammoth from 'mammoth';
import * as TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import * as MarkdownIt from 'markdown-it';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType } from 'docx';
import * as fs from 'fs';
import { promisify } from 'util';

const unlinkAsync = promisify(fs.unlink);
const existsAsync = promisify(fs.exists);
const writeFileAsync = promisify(fs.writeFile);

@Injectable()
export class DocxConverterService {
  private turndownService: TurndownService;

  constructor() {
    // 初始化 Turndown 服务，用于 HTML 转 Markdown
    this.turndownService = new TurndownService({
      headingStyle: 'atx', // 使用 # 风格的标题
      codeBlockStyle: 'fenced', // 使用 ``` 风格的代码块
      bulletListMarker: '-', // 使用 - 作为列表标记
      strongDelimiter: '**', // 使用 ** 表示粗体
      emDelimiter: '*', // 使用 * 表示斜体
    });

    // 使用 GFM 插件支持表格、删除线等
    this.turndownService.use(gfm);

    // 自定义规则：确保段落换行
    this.turndownService.addRule('paragraph', {
      filter: 'p',
      replacement: function (content) {
        // 段落后添加两个换行符，确保段落之间有空行
        return content.trim() ? '\n\n' + content + '\n\n' : '';
      },
    });

    // 自定义规则：处理换行符
    this.turndownService.addRule('lineBreak', {
      filter: 'br',
      replacement: function () {
        return '\n';
      },
    });

    // 自定义规则：确保粗体标签正确转换
    // 在粗体标记前后添加空格，确保 Markdown 解析器能正确识别
    this.turndownService.addRule('strong', {
      filter: ['strong', 'b'],
      replacement: function (content, node) {
        if (!content.trim()) return '';
        
        // 检查内容是否以标点符号结尾
        const endsWithPunctuation = /[，。！？、：；）】》」』:：]$/.test(content);
        
        // 如果以标点结尾，将标点移到粗体标记外面
        let finalContent = content;
        let trailingPunctuation = '';
        
        if (endsWithPunctuation) {
          trailingPunctuation = content.slice(-1);
          finalContent = content.slice(0, -1);
        }
        
        // 检查前后是否需要空格
        const prevText = node.previousSibling?.textContent || '';
        const nextText = node.nextSibling?.textContent || '';
        
        // 如果前面有文本且不以空格结尾，添加空格
        const needSpaceBefore = prevText && !/[\s\n]$/.test(prevText);
        // 如果后面有文本且不以空格开头（考虑到我们可能添加了标点），添加空格
        const needSpaceAfter = (nextText || trailingPunctuation) && 
                               !/^[\s\n]/.test(trailingPunctuation + nextText);
        
        const before = needSpaceBefore ? ' ' : '';
        const after = needSpaceAfter ? ' ' : '';
        
        return before + '**' + finalContent + '**' + trailingPunctuation + after;
      },
    });

    // 自定义规则：确保斜体标签正确转换（不添加额外空格）
    this.turndownService.addRule('emphasis', {
      filter: ['em', 'i'],
      replacement: function (content) {
        if (!content.trim()) return '';
        return '*' + content + '*';
      },
    });

    // 自定义规则：下划线转换为 HTML（因为 Markdown 不支持下划线）
    this.turndownService.addRule('underline', {
      filter: ['u'],
      replacement: function (content) {
        if (!content.trim()) return content;
        return '<u>' + content + '</u>';
      },
    });
  }

  /**
   * 将 docx 文件转换为 markdown 格式
   * @param filePath docx 文件路径
   * @returns markdown 格式的文本
   */
  async convertToMarkdown(filePath: string): Promise<string> {
    try {
      // 使用 mammoth 转换 docx 到 HTML
      // mammoth 默认会将表格转换为 HTML table 标签
      const result = await mammoth.convertToHtml(
        { path: filePath },
        {
          styleMap: [
            // 自定义样式映射，保留更多格式
            "p[style-name='Heading 1'] => h1:fresh",
            "p[style-name='Heading 2'] => h2:fresh",
            "p[style-name='Heading 3'] => h3:fresh",
            "p[style-name='Heading 4'] => h4:fresh",
            "p[style-name='Heading 5'] => h5:fresh",
            "p[style-name='Heading 6'] => h6:fresh",
            "p[style-name='标题 1'] => h1:fresh",
            "p[style-name='标题 2'] => h2:fresh",
            "p[style-name='标题 3'] => h3:fresh",
            "p[style-name='标题 4'] => h4:fresh",
            "p[style-name='标题 5'] => h5:fresh",
            "p[style-name='标题 6'] => h6:fresh",
          ],
          
          // 包含默认样式映射（这会自动处理粗体、斜体等）
          includeDefaultStyleMap: true,
        },
      );

      // 获取转换后的 HTML
      let html = result.value;

      // 处理警告信息（如果有）
      if (result.messages && result.messages.length > 0) {
        console.warn('转换警告:', result.messages);
      }

      // 调试：输出 HTML 以便查看
      console.log('转换后的 HTML:', html.substring(0, 500));

      // 将 HTML 转换为 Markdown
      let markdown = this.turndownService.turndown(html);
      
      // 调试：输出初始转换结果
      console.log('初始 Markdown（前300字符）:', markdown.substring(0, 300));

      // 1. 清理多余的空行（超过3个连续空行的情况）
      markdown = markdown.replace(/\n{4,}/g, '\n\n\n');

      // 2. 清理表格周围的多余空行
      markdown = markdown.replace(/\n{3,}(\|)/g, '\n\n$1');
      markdown = markdown.replace(/(\|[^\n]+)\n{4,}/g, '$1\n\n');

      // 3. 确保粗体标记不会被转义
      markdown = markdown.replace(/\\\*\\\*/g, '**');
      markdown = markdown.replace(/\\\*/g, '*');
      
      // 调试：输出最终结果
      console.log('最终 Markdown（前300字符）:', markdown.substring(0, 300));

      // 4. 确保文本末尾只有一个换行符
      markdown = markdown.trim() + '\n';

      return markdown;
    } catch (error) {
      console.error('docx 转换失败:', error);
      throw new Error(`无法转换 docx 文件: ${error.message}`);
    }
  }

  /**
   * 将 Markdown 转换为 docx 文件
   * @param markdown Markdown 文本
   * @returns docx 文件的 Buffer
   */
  async convertMarkdownToDocx(markdown: string): Promise<Buffer> {
    try {
      // 使用 markdown-it 解析 Markdown，启用 HTML 支持
      const md = new MarkdownIt({
        html: true, // 启用 HTML 标签支持
      });
      const tokens = md.parse(markdown, {});

      const children = [];
      let currentList = [];
      let listLevel = 0;

      // 遍历 tokens 并转换为 docx 元素
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        if (token.type === 'heading_open') {
          const level = parseInt(token.tag.substring(1)); // h1 -> 1
          const contentToken = tokens[i + 1];
          const text = contentToken.content;

          children.push(
            new Paragraph({
              text: text,
              heading: this.getHeadingLevel(level),
              spacing: { before: 240, after: 120 },
            }),
          );
          i++; // 跳过 content token
        } else if (token.type === 'paragraph_open') {
          const contentToken = tokens[i + 1];
          if (contentToken && contentToken.type === 'inline') {
            const runs = this.parseInlineContent(contentToken.children || []);
            children.push(
              new Paragraph({
                children: runs,
                spacing: { before: 120, after: 120 },
              }),
            );
          }
          i++; // 跳过 content token
        } else if (token.type === 'bullet_list_open' || token.type === 'ordered_list_open') {
          listLevel++;
        } else if (token.type === 'bullet_list_close' || token.type === 'ordered_list_close') {
          listLevel--;
        } else if (token.type === 'list_item_open') {
          // 处理列表项
          const nextToken = tokens[i + 1];
          if (nextToken && nextToken.type === 'paragraph_open') {
            const contentToken = tokens[i + 2];
            if (contentToken && contentToken.type === 'inline') {
              const runs = this.parseInlineContent(contentToken.children || []);
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: '• ', bold: false }),
                    ...runs,
                  ],
                  spacing: { before: 60, after: 60 },
                  indent: { left: 720 * listLevel },
                }),
              );
            }
          }
        } else if (token.type === 'html_block') {
          // 处理 HTML 块（包括表格）
          const htmlContent = token.content;
          if (htmlContent.includes('<table')) {
            const table = this.parseHtmlTable(htmlContent);
            if (table) {
              children.push(table);
            }
          }
        }
      }

      // 创建文档
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: children,
          },
        ],
      });

      // 生成 Buffer
      const buffer = await Packer.toBuffer(doc);
      return buffer;
    } catch (error) {
      console.error('Markdown 转 docx 失败:', error);
      throw new Error(`无法转换 Markdown: ${error.message}`);
    }
  }

  /**
   * 获取标题级别
   */
  private getHeadingLevel(level: number) {
    const levels = {
      1: HeadingLevel.HEADING_1,
      2: HeadingLevel.HEADING_2,
      3: HeadingLevel.HEADING_3,
      4: HeadingLevel.HEADING_4,
      5: HeadingLevel.HEADING_5,
      6: HeadingLevel.HEADING_6,
    };
    return levels[level] || HeadingLevel.HEADING_1;
  }

  /**
   * 解析 HTML 表格
   */
  private parseHtmlTable(html: string): Table | null {
    try {
      // 简单的 HTML 表格解析
      const rows: TableRow[] = [];
      
      // 提取所有 <tr> 标签内容
      const trMatches = html.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
      if (!trMatches) return null;

      for (const trHtml of trMatches) {
        // 提取所有 <td> 或 <th> 标签内容
        const cellMatches = trHtml.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi);
        if (!cellMatches) continue;

        const cells: TableCell[] = [];
        for (const cellHtml of cellMatches) {
          // 提取单元格内容（移除 HTML 标签）
          let cellText = cellHtml
            .replace(/<t[dh][^>]*>/i, '')
            .replace(/<\/t[dh]>/i, '')
            .replace(/<p[^>]*>/gi, '')
            .replace(/<\/p>/gi, '\n')
            .replace(/<strong[^>]*>/gi, '')
            .replace(/<\/strong>/gi, '')
            .replace(/<em[^>]*>/gi, '')
            .replace(/<\/em>/gi, '')
            .replace(/<br\s*\/?>/gi, '\n')
            .trim();

          // 检查是否是粗体（标题行）
          const isBold = cellHtml.includes('<strong>') || cellHtml.includes('<th');

          cells.push(
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: cellText,
                      bold: isBold,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              width: {
                size: 2500,
                type: WidthType.DXA,
              },
            }),
          );
        }

        if (cells.length > 0) {
          rows.push(new TableRow({ children: cells }));
        }
      }

      if (rows.length === 0) return null;

      return new Table({
        rows: rows,
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
      });
    } catch (error) {
      console.error('解析 HTML 表格失败:', error);
      return null;
    }
  }

  /**
   * 解析内联内容（粗体、斜体等）
   */
  private parseInlineContent(tokens: any[]): TextRun[] {
    const runs: TextRun[] = [];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (token.type === 'text') {
        runs.push(new TextRun({ text: token.content }));
      } else if (token.type === 'strong_open') {
        // 粗体
        const contentToken = tokens[i + 1];
        if (contentToken && contentToken.type === 'text') {
          runs.push(new TextRun({ text: contentToken.content, bold: true }));
          i += 2; // 跳过 content 和 close
        }
      } else if (token.type === 'em_open') {
        // 斜体
        const contentToken = tokens[i + 1];
        if (contentToken && contentToken.type === 'text') {
          runs.push(new TextRun({ text: contentToken.content, italics: true }));
          i += 2; // 跳过 content 和 close
        }
      } else if (token.type === 'code_inline') {
        // 行内代码
        runs.push(
          new TextRun({
            text: token.content,
            font: 'Courier New',
            shading: { fill: 'F3F4F6' },
          }),
        );
      }
    }

    return runs;
  }

  /**
   * 删除文件
   * @param filePath 文件路径
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      const exists = await existsAsync(filePath);
      if (exists) {
        await unlinkAsync(filePath);
      }
    } catch (error) {
      console.error('删除文件失败:', error);
      // 不抛出错误，避免影响主流程
    }
  }
}

