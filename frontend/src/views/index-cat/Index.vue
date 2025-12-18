<template>
  <div class="photos-page">
      <div class="toolbar">
        <el-button type="primary" @click="openDialog">上传照片</el-button>
      </div>

      <el-dialog v-model="showDialog" title="上传照片" width="520px">
        <el-form label-width="80px">
          <el-form-item label="图片">
            <el-upload
              :show-file-list="false"
              :before-upload="beforeUpload"
              :http-request="doUpload"
              accept="image/*"
            >
              <el-button type="primary">选择图片</el-button>
              <span v-if="tempPreview" class="preview-hint">已选择</span>
            </el-upload>
            <div v-if="tempPreview" class="preview">
              <img :src="tempPreview" alt="preview" />
            </div>
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="form.description" type="textarea" :rows="3" maxlength="200" show-word-limit placeholder="请输入图片描述" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showDialog=false">取消</el-button>
          <el-button type="primary" @click="submit">提交</el-button>
        </template>
      </el-dialog>

      <div class="waterfall" ref="waterRef">
        <template v-if="skeleton && !list.length">
          <div v-for="n in 8" :key="n" class="water-item skeleton">
            <div class="sk-img"></div>
            <div class="sk-text"></div>
          </div>
        </template>
        <div v-for="(item, idx) in list" :key="item.id" class="water-item">
          <div class="image-wrap">
            <img 
              v-lazyimg="toDataUrl(item.image)"
              :alt="item.description"
              style="cursor: zoom-in;"
              @click="openPreview(idx)"
            />
            <div class="mask"></div>
            <el-button class="del-btn" circle size="small" @click.stop="remove(item.id)">
              <el-icon><Delete /></el-icon>
            </el-button>
            <el-button class="edit-btn" circle size="small" @click.stop="openEdit(item)">
              <el-icon><Edit /></el-icon>
            </el-button>
            <div class="desc-overlay">
              <template v-if="editingId !== item.id">
                <span class="desc-text" @dblclick.stop="openInlineEdit(item)">{{ item.description || '双击添加描述' }}</span>
              </template>
              <template v-else>
                <input
                  class="desc-input"
                  v-model="inlineDesc"
                  @keydown.enter.stop.prevent="commitInlineEdit()"
                  @keydown.esc.stop.prevent="cancelInlineEdit()"
                  @click.stop
                  placeholder="输入描述后按 Enter 保存，Esc 取消"
                />
              </template>
            </div>
          </div>
        </div>
      </div>
      <div class="loading-more" v-if="loading">加载中...</div>
      <div class="loading-more done" v-if="finished">没有更多了</div>

      <!-- 图片预览弹窗 -->
      <el-dialog v-model="showPreview" width="60%" class="img-dialog" :show-close="true">
        <div class="img-preview-wrap">
          <button class="nav-btn left" @click.stop="prevPreview">‹</button>
          <img :src="currentPreviewSrc" alt="preview" />
          <button class="nav-btn right" @click.stop="nextPreview">›</button>
        </div>
      </el-dialog>

      <!-- 编辑描述弹窗 -->
      <el-dialog v-model="showEditDialog" title="编辑描述" width="520px">
        <el-input v-model="editForm.description" type="textarea" :rows="4" maxlength="200" show-word-limit placeholder="请输入描述" />
        <template #footer>
          <el-button @click="showEditDialog=false">取消</el-button>
          <el-button type="primary" @click="submitEdit">保存</el-button>
        </template>
      </el-dialog>

      <!-- 回到顶部悬浮按钮 -->
      <el-backtop :right="24" :bottom="24" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete, Edit } from '@element-plus/icons-vue'
import { getPhotoWallList, addPhotoWall, uploadPhotoTemp, deletePhotoWall } from '@/api/index.js'
import { editPhotoWall } from '@/api/index.js'

