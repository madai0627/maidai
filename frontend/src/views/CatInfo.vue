<template>
  <el-button type="primary" class="add-btn" @click="addCat">添加猫咪</el-button>
  <el-table :data="catList" border style="width: 100%" max-height="800">
    <el-table-column prop="id" label="id" width="100" align="center" />
    <el-table-column prop="name" label="猫咪名称" width="150" align="center" />
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
    <el-table-column prop="type" label="分类" width="120" align="center" />
    <el-table-column prop="age" label="年龄" width="120" align="center" />
    <el-table-column prop="color" label="颜色" width="120" align="center" />
    <el-table-column prop="weight" label="体重(kg)" width="100" align="center" />
    <el-table-column prop="bithday" label="生日" min-width="200" align="center" />
    <el-table-column prop="desc" label="描述" min-width="300" align="center">
      <template #default="scope">
        <div class="desc" :title="scope.row.desc">{{ scope.row.desc }}</div>
      </template>
    </el-table-column>
    <el-table-column label="操作" width="200" align="center">
      <template #default="scope">
        <el-button link type="primary" size="small" @click="setType(scope.row.id)">
          分配类别
        </el-button>
        <el-button link type="warning" size="small" @click="editCat(scope.row)">
          编辑
        </el-button>
        <el-button link type="danger" size="small" @click="deleteCat(scope.row.id)">
          删除
        </el-button>
      </template>
    </el-table-column>
  </el-table>

  <!-- 分配类别对话框 -->
  <el-dialog draggable align-center v-model="showDialog" title="分配类别" width="25%" :before-close="handleClose">
    <div class="type-container">
      <div v-for="type in typeList" :key="type.id" :class="{'type-item': true,'checked': type.id == currentType}" @click="changeType(type.id)">{{ type.type_name }}</div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="success" @click="confirm">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 编辑猫咪对话框 -->
  <el-dialog draggable align-center v-model="showEditDialog" title="编辑猫咪" width="40%" :before-close="handleEditClose">
    <el-form :model="editForm" label-width="80px">
      <el-form-item label="猫咪名称">
        <el-input v-model="editForm.name"  style="width: 300px;" />
      </el-form-item>
      <el-form-item label="图片">
        <el-upload
          class="image-uploader"
          :show-file-list="false"
          :before-upload="beforeImageUpload"
          :on-success="(response, file) => handleImageSuccess(response, file, 'edit')"
          :on-error="handleImageError"
          action="/api/cat-info/upload-image"
        >
          <img v-if="editForm.img_data" :src="getImageUrl(editForm.img_data)" class="image-preview" />
          <el-icon v-else class="image-uploader-icon"><Plus /></el-icon>
        </el-upload>
      </el-form-item>
      <el-form-item label="分类">
        <el-select v-model="editForm.type_id" placeholder="请选择分类" style="width: 300px;">
          <el-option
            v-for="type in typeList"
            :key="type.id"
            :label="type.type_name"
            :value="type.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="颜色">
        <el-input v-model="editForm.color"  style="width: 300px;" />
      </el-form-item>
      <el-form-item label="体重">
        <el-input v-model="editForm.weight" type="number"  style="width: 300px;" />
      </el-form-item>
      <el-form-item label="生日">
        <el-date-picker v-model="editForm.bithday" type="date" placeholder="选择日期" @change="calculateAge" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="editForm.desc" type="textarea"  style="width: 300px;" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleEditClose">取消</el-button>
        <el-button type="primary" @click="confirmEdit">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 添加猫咪对话框 -->
  <el-dialog draggable align-center v-model="showAddDialog" title="添加猫咪" width="40%" :before-close="handleAddClose">
    <el-form :model="addForm" label-width="80px">
      <el-form-item label="猫咪名称">
        <el-input v-model="addForm.name"  style="width: 300px;" />
      </el-form-item>
      <el-form-item label="图片">
        <el-upload
          class="image-uploader"
          :show-file-list="false"
          :before-upload="beforeImageUpload"
          :on-success="(response, file) => handleImageSuccess(response, file, 'add')"
          :on-error="handleImageError"
          action="/api/cat-info/upload-image"
        >
          <img v-if="addForm.img_data" :src="getImageUrl(addForm.img_data)" class="image-preview" />
          <el-icon v-else class="image-uploader-icon"><Plus /></el-icon>
        </el-upload>
      </el-form-item>
      <el-form-item label="分类">
        <el-select v-model="addForm.type_id" placeholder="请选择分类" style="width: 300px;">
          <el-option
            v-for="type in typeList"
            :key="type.id"
            :label="type.type_name"
            :value="type.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="颜色">
        <el-input v-model="addForm.color"  style="width: 300px;" />
      </el-form-item>
      <el-form-item label="体重">
        <el-input v-model="addForm.weight" type="number"  style="width: 300px;" />
      </el-form-item>
      <el-form-item label="生日">
        <el-date-picker v-model="addForm.bithday" type="date" placeholder="选择日期" @change="calculateAge" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="addForm.desc" type="textarea"  style="width: 300px;" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleAddClose">取消</el-button>
        <el-button type="primary" @click="confirmAdd">
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
import { onMounted, ref } from 'vue';
import { getCatListSync, removeCatSync, addCatSync, editCatSync, getCatTypeSync, uploadCatImageSync } from '@/api/index';
import { ElMessageBox, ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';

const catList = ref([]);
const currentCat = ref('')
const showDialog = ref(false)
const typeList = ref([])
const currentType = ref('')

// 编辑猫咪相关
const showEditDialog = ref(false)
const editForm = ref({
  id: null,
  name: '',
  img_data: null,
  type_id: null,
  color: '',
  weight: 0,
  bithday: null,
  desc: ''
})

// 添加猫咪相关
const showAddDialog = ref(false)
const addForm = ref({
  name: '',
  img_data: null,
  type_id: null,
  color: '',
  weight: 0,
  bithday: null,
  desc: ''
})

// 图片预览相关
const showImageDialog = ref(false)
const previewImageUrl = ref('')

onMounted(() => {
  getCatList();
  getTypeList();
});

// 计算年龄的函数
const calculateAge = (birthday) => {
  if (!birthday) return '';
  const today = new Date();
  const birthDate = new Date(birthday);
  
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();
  
  // 如果天数小于0，需要从月份借位
  if (days < 0) {
    months--;
    const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += lastMonth.getDate();
  }
  
  // 如果月份小于0，需要从年份借位
  if (months < 0) {
    years--;
    months += 12;
  }
  
  // 构建年龄字符串
  let ageStr = '';
  if (years > 0) {
    ageStr += years + '年';
  }
  if (months > 0) {
    ageStr += months + '月';
  }
  if (days > 0) {
    ageStr += days + '天';
  }
  
  // 如果都小于1，显示天数
  if (years === 0 && months === 0 && days === 0) {
    ageStr = '0天';
  }
  
  return ageStr;
};

// 获取分类列表
const getTypeList = () => {
  getCatTypeSync().then(res => {
    if (res.code === 0) {
      typeList.value = res.data;
    }
  });
};

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

const handleImageSuccess = (response, file, type) => {
  if (response.code === 0) {
    // 直接使用后端返回的base64字符串
    if (type === 'add') {
      addForm.value.img_data = response.data.base64;
    } else if (type === 'edit') {
      editForm.value.img_data = response.data.base64;
    }
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

const getCatList = () => {
  getCatListSync().then(res => {
    if (res.code != 0) {
      return
    }
    catList.value = res.data
    catList.value.forEach(item => {
      item.bithday = item.bithday ? window.Util.transformTime(item.bithday) : '未知'
      // 计算年龄
      if (item.bithday && item.bithday !== '未知') {
        item.age = calculateAge(item.bithday)
      } else {
        item.age = '未知'
      }
    })
  })
}

const handleClose = () => {
  showDialog.value = false
}

const changeType = (id) => {
  currentType.value = id
}

const setType = (id) => {
  currentCat.value = id
  getCatTypeSync().then(res => {
    if (res.code != 0) {
      return
    }
    typeList.value = res.data
    currentType.value = res.data[0].id
    showDialog.value = true
  })
}

const confirm = () => {
  let type_name = typeList.value.find(item => item.id == currentType.value)?.type_name
  if (!type_name) {
    return
  }
  // 这里需要调用更新猫咪类别的API
  editCatSync(currentCat.value, { type: type_name }).then(res => {
    if (res.code != 0) {
      return
    }
    showDialog.value = false
    getCatList()
  })
}

// 删除猫咪
const deleteCat = (id) => {
  ElMessageBox.confirm('确定删除该猫咪吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    removeCatSync(id).then(res => {
      if (res.code === 0) {
        ElMessage.success('删除成功')
        getCatList()
      } else {
        ElMessage.error('删除失败：' + res.msg)
      }
    })
  })
}

