<template>
  <el-button type="primary" class="add-btn" @click="addCatType">添加分类</el-button>
  <el-table :data="catTypeList" border style="width: 100%" max-height="800">
    <el-table-column prop="id" label="id" width="100" align="center" />
    <el-table-column prop="type_name" label="分类名称" width="150" align="center" />
    <el-table-column prop="img_data" label="图片" width="120" align="center">
      <template #default="scope">
        <img 
          v-if="scope.row.img_data" 
          :src="getImageUrl(scope.row.img_data)" 
          style="width: 50px; height: 50px; cursor: pointer; object-fit: cover;" 
          @click="showImagePreview(scope.row.img_data)"
        />
        <span v-else>无图片</span>
      </template>
    </el-table-column>
    <el-table-column prop="body_size" label="体型" width="120" align="center" />
    <el-table-column prop="color" label="颜色" width="120" align="center" />
    <el-table-column prop="average_life" label="平均寿命" width="120" align="center" />
    <el-table-column prop="origin" label="原产地" width="150" align="center" />
    <el-table-column prop="desc" label="描述" min-width="300" align="center">
      <template #default="scope">
        <div class="desc" v-html="scope.row.desc" :title="scope.row.desc"></div>
      </template>
    </el-table-column>
    <el-table-column prop="created_at" label="创建时间" width="180" align="center" />
    <el-table-column label="操作" min-width="150" align="center">
      <template #default="scope">
        <el-button link type="primary" size="small" @click="editCatType(scope.row)">
          编辑
        </el-button>
        <el-button link type="danger" size="small" @click="deleteCatType(scope.row.id)">
          删除
        </el-button>
      </template>
    </el-table-column>
  </el-table>

  <el-dialog draggable v-model="showDialog" :title="dialogTitle" width="40%" :before-close="handleClose">
    <el-form :model="form" label-width="100px" :size="formSize" ref="ruleFormRef" :rules="rules">
      <el-form-item label="分类名称" prop="type_name">
        <el-input v-model="form.type_name" style="width: 300px;" />
      </el-form-item>
      <el-form-item label="图片" prop="img_data">
        <el-upload
          class="image-uploader"
          :show-file-list="false"
          :before-upload="beforeImageUpload"
          :on-success="handleImageSuccess"
          :on-error="handleImageError"
          action="/api/cat-type/upload-image"
        >
          <img v-if="form.img_data" :src="getImageUrl(form.img_data)" class="image-preview" />
          <el-icon v-else class="image-uploader-icon"><Plus /></el-icon>
        </el-upload>
      </el-form-item>
      <el-form-item label="体型" prop="body_size">
        <el-input v-model="form.body_size" style="width: 300px;" />
      </el-form-item>
      <el-form-item label="颜色" prop="color">
        <el-input v-model="form.color" style="width: 300px;" />
      </el-form-item>
      <el-form-item label="平均寿命" prop="average_life">
        <el-input v-model="form.average_life" style="width: 300px;" />
      </el-form-item>
      <el-form-item label="原产地" prop="origin">
        <el-input v-model="form.origin" style="width: 300px;" />
      </el-form-item>
      <el-form-item label="描述" prop="desc">
        <el-input v-model="form.desc" type="textarea" :rows="3" style="width: 300px;" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="confirm">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 图片预览对话框 -->
  <el-dialog v-model="showImageDialog" title="图片预览" width="auto" align-center>
    <div class="image-preview-container">
      <img :src="previewImageUrl" class="preview-image" />
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { getCatTypeSync, addCatTypeSync, deleteCatTypeSync, editCatTypeSync, uploadCatTypeImageSync } from '@/api/index.js';
import { ElMessageBox, ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';

const catTypeList = ref([])
const showDialog = ref(false)
const dialogTitle = ref('添加分类')
const formSize = ref('default')

// 图片预览相关
const showImageDialog = ref(false)
const previewImageUrl = ref('')
const form = ref({
  type_name: '',
  img_data: null,
  body_size: '',
  color: '',
  average_life: '',
  origin: '',
  desc: '',
})

const initForm = ref({
  type_name: '',
  img_data: null,
  body_size: '',
  color: '',
  average_life: '',
  origin: '',
  desc: '',
})

const ruleFormRef = ref()

const rules = reactive({
  type_name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' }
  ],
  body_size: [
    { required: true, message: '请输入体型', trigger: 'blur' }
  ],
  color: [
    { required: true, message: '请输入颜色', trigger: 'blur' }
  ],
  average_life: [
    { required: true, message: '请输入平均寿命', trigger: 'blur' }
  ],
  origin: [
    { required: true, message: '请输入原产地', trigger: 'blur' }
  ],
  desc: [
    { required: true, message: '请输入描述', trigger: 'blur' }
  ]
})

