## 文档信息

- **文档名称**：学习模块错题复习与做题记录功能架构设计
- **版本号**：V1.0
- **关联 PRD**：`docs/study-wrong-question-prd.md`
- **撰写人**：（待填）
- **创建日期**：（待填）
- **状态**：草稿

---

## 一、架构目标与约束

- **目标**
  - 在现有学习模块之上，低侵入地增加「错题复习」「做题记录」「学习统计图表」能力。
  - 复用现有题库、做题引擎、用户体系，避免重复造轮子。
  - 通过合理的数据模型与接口，支撑后续扩展（如知识点热力图、智能推荐）。
- **约束假设**
  - 已存在：统一登录体系（单点登录/Token）、题库服务、通用做题组件（前端）、网关层。
  - 技术栈假设（可按实际替换）：
    - 前端：`React/Vue + TypeScript`，SPA；UI 组件库已统一。
    - 后端：`Java(Spring Boot)` 或 `Node(NestJS)` 单体/微服务之一。
    - 数据库：`MySQL`（或兼容 SQL）。

---

## 二、整体架构视图

### 2.1 逻辑分层

- **前端应用层**
  - 学习模块（前台）：新增
    - `WrongQuestionListPage`（错题列表）
    - `WrongQuestionPracticePage`（错题练习）
    - `ExerciseRecordListPage`（做题记录列表）
    - `ExerciseRecordDetailPage`（做题记录详情）
    - `StudyStatsPage`（学习统计页）
  - 复用：通用做题组件 `ExercisePlayer`、题目展示组件 `QuestionPreview` 等。

- **BFF / 网关层（如有）**
  - 负责聚合后端多个服务的数据（题库、做题、统计），向前端暴露简化接口。

- **后端业务服务层**
  - 新增或扩展模块：
    - `exercise-service`：做题记录服务（会话级 + 明细级）。
    - `wrong-question-service`：错题管理服务。
    - `study-stats-service`：学习统计与图表数据服务。
  - 依赖现有服务：
    - `question-service`：题库服务（题干、解析、知识点等）。
    - `user-service`：用户与权限。

- **数据存储层**
  - 关系型数据库（推荐 MySQL）：
    - 表：`wrong_question`、`exercise_record`、`exercise_record_item`。
  - 可选：缓存（Redis）用于热点统计数据。

---

## 三、数据模型设计（与实现对齐）

> 逻辑字段与 PRD 中 5.1 保持一致，这里侧重实现注意点与索引设计。

### 3.1 错题记录表 `wrong_question`

- **用途**：`user_id + question_id` 维度唯一记录错题与掌握状态。
- **核心字段**
  - `id` (PK)
  - `user_id` (NOT NULL)
  - `question_id` (NOT NULL)
  - `first_wrong_time`, `last_wrong_time`
  - `wrong_count`, `correct_after_wrong_count`
  - `status` (TINYINT，0/1/2)
  - `subject_code`, `knowledge_codes` (JSON / 逗号分隔)
  - `question_type`, `difficulty`
  - `last_source_type`, `last_source_id`
  - `is_deleted`, `created_at`, `updated_at`
- **索引**
  - 唯一索引：`uk_user_question (user_id, question_id)`
  - 查询索引：
    - `idx_user_subject_status (user_id, subject_code, status)`
    - `idx_user_last_wrong (user_id, last_wrong_time)`
- **实现要点**
  - 插入/更新需使用「插入或更新」语义（如 `ON DUPLICATE KEY UPDATE`）保证错题去重。
  - `knowledge_codes` 使用 JSON 或字符串时，需要明确约定解析方式，避免前后端不一致。

### 3.2 做题记录表 `exercise_record`

- **用途**：一次完整做题会话的聚合结果。
- **索引建议**
  - `idx_user_time (user_id, start_time)`
  - `idx_user_subject (user_id, subject_code)`

### 3.3 做题记录明细表 `exercise_record_item`

- **用途**：记录每道题的作答情况，支撑错题生成与统计。
- **索引建议**
  - `idx_record (record_id)`
  - `idx_user_question (user_id, question_id)`
  - `idx_user_knowledge (user_id, subject_code)`（视统计需求增加联合索引）。

---

## 四、后端服务设计

### 4.1 模块划分

- **`exercise-service`**
  - 职责：
    - 接收通用做题引擎的提交结果，生成 `exercise_record` 与 `exercise_record_item`。
    - 提供做题记录列表与详情接口。
  - 与现有引擎集成方式：
    - 在「交卷」逻辑后，调用本服务的内部方法/接口写入记录。

- **`wrong-question-service`**
  - 职责：
    - 基于 `exercise_record_item` 自动产生/更新错题。
    - 提供错题列表、批量状态更新、错题练习题组生成接口。
  - 流程：
    - 消费 `exercise_record_item` 写入事件（推荐异步），更新 `wrong_question`。

- **`study-stats-service`**
  - 职责：
    - 基于 `exercise_record` 与 `exercise_record_item` 提供统计数据。
    - 对统计结果做缓存（按用户 + 时间段）。

### 4.2 关键业务流程

#### 4.2.1 提交试卷 → 生成记录 & 错题

