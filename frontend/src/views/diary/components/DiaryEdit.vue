<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑日记' : '写日记'"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
    class="diary-edit-dialog"
  >
    <div class="diary-form">
      <!-- 情绪选择（必选） -->
      <div class="form-section">
        <MoodSelector v-model="form.mood" />
        <div class="mood-hint" v-if="!form.mood">
          <el-icon><Warning /></el-icon>
          请先选择今天的心情
        </div>
      </div>

      <!-- 日期选择 -->
      <div class="form-row">
        <div class="form-label">日期</div>
        <el-date-picker
          v-model="form.diaryDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="选择日期"
          :disabled-date="disabledDate"
          style="width: 100%"
        />
      </div>

      <!-- 标题（可选） -->
      <div class="form-row">
        <div class="form-label">
          标题 <span class="optional">(可选)</span>
        </div>
        <el-input
          v-model="form.title"
          placeholder="给今天起个标题吧"
          maxlength="100"
          show-word-limit
        />
      </div>

      <!-- 内容 -->
      <div class="form-row">
        <div class="form-label">内容</div>
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="6"
          placeholder="今天发生了什么？记录下来吧..."
          maxlength="5000"
          show-word-limit
        />
      </div>

      <!-- 图片上传 -->
      <div class="form-row">
        <div class="form-label">
          图片 <span class="optional">(最多9张)</span>
        </div>
        <div class="image-upload-area">
          <div 
            v-for="(img, idx) in form.images" 
            :key="idx" 
            class="image-preview-item"
          >
            <img :src="img" alt="preview" />
            <div class="remove-btn" @click="removeImage(idx)">
              <el-icon><Close /></el-icon>
            </div>
          </div>
          <div 
            v-if="form.images.length < 9" 
            class="upload-trigger"
            @click="triggerUpload"
          >
            <el-icon><Plus /></el-icon>
            <span>添加图片</span>
          </div>
        </div>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          multiple
          style="display: none"
          @change="handleFileSelect"
        />
      </div>

      <!-- 标签 -->
      <div class="form-row">
        <div class="form-label">
          标签 <span class="optional">(最多10个)</span>
        </div>
        <div class="tags-input">
          <el-tag
            v-for="tag in form.tags"
            :key="tag"
            closable
            @close="removeTag(tag)"
            style="margin-right: 6px; margin-bottom: 6px;"
          >
            {{ tag }}
          </el-tag>
          <el-input
            v-if="form.tags.length < 10"
            v-model="newTag"
            size="small"
            placeholder="输入标签，回车添加"
            style="width: 150px"
            @keyup.enter="addTag"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button 
          type="primary" 
          @click="handleSave"
          :disabled="!form.mood"
          :loading="saving"
        >
          {{ saving ? '保存中...' : '保存' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Close, Warning } from '@element-plus/icons-vue'
import MoodSelector from '@/components/diary/MoodSelector.vue'
import { createDiary, updateDiary } from '@/api/index.js'

const props = defineProps({
  modelValue: Boolean,
  diary: Object, // 编辑时传入
  userId: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'saved'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isEdit = computed(() => !!props.diary?.id)

// 表单数据
const form = reactive({
  mood: '',
  diaryDate: '',
  title: '',
  content: '',
  images: [],
  tags: []
})

const newTag = ref('')
const saving = ref(false)
const fileInput = ref(null)

// 监听弹窗打开，初始化表单
watch(() => props.modelValue, (val) => {
  if (val) {
    if (props.diary) {
      // 编辑模式
      form.mood = props.diary.mood || ''
      form.diaryDate = props.diary.diary_date?.split('T')[0] || formatDate(new Date())
      form.title = props.diary.title || ''
      form.content = props.diary.content || ''
      form.images = [...(props.diary.images || [])]
      form.tags = [...(props.diary.tags || [])]
    } else {
      // 新建模式
      resetForm()
    }
  }
})

// 格式化日期
const formatDate = (d) => {
  const dt = new Date(d)
  const y = dt.getFullYear()
  const m = String(dt.getMonth() + 1).padStart(2, '0')
  const day = String(dt.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// 禁用未来日期
const disabledDate = (time) => {
  return time.getTime() > Date.now()
}

// 重置表单
const resetForm = () => {
  form.mood = ''
  form.diaryDate = formatDate(new Date())
  form.title = ''
  form.content = ''
  form.images = []
  form.tags = []
  newTag.value = ''
}

// 关闭弹窗
const handleClose = () => {
  visible.value = false
}

// 保存日记
const handleSave = async () => {
  if (!form.mood) {
    ElMessage.warning('请选择心情')
    return
  }
  if (!form.diaryDate) {
    ElMessage.warning('请选择日期')
    return
  }

  saving.value = true
  try {
    const payload = {
      userId: props.userId,
      mood: form.mood,
      diaryDate: form.diaryDate,
      title: form.title,
      content: form.content,
      images: form.images,
      tags: form.tags
    }

    let res
    if (isEdit.value) {
      res = await updateDiary(props.diary.id, props.userId, payload)
    } else {
      res = await createDiary(payload)
    }

    if (res.code === 0) {
      ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
      emit('saved')
      handleClose()
    } else {
      ElMessage.error(res.msg || '保存失败')
    }
  } catch (error) {
    ElMessage.error('保存失败: ' + error.message)
  } finally {
    saving.value = false
  }
}

// 触发文件选择
const triggerUpload = () => {
  fileInput.value?.click()
}

// 处理文件选择
const handleFileSelect = (e) => {
  const files = Array.from(e.target.files)
  const remaining = 9 - form.images.length
  const filesToProcess = files.slice(0, remaining)

  filesToProcess.forEach(file => {
    if (file.size > 5 * 1024 * 1024) {
      ElMessage.warning(`图片 ${file.name} 超过5MB，已跳过`)
      return
    }
    
    const reader = new FileReader()
    reader.onload = (event) => {
      // 压缩图片
      compressImage(event.target.result, (compressed) => {
        form.images.push(compressed)
      })
    }
    reader.readAsDataURL(file)
  })

  // 清空input以支持重复选择相同文件
  e.target.value = ''
}

// 图片压缩
const compressImage = (base64, callback) => {
  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    const maxSize = 1200
    let width = img.width
    let height = img.height

    if (width > maxSize || height > maxSize) {
      if (width > height) {
        height = Math.round((height * maxSize) / width)
        width = maxSize
      } else {
        width = Math.round((width * maxSize) / height)
        height = maxSize
      }
    }

    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, width, height)
    
    callback(canvas.toDataURL('image/jpeg', 0.8))
  }
  img.src = base64
}

// 移除图片
const removeImage = (idx) => {
  form.images.splice(idx, 1)
}

// 添加标签
const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !form.tags.includes(tag) && form.tags.length < 10) {
    form.tags.push(tag)
    newTag.value = ''
  }
}

// 移除标签
const removeTag = (tag) => {
  const idx = form.tags.indexOf(tag)
  if (idx > -1) {
    form.tags.splice(idx, 1)
  }
}
</script>

<style scoped>
.diary-form {
  padding: 0 8px;
}

.form-section {
  margin-bottom: 20px;
}

.mood-hint {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #e6a23c;
  font-size: 13px;
  margin-top: 8px;
}

.form-row {
  margin-bottom: 16px;
}

.form-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-label .optional {
  color: #909399;
  font-weight: normal;
  font-size: 12px;
}

/* 图片上传区域 */
.image-upload-area {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.image-preview-item {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.image-preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
}

.remove-btn:hover {
  background: rgba(245, 108, 108, 0.8);
}

.upload-trigger {
  width: 100px;
  height: 100px;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  color: #909399;
  transition: all 0.3s;
}

.upload-trigger:hover {
  border-color: #409eff;
  color: #409eff;
}

.upload-trigger .el-icon {
  font-size: 24px;
}

.upload-trigger span {
  font-size: 12px;
}

/* 标签输入 */
.tags-input {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式 */
@media (max-width: 768px) {
  :deep(.diary-edit-dialog) {
    width: 95% !important;
    margin: 10px auto !important;
  }
  
  .image-preview-item,
  .upload-trigger {
    width: 80px;
    height: 80px;
  }
}
</style>

