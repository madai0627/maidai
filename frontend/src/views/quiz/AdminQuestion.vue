<template>
  <div class="page">
    <div class="toolbar">
      <el-button type="success" @click="addQuestion">新增题目</el-button>
      <el-button type="primary" @click="showUploadDialog = true">批量导入</el-button>
      <el-button type="info" @click="downloadTemplate">下载模板</el-button>
      <el-button 
        type="danger" 
        :disabled="selectedQuestions.length === 0" 
        @click="batchDelete"
        style="margin-left: 8px"
      >
        批量删除 ({{ selectedQuestions.length }})
      </el-button>
      <el-select v-model.number="filterCategoryId" placeholder="按分类筛选" clearable style="margin-left: 8px; width: 150px">
        <el-option :value="0" label="全部分类" />
        <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
      </el-select>
      <el-select v-model.number="difficulty" placeholder="按难度筛选" clearable style="margin-left: 8px; width: 120px">
        <el-option :value="''" label="全部难度" />
        <el-option :value="1" label="简单" />
        <el-option :value="2" label="中等" />
        <el-option :value="3" label="困难" />
      </el-select>
      <el-input v-model="keyword" placeholder="搜索题目内容" clearable style="margin-left: 8px; width: 200px" />
      <el-button type="primary" style="margin-left: 8px" @click="onSearch">查询</el-button>
      <el-button style="margin-left: 4px" @click="onReset">重置</el-button>
    </div>

    <el-table :data="questions" border style="width: 100%" @selection-change="handleSelectionChange" v-loading="loading">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column prop="category.name" label="分类" width="160" align="center" />
      <el-table-column prop="content" label="题干" min-width="240" />
      <el-table-column prop="optionA" label="A" min-width="140" />
      <el-table-column prop="optionB" label="B" min-width="140" />
      <el-table-column prop="optionC" label="C" min-width="140" />
      <el-table-column prop="optionD" label="D" min-width="140" />
      <el-table-column prop="correctAnswer" label="正确" width="80" align="center" />
      <el-table-column prop="difficulty" label="难度" width="80" align="center">
        <template #default="scope">
          <el-tag :type="getDifficultyType(scope.row.difficulty)" size="small">
            {{ getDifficultyText(scope.row.difficulty) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" align="center">
        <template #default="scope">
          <el-button link type="primary" size="small" @click="editRow(scope.row)">编辑</el-button>
          <el-button link type="danger" size="small" @click="remove(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <div class="pager">
      <el-pagination
        background
        layout="prev, pager, next, sizes, total"
        :total="total"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
        :page-sizes="[10, 20, 50, 100]"
      />
    </div>

    <el-dialog draggable v-model="showDialog" :title="dialogTitle" width="50%" :before-close="handleClose">
      <el-form :model="form" label-width="90px">
        <el-form-item label="分类">
          <el-select v-model.number="form.categoryId" placeholder="选择分类" style="width: 240px">
            <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="题干">
          <el-input v-model="form.content" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="选项A">
          <el-input v-model="form.optionA" />
        </el-form-item>
        <el-form-item label="选项B">
          <el-input v-model="form.optionB" />
        </el-form-item>
        <el-form-item label="选项C">
          <el-input v-model="form.optionC" />
        </el-form-item>
        <el-form-item label="选项D">
          <el-input v-model="form.optionD" />
        </el-form-item>
        <el-form-item label="正确答案">
          <el-select v-model="form.correctAnswer" style="width: 120px">
            <el-option value="A" label="A" />
            <el-option value="B" label="B" />
            <el-option value="C" label="C" />
            <el-option value="D" label="D" />
          </el-select>
        </el-form-item>
        <el-form-item label="难度">
          <el-select v-model.number="form.difficulty" style="width: 120px">
            <el-option :value="1" label="简单" />
            <el-option :value="2" label="中等" />
            <el-option :value="3" label="困难" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="confirmEdit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Excel上传对话框 -->
    <el-dialog v-model="showUploadDialog" title="批量导入题目" width="600px">
      <div class="upload-section">
        <el-alert title="Excel格式要求" type="info" :closable="false" style="margin-bottom: 20px;">
          <template #default>
            <p>请确保Excel文件包含以下列（按顺序）：</p>
            <ul>
              <li><strong>分类</strong> - 题目所属分类名称</li>
              <li><strong>题目</strong> - 题目内容</li>
              <li><strong>选项A</strong> - 选项A内容</li>
              <li><strong>选项B</strong> - 选项B内容</li>
              <li><strong>选项C</strong> - 选项C内容</li>
              <li><strong>选项D</strong> - 选项D内容</li>
              <li><strong>正确答案</strong> - A、B、C、D之一</li>
              <li><strong>难度</strong> - 1(简单)、2(中等)、3(困难)</li>
            </ul>
          </template>
        </el-alert>

        <el-upload
          ref="uploadRef"
          :auto-upload="false"
          :on-change="handleFileChange"
          :before-upload="beforeUpload"
          accept=".xlsx,.xls"
          drag
          style="width: 100%"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            将Excel文件拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              只能上传xlsx/xls文件，且不超过10MB
            </div>
          </template>
        </el-upload>

        <div v-if="uploadResult" class="upload-result">
          <el-alert :title="uploadResult.message" :type="uploadResult.failed > 0 ? 'warning' : 'success'" style="margin-top: 20px;">
            <template #default>
              <p>总计：{{ uploadResult.total }} 题</p>
              <p>成功：{{ uploadResult.success }} 题</p>
              <p v-if="uploadResult.failed > 0">失败：{{ uploadResult.failed }} 题</p>
              <p v-if="uploadResult.newCategories.length > 0">新增分类：{{ uploadResult.newCategories.join(', ') }}</p>
              <div v-if="uploadResult.errors.length > 0" style="margin-top: 10px;">
                <p><strong>错误详情：</strong></p>
                <ul style="margin: 5px 0; padding-left: 20px;">
                  <li v-for="error in uploadResult.errors.slice(0, 5)" :key="error">{{ error }}</li>
                </ul>
                <p v-if="uploadResult.errors.length > 5">...还有{{ uploadResult.errors.length - 5 }}个错误</p>
              </div>
            </template>
          </el-alert>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showUploadDialog = false">取消</el-button>
          <el-button type="primary" @click="handleUpload" :disabled="!selectedFile" :loading="uploading">
            {{ uploading ? '上传中...' : '开始导入' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import axios from 'axios'
import { getQuizCategories, getQuizQuestions, addQuizQuestion, editQuizQuestion, deleteQuizQuestion, importQuizQuestions, downloadQuizTemplate, batchDeleteQuizQuestions } from '@/api'

const categories = ref([])
const questions = ref([])
const selectedQuestions = ref([])
const filterCategoryId = ref(0)
const keyword = ref('')
const difficulty = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)
const showDialog = ref(false)
const dialogTitle = ref('新增题目')
const form = ref({
  id: null,
  categoryId: '',
  content: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctAnswer: '',
  difficulty: 1
})

// 上传相关变量
const showUploadDialog = ref(false)
const selectedFile = ref(null)
const uploading = ref(false)
const uploadResult = ref(null)
const uploadRef = ref(null)

const loadCategories = async () => {
  const res = await getQuizCategories()
  categories.value = Array.isArray(res) ? res : (res?.data || [])
}

const load = async () => {
  try {
    loading.value = true
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      categoryId: filterCategoryId.value || undefined,
      keyword: keyword.value || undefined,
      difficulty: difficulty.value || undefined
    }
    
    const res = await getQuizQuestions(params)
    
    // 由于响应拦截器已经提取了data，res就是API返回的数据
    questions.value = res.data || []
    total.value = res.total || 0
    currentPage.value = res.page || 1
  } catch (error) {
    console.error('加载题目列表失败:', error)
    ElMessage.error('加载题目列表失败')
  } finally {
    loading.value = false
  }
}

const onSearch = () => { 
  currentPage.value = 1
  load() 
}

const onReset = () => { 
  filterCategoryId.value = 0
  keyword.value = ''
  difficulty.value = ''
  currentPage.value = 1
  load() 
}

const reset = () => {
  form.value = { id: null, categoryId: '', content: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: '', difficulty: 1 }
}

const addQuestion = () => {
  reset()
  dialogTitle.value = '新增题目'
  showDialog.value = true
}

const editRow = (row) => {
  form.value = {
    id: row.id,
    categoryId: row.category?.id,
    content: row.content,
    optionA: row.optionA,
    optionB: row.optionB,
    optionC: row.optionC,
    optionD: row.optionD,
    correctAnswer: row.correctAnswer,
    difficulty: row.difficulty || 1
  }
  dialogTitle.value = '编辑题目'
  showDialog.value = true
}

const handleClose = () => { showDialog.value = false }

const confirmEdit = async () => {
  if (!form.value.categoryId || !form.value.content) { ElMessage.error('请填写完整'); return }
  const payload = { ...form.value }
  
  try {
    if (payload.id) {
      const { id, ...rest } = payload
      const res = await editQuizQuestion(id, rest)
      console.log('编辑响应:', res)
      ElMessage.success('更新成功')
    } else {
      const res = await addQuizQuestion(payload)
      console.log('新增响应:', res)
      ElMessage.success('新增成功')
    }
    showDialog.value = false
    await load()
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error(error.response?.data?.message || error.message || '操作失败')
  }
}

const remove = async (row) => {
  ElMessageBox.confirm('确定删除该题目吗？', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).then(async () => {
    try {
      const res = await deleteQuizQuestion(row.id)
      console.log('删除响应:', res)
      ElMessage.success('删除成功')
      await load()
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error(error.response?.data?.message || error.message || '删除失败')
    }
  })
}

const getDifficultyType = (difficulty) => {
  const types = { 1: 'success', 2: 'warning', 3: 'danger' }
  return types[difficulty] || 'info'
}

const getDifficultyText = (difficulty) => {
  const texts = { 1: '简单', 2: '中等', 3: '困难' }
  return texts[difficulty] || '未知'
}

// 上传相关方法
const handleFileChange = (file) => {
  selectedFile.value = file.raw
  uploadResult.value = null
}

const beforeUpload = (file) => {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                  file.type === 'application/vnd.ms-excel' ||
                  file.name.endsWith('.xlsx') || 
                  file.name.endsWith('.xls')
  
  if (!isExcel) {
    ElMessage.error('只能上传Excel文件!')
    return false
  }
  
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过10MB!')
    return false
  }
  
  return true
}

const handleUpload = async () => {
  if (!selectedFile.value) {
    ElMessage.error('请选择要上传的文件')
    return
  }

  uploading.value = true
  uploadResult.value = null

  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)

    const res = await importQuizQuestions(formData)
    uploadResult.value = res
    
    if (res.success > 0) {
      ElMessage.success(`成功导入 ${res.success} 道题目`)
      await load() // 重新加载题目列表
      await loadCategories() // 重新加载分类列表
    }
    
    if (res.failed > 0) {
      ElMessage.warning(`有 ${res.failed} 道题目导入失败，请查看详情`)
    }

  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error(error.response?.data?.message || error.message || '上传失败')
  } finally {
    uploading.value = false
  }
}