onMounted(() => {
  getCatTypeList();
});

// 图片处理相关方法
const getImageUrl = (imgData) => {
  if (!imgData) return '';
  if (typeof imgData === 'string') {
    // 如果已经是完整的data URL，直接返回
    if (imgData.startsWith('data:')) {
      return imgData;
    }
    // 如果是base64字符串，添加data URL前缀
    return `data:image/jpeg;base64,${imgData}`;
  }
  return '';
};

const beforeImageUpload = (file) => {
  const isImage = file.type.startsWith('image/');
  const isLt5M = file.size / 1024 / 1024 < 5;

  if (!isImage) {
    ElMessage.error('只能上传图片文件!');
    return false;
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!');
    return false;
  }
  return true;
};

const handleImageSuccess = (response, file) => {
  if (response.code === 0) {
    // 直接使用后端返回的base64字符串
    form.value.img_data = response.data.base64;
    ElMessage.success('图片上传成功');
  } else {
    ElMessage.error('图片上传失败：' + response.msg);
  }
};

const handleImageError = (error) => {
  ElMessage.error('图片上传失败');
  console.error('Upload error:', error);
};

// 显示图片预览
const showImagePreview = (imgData) => {
  if (!imgData) return;
  previewImageUrl.value = getImageUrl(imgData);
  showImageDialog.value = true;
};

const getCatTypeList = async () => {
  const res = await getCatTypeSync();
  if (res.code != 0) {
    ElMessage.error(res.msg)
    return
  }
  catTypeList.value = res.data;
  catTypeList.value.forEach(item => {
    item.created_at = window.Util.transformTime(item.created_at)
  })
};

const addCatType = () => {
  showDialog.value = true
  dialogTitle.value = '添加分类'
  ruleFormRef.value.clearValidate()
  form.value = JSON.parse(JSON.stringify(initForm.value))
}

const handleClose = () => {
  showDialog.value = false
}

const confirm = () => {
  if (dialogTitle.value == '添加分类') {
    addCatTypeSync(form.value).then(res => {
      if (res.code != 0) {
        ElMessage.error(res.msg)
        return
      }
      getCatTypeList()
      showDialog.value = false
      ElMessage.success('添加成功')
    }).catch(() => {
      ElMessage.error('添加失败')
    })
  } else {
    editCatTypeSync(form.value).then(res => {
      if (res.code != 0) {
        ElMessage.error(res.msg)
        return
      }
      getCatTypeList()
      showDialog.value = false
      ElMessage.success('编辑成功')
    }).catch(() => {
      ElMessage.error('编辑失败')
    })
  }
}

const deleteCatType = (id) => {
  ElMessageBox.confirm('确定删除该分类吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    deleteCatTypeSync(id).then(res => {
      if (res.code != 0) {
        ElMessage.error(res.msg)
        return
      }
      getCatTypeList()
      ElMessage.success('删除成功')
    }).catch(() => {
      ElMessage.error('删除失败')
    })
  })
}

const editCatType = (row) => {
  form.value = { ...row }
  dialogTitle.value = '编辑分类'
  showDialog.value = true
}
</script>

<style>
.add-btn {
  margin-bottom: 20px;
}
.desc {
  overflow: hidden;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  display: -webkit-box;
}

.image-uploader {
  .image-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100px;
    height: 100px;
    line-height: 100px;
    text-align: center;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  
  .image-preview {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 6px;
    border: 1px solid #d9d9d9;
  }
}

.image-preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 80vw;
  max-height: 80vh;
  
  .preview-image {
    height: 720px;
    width: auto;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}
</style>