const showDialog = ref(false)
const tempPreview = ref('')
const tempPayload = ref(null)
const form = ref({ description: '' })
const list = ref([])
const loading = ref(false)
const finished = ref(false)
const pageSize = 20
const skeleton = ref(true)
const waterRef = ref(null)
const showPreview = ref(false)
const previewIdx = ref(0)
const currentPreviewSrc = computed(() => list.value[previewIdx.value] ? toDataUrl(list.value[previewIdx.value].image) : '')
const showEditDialog = ref(false)
const editForm = ref({ id: null, description: '' })
const editingId = ref(null)
const inlineDesc = ref('')

const openDialog = () => { showDialog.value = true }

const beforeUpload = (file) => {
  const allow = ['image/jpeg','image/png','image/gif','image/webp']
  if (!allow.includes(file.type)) { ElMessage.error('仅支持图片文件'); return false }
  if (file.size > 8*1024*1024) { ElMessage.error('图片不能超过8MB'); return false }
  return true
}

const doUpload = async ({ file }) => {
  const fd = new FormData()
  fd.append('file', file)
  const res = await uploadPhotoTemp(fd)
  if (res.code !== 0) { ElMessage.error(res.msg || '上传失败'); return }
  tempPayload.value = res.data
  tempPreview.value = `data:${res.data.mimetype};base64,${res.data.base64}`
}

const submit = async () => {
  if (!tempPayload.value) { ElMessage.error('请先选择图片'); return }
  const res = await addPhotoWall({ image: tempPayload.value.base64, description: form.value.description })
  if (res.code !== 0) { ElMessage.error(res.msg || '提交失败'); return }
  ElMessage.success('已添加')
  showDialog.value = false
  tempPreview.value = ''
  tempPayload.value = null
  form.value.description = ''
  // 将新添加的图片插入到列表开头，避免重新加载整个列表
  if (res.data) {
    list.value.unshift(res.data)
  }
}

const loadList = async (append = false) => {
  if (loading.value) return
  loading.value = true
  const lastId = append && list.value.length ? list.value[list.value.length - 1].id : undefined
  const res = await getPhotoWallList({ lastId, limit: pageSize, _ts: Date.now() })
  if (res.code === 0) {
    const data = res.data || []
    if (append) list.value = list.value.concat(data)
    else list.value = data
    if (!data.length || data.length < pageSize) finished.value = true
  }
  loading.value = false
  skeleton.value = false
}

const onScroll = () => {
  const el = document.documentElement
  const scrollBottom = el.scrollHeight - (el.scrollTop + el.clientHeight)
  if (scrollBottom < 400) loadList(true)
}

const remove = async (id) => {
  const res = await deletePhotoWall(id)
  if (res.code !== 0) { ElMessage.error(res.msg || '删除失败'); return }
  ElMessage.success('已删除')
  // 直接从本地数组中移除，避免重新加载导致滚动位置丢失
  const index = list.value.findIndex(item => item.id === id)
  if (index > -1) {
    list.value.splice(index, 1)
  }
}

const toDataUrl = (base64) => `data:image/*;base64,${base64}`

const openPreview = (idx) => { previewIdx.value = idx; showPreview.value = true }
const prevPreview = () => { if (previewIdx.value > 0) previewIdx.value -= 1 }
const nextPreview = () => { if (previewIdx.value < list.value.length - 1) previewIdx.value += 1 }

const openEdit = (item) => {
  editForm.value = { id: item.id, description: item.description || '' }
  showEditDialog.value = true
}

const submitEdit = async () => {
  const { id, description } = editForm.value
  const res = await editPhotoWall(id, { description })
  if (res.code !== 0) { ElMessage.error(res.msg || '保存失败'); return }
  ElMessage.success('已保存')
  showEditDialog.value = false
  // 更新本地数据
  const idx = list.value.findIndex(i => i.id === id)
  if (idx > -1) list.value[idx].description = description
}

const openInlineEdit = (item) => {
  editingId.value = item.id
  inlineDesc.value = item.description || ''
}