// 编辑猫咪
const editCat = (cat) => {
  // 根据分类名称找到对应的分类ID
  let typeId = null;
  if (cat.type) {
    const selectedType = typeList.value.find(type => type.type_name === cat.type);
    if (selectedType) {
      typeId = selectedType.id;
    }
  }
  
  editForm.value = {
    id: cat.id,
    name: cat.name,
    img_data: cat.img_data,
    type_id: typeId,
    color: cat.color,
    weight: cat.weight,
    bithday: cat.bithday,
    desc: cat.desc
  }
  showEditDialog.value = true
}

// 关闭编辑对话框
const handleEditClose = () => {
  showEditDialog.value = false
  editForm.value = {
    id: null,
    name: '',
    img_data: null,
    type_id: null,
    color: '',
    weight: 0,
    bithday: null,
    desc: ''
  }
}

// 确认编辑
const confirmEdit = () => {
  const formData = { ...editForm.value };
  // 根据生日自动计算年龄
  if (formData.bithday) {
    formData.age = calculateAge(formData.bithday);
  }
  // 根据选择的分类ID获取分类名称
  if (formData.type_id) {
    const selectedType = typeList.value.find(type => type.id === formData.type_id);
    if (selectedType) {
      formData.type = selectedType.type_name;
    }
  }
  editCatSync(editForm.value.id, formData).then(res => {
    if (res.code === 0) {
      ElMessage.success('更新成功')
      showEditDialog.value = false
      getCatList()
    } else {
      ElMessage.error('更新失败：' + res.msg)
    }
  })
}

