<template>
  <div class="carousel">
    <div class="carousel-top">
      <!-- 上传图片 -->
      <el-upload class="upload-demo" :action="ActionUrl + '/upload'" :before-upload="beforeUpload" :multiple="true" :on-success="handlePreview"
        :on-error="handleError" :limit="1" :show-file-list="false">
        <el-button type="primary">上传图片</el-button>
      </el-upload>

      <!-- 表格 -->
      <el-table :data="acspklList" style="width: 100%;margin-top: 20px;">
        <el-table-column prop="_id" label="id" align="center" />
        <el-table-column label="图片" align="center">
          <template v-slot="scope">
            <img :src="scope.row.imgsrc" alt="图片路径错误" style="height: 50px" />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template v-slot="scope">
            <el-button type="danger" size="small" @click="handleClose(scope.row._id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <loading :loadState="loadState" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import service from '@/utils/request';
import { ElMessage, ElMessageBox } from 'element-plus';
import loading from '@/components/loading.vue';
import { compressImage } from '@/utils/compressImage';



const acspklList = ref([])
const ActionUrl = ref<string>('')
const loadState = ref<boolean>(false)



// 删除
const handleClose = (id: string) => {
  ElMessageBox.confirm('您确定要删除该图片吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      delacspk(id)
    })
    .catch(() => {
      ElMessage.success('取消删除')
    })
}

// 获取轮播图数据
const getacspk = () => {
  loadState.value = true
  service.get(`/getacspimgs`).then((res: any) => {
    acspklList.value = res.asimgs
    loadState.value = false
  })
}

onMounted(() => {
  getacspk()
  ActionUrl.value = import.meta.env.VITE_GLOB_API_URL
})

// 上传成功时
const handlePreview = (uploadFile: any) => {
  const imgsrc = import.meta.env.VITE_GLOB_API_URL + '/' + uploadFile.path;
  handleOnSubmit(imgsrc)
}

// 上传图片-添加到后端数据库
const handleOnSubmit = (uploadFile: string) => {
  service.post('/addacspackimg', { imgsrc: uploadFile }).then((res: any) => {
    if (res.code === 200) {
      ElMessage.success('上传成功')
      getacspk()
    }
  })
}

// 上传图片失败
const handleError = (err: any) => {
  ElMessage.error(`上传失败原因：${err}`)
}








// 删除轮播图
const delacspk = (id: string) => {
  service.delete(`/delacspk?did=${id}`).then((res: any) => {
    if (res.code === 200) {
      ElMessage.success('删除成功')
      getacspk()
    }
  })
}
// 文件上传前校验
const beforeUpload = async (file: File): Promise<File> => {
  try {
    // 检查文件类型
    const isJpgOrPng = ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type);
    if (!isJpgOrPng) {
      ElMessage.error('上传文件格式只能是 JPG/PNG/JPEG!');
      // 阻止上传
      return Promise.reject(new Error('文件格式不正确'));
    }

    // 压缩图片
    const compressedFile = await compressImage(file, { quality: 0.8, maxWidth: 800, maxHeight: 800 });

    // 返回压缩后的文件，允许上传
    return compressedFile;
  } catch (error) {
    ElMessage.error('图片压缩失败');
    console.error('压缩错误:', error);
    // 阻止上传
    return Promise.reject(new Error('图片压缩失败'));
  }
}


</script>

<style scoped lang="less">
.carousel {
  width: 100vw;

  .carousel-top {
    width: 97%;
    margin: 0 auto;
    margin-top: 20px;
  }
}

.demo-pagination-block {
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 20px 0;
}
</style>