const commitInlineEdit = async () => {
  if (editingId.value == null) return
  const id = editingId.value
  const description = inlineDesc.value
  const res = await editPhotoWall(id, { description })
  if (res.code !== 0) { ElMessage.error(res.msg || '保存失败'); return }
  const idx = list.value.findIndex(i => i.id === id)
  if (idx > -1) list.value[idx].description = description
  editingId.value = null
}

const cancelInlineEdit = () => { editingId.value = null }

onMounted(() => { loadList(); window.addEventListener('scroll', onScroll) })
onBeforeUnmount(() => { window.removeEventListener('scroll', onScroll) })

// 懒加载指令（在 <script setup> 中以 vLazyimg 命名导出，模板用 v-lazyimg）
const vLazyimg = {
  mounted(el, binding) {
    const src = binding.value
    el.setAttribute('data-src', src)
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const s = el.getAttribute('data-src')
          if (s) {
            el.src = s
            el.removeAttribute('data-src')
          }
          io.disconnect()
        }
      })
    }, { rootMargin: '100px' })
    io.observe(el)
  },
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.toolbar { display: flex; padding: 16px 0; }

.preview { margin-top: 8px; }
.preview img { width: 120px;height: 160px; border-radius: 8px; display: block; }
.preview-hint { margin-left: 8px; color: #909399; }

/* 瀑布流布局（masonry-like）*/
.waterfall {
  column-count: 4;
  column-gap: 16px;
  padding: 8px 16px 24px;
}
.water-item {
  break-inside: avoid;
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.image-wrap { position: relative; }
.water-item img { width: 100%; height: auto; display: block; }
.mask { position: absolute; inset: 0; background: rgba(0,0,0,0.0); transition: background 0.2s; }
.del-btn { position: absolute; top: 8px; right: 8px; opacity: 0; transition: opacity 0.2s; color: #fff; background: rgba(0,0,0,0.4); border: none; }
.edit-btn { position: absolute; top: 8px; right: 44px; opacity: 0; transition: opacity 0.2s; color: #fff; background: rgba(0,0,0,0.4); border: none; }
.desc-overlay { position: absolute; left: 0; right: 0; bottom: 0; padding: 8px 10px; background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 100%); }
.desc-text { display: block; color: #fff; font-size: 13px; line-height: 1.4; max-height: 3.6em; overflow: hidden; }
.desc-input { width: 100%; border: none; outline: none; padding: 6px 8px; border-radius: 4px; background: rgba(255,255,255,0.9); font-size: 13px; }
.image-wrap:hover .mask { background: rgba(0,0,0,0.12); }
.image-wrap:hover .del-btn, .image-wrap:hover .edit-btn { opacity: 1; }

/* 骨架屏 */
.skeleton .sk-img { width: 100%; height: 200px; background: linear-gradient(90deg,#f2f2f2,#eaeaea,#f2f2f2); background-size: 200px 100%; animation: sk 1.2s infinite; }
.skeleton .sk-text { height: 16px; margin: 8px 10px 12px; background: #eee; border-radius: 4px; }
@keyframes sk { 0% { background-position: -200px 0; } 100% { background-position: calc(200px + 100%) 0; } }

.loading-more { text-align: center; padding: 12px; color: #909399; }
.loading-more.done { color: #c0c4cc; }

.img-dialog :deep(.el-dialog__body) { padding: 0; }
.img-preview-wrap { width: 100%; background: #000; display: flex; justify-content: center; align-items: center; }
.img-preview-wrap img { max-width: 100%; max-height: 80vh; display: block; }
.nav-btn { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.4); color: #fff; border: none; width: 36px; height: 36px; border-radius: 18px; cursor: pointer; }
.nav-btn.left { left: 12px; }
.nav-btn.right { right: 12px; }

@media (max-width: 1400px) { .waterfall { column-count: 3; } }
@media (max-width: 992px) { .waterfall { column-count: 2; } }
@media (max-width: 600px) { .waterfall { column-count: 1; } }
</style>