// 添加猫咪
const addCat = () => {
  addForm.value = {
    name: '',
    img_data: null,
    type_id: null,
    color: '',
    weight: 0,
    bithday: null,
    desc: ''
  }
  showAddDialog.value = true
}

// 关闭添加对话框
const handleAddClose = () => {
  showAddDialog.value = false
}

// 确认添加
const confirmAdd = () => {
  const formData = { ...addForm.value };
  // 根据生日自动计算年龄
  if (formData.bithday) {
    formData.age = calculateAge(formData.bithday);
  }
  // 根据选择的分类ID获取分类名称
  if (formData.type_id) {
    const selectedType = typeList.value.find(type => type.id === formData.type_id);
    if (selectedType) {
      formData.type = selectedType.type_name;
    }
  }
  addCatSync(formData).then(res => {
    if (res.code === 0) {
      ElMessage.success('添加成功')
      showAddDialog.value = false
      getCatList()
    } else {
      ElMessage.error('添加失败：' + res.msg)
    }
  })
}
</script>

<style lang="scss">
.add-btn {
  margin-bottom: 20px;
}

.desc {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.type-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  .type-item {
    height: 30px;
    line-height: 30px;
    padding: 0 10px;
    border: 1px solid #2bbb61;
    color: #2bbb61;
    border-radius: 6px;
    cursor: pointer;
  }
  .type-item.checked {
    background-color: #2bbb61;
    color: #fff;
  }
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