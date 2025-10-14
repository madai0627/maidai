<template>
  <div class="page">
    <div class="toolbar">
      <el-button type="success" @click="addQuestion">新增题目</el-button>
      <el-select v-model.number="filterCategoryId" placeholder="按分类筛选" clearable style="margin-left: 8px; width: 200px">
        <el-option :value="0" label="全部分类" />
        <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
      </el-select>
      <el-button type="primary" style="margin-left: 8px" @click="onSearch">查询</el-button>
      <el-button style="margin-left: 4px" @click="onReset">重置</el-button>
    </div>

    <el-table :data="questions" border style="width: 100%">
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
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { getQuizCategories, getQuizQuestionsByCategory, addQuizQuestion, editQuizQuestion, deleteQuizQuestion } from '@/api'

const categories = ref([])
const questions = ref([])
const filterCategoryId = ref(0)
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

const loadCategories = async () => {
  const res = await getQuizCategories()
  categories.value = Array.isArray(res) ? res : (res?.data || [])
}

const load = async () => {
  if (filterCategoryId.value) {
    const res = await getQuizQuestionsByCategory(filterCategoryId.value)
    questions.value = Array.isArray(res) ? res : (res?.data || [])
  } else {
    // 简化：无筛选时，尝试加载每个分类并合并
    const list = []
    for (const c of categories.value) {
      const res = await getQuizQuestionsByCategory(c.id)
      ;(Array.isArray(res) ? res : (res?.data || [])).forEach((x) => list.push(x))
    }
    questions.value = list
  }
}

const onSearch = () => { load() }
const onReset = () => { filterCategoryId.value = 0; load() }

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

onMounted(async () => {
  await loadCategories()
  await load()
})
</script>

<style scoped>
.page { padding: 16px; }
.toolbar { margin-bottom: 12px; display: flex; flex-wrap: wrap; gap: 6px; }
input, select { padding: 6px 8px; }
button { padding: 6px 10px; }
table { width: 100%; border-collapse: collapse; margin-top: 12px; }
th, td { border: 1px solid #ddd; padding: 8px; vertical-align: top; }
.wrap { max-width: 260px; word-break: break-all; }
</style>