// 下载模板方法
const downloadTemplate = async () => {
  try {
    // 直接使用axios，避免响应拦截器处理blob数据
    const response = await axios.get('/api/quiz/template/download', {
      responseType: 'blob'
    })
    
    // 创建下载链接
    const blob = new Blob([response.data], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = '题目导入模板.xlsx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('模板下载成功')
  } catch (error) {
    console.error('下载模板失败:', error)
    ElMessage.error('下载模板失败')
  }
}

// 分页处理
const handleSizeChange = (newSize) => {
  pageSize.value = newSize
  currentPage.value = 1
  load()
}

const handleCurrentChange = (newPage) => {
  currentPage.value = newPage
  load()
}

// 处理表格选择变化
const handleSelectionChange = (selection) => {
  selectedQuestions.value = selection
}

// 批量删除
const batchDelete = async () => {
  if (selectedQuestions.value.length === 0) {
    ElMessage.warning('请选择要删除的题目')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedQuestions.value.length} 道题目吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const ids = selectedQuestions.value.map(q => q.id)
    await batchDeleteQuizQuestions(ids)
    
    ElMessage.success(`成功删除 ${ids.length} 道题目`)
    selectedQuestions.value = []
    await load() // 重新加载列表
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error(error.response?.data?.message || error.message || '批量删除失败')
    }
  }
}

onMounted(async () => {
  await loadCategories()
  await load()
})
</script>

<style scoped>
.page { padding: 16px; }
.toolbar { margin-bottom: 12px; display: flex; flex-wrap: wrap; gap: 6px; }
.pager { margin-top: 12px; display: flex; justify-content: flex-end; }
input, select { padding: 6px 8px; }
button { padding: 6px 10px; }
table { width: 100%; border-collapse: collapse; margin-top: 12px; }
th, td { border: 1px solid #ddd; padding: 8px; vertical-align: top; }
.wrap { max-width: 260px; word-break: break-all; }
</style>