1. 学生在前端提交整套题。
2. 通用做题引擎完成判分，生成本次作答的题目级结果。
3. `exercise-service`：
   - 写入一条 `exercise_record`（会话级）。
   - 批量写入 `exercise_record_item`。
4. `wrong-question-service`：
   - 同步或通过消息队列消费本次 `exercise_record_item` 列表；
   - 对每条错误题目，按 `(user_id, question_id)` 插入或更新 `wrong_question`；
   - 记录 `wrong_count`、`first_wrong_time`、`last_wrong_time` 等。

#### 4.2.2 错题练习 → 更新掌握度

1. 前端基于错题列表或条件调用「生成练习题组」接口，获得 `questionIds`。
2. 前端使用通用 `ExercisePlayer` 加载这些题目进行练习。
3. 提交时同样走 `exercise-service` 写入记录。
4. `wrong-question-service`：
   - 对本次练习中属于错题本的题目，若答对，增加 `correct_after_wrong_count`。
   - 根据配置的规则（如「最近 N 次均答对」），标记/建议为已掌握。

---

## 五、接口设计（实现视角）

> 与 PRD 保持一致，这里补充分层与异常处理注意点。

### 5.1 错题接口（`wrong-question-service`）

- `GET /api/wrong-questions`
  - 仅返回当前登录用户的数据，后端根据 Token 解析 `user_id`，前端不传或仅传校验字段。
  - 支持分页、筛选、排序。
- `POST /api/wrong-questions/status`
  - 入参：`ids[] + status`，后端需校验这些 `id` 均属于当前用户。
- `POST /api/wrong-questions/practice`
  - 根据筛选条件和 limit，从 `wrong_question` 中抽取题目 ID 列表。
  - 注意避免一次抽取过多导致前端卡顿，建议设置上限（如 50）。

### 5.2 做题记录接口（`exercise-service`）

- `GET /api/exercise-records`
  - 根据 `user_id` + 过滤条件查询 `exercise_record` 并分页返回。
- `GET /api/exercise-records/{id}`
  - 返回 `record` + `items`；
  - 校验该记录是否属于当前用户。

### 5.3 统计接口（`study-stats-service`）

- `GET /api/stats/learning-overview`
  - 聚合最近 N 天的 `exercise_record`，计算：
    - 总做题次数、总题数、平均正确率、变化趋势。
  - 可将结果按「用户 + 范围」缓存。
- `GET /api/stats/learning-detail`
  - 根据时间段、科目，汇总：
    - 正确率趋势；
    - 科目/知识点维度统计；
    - 题型分布。

---

## 六、前端架构设计

### 6.1 路由与模块组织

- 学习模块根路由：`/study`
  - `StudyHome`：首页，加载概览接口并展示卡片 + 小图表。
  - `WrongQuestionListPage`：`/study/wrong-questions`
  - `WrongQuestionPracticePage`：`/study/wrong-questions/practice`
  - `ExerciseRecordListPage`：`/study/records`
  - `ExerciseRecordDetailPage`：`/study/records/:id`
  - `StudyStatsPage`：`/study/stats`

### 6.2 组件拆分与复用

- **列表 & 过滤**
  - 公共列表组件与分页组件复用现有模式，仅组装不同数据字段。
  - 过滤栏中的下拉选项（科目、知识点等）优先复用现有公共数据源/接口。
- **做题体验**
  - 错题练习页内部仅负责「拉取 questionIds 并传给 `ExercisePlayer`」；
  - 判分与作答逻辑仍由统一做题模块处理，避免重复实现。
- **图表**
  - 统一使用现有图表封装（如 `ECharts` 封装组件），只变更配置项与数据源。

### 6.3 状态管理与缓存

- 推荐：
  - 将列表筛选条件、分页信息保存在路由 query 或全局 store，方便返回时还原。
  - 学习统计页面的时间范围与科目选择可缓存，避免频繁切换时重复请求。

---

## 七、非功能与横切关注点

### 7.1 性能

- 对 `exercise_record`、`exercise_record_item`、`wrong_question` 的查询必须走合适索引。
- 对统计接口增加缓存层，避免在高并发下直接对明细表做复杂聚合。
- 错题更新建议异步：
  - 交卷时仅写入 `exercise_record_item`；
  - 通过消息队列/异步任务更新 `wrong_question`，降低请求延迟。

### 7.2 安全

- 所有接口从 Token 中解析 `user_id`，禁止客户端传入任意 `user_id`。
- 在查询与更新时，统一校验「记录归属当前用户」。

### 7.3 可观测性

- 为关键流程打日志与埋点：
  - 错题生成/更新、错题练习、统计接口调用。
- 统计错误率、接口耗时，用于后续性能优化与产品运营分析。

---

## 八、演进路线

- **短期**
  - 按 PRD 阶段划分实现 MVP → P1 → P2。
  - 优先打通完整数据链路（做题 → 记录 → 错题 → 统计）。
- **中期**
  - 在 `study-stats-service` 之上增加知识点掌握度模型。
  - 引入简单推荐逻辑：基于错题、薄弱知识点，推荐个性化练习。
- **长期**
  - 将统计结果与推荐能力抽象为统一「学习画像服务」，为老师端、家长端和其他模块提供支持。


