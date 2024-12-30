<template>
  <div class="carousel">
    <div class="carousel-top">
      <div style="background-color: black; color: white;">
      </div>
      <!-- 上传图片 -->
      <el-upload class="upload-demo" :action="ActionUrl + '/upload'" :multiple="true" :on-success="handlePreview"
        :on-error="handleError" :limit="7" :on-exceed="handleExceed" :show-file-list="false" accept=".jpg,.png,.jpeg"
        :before-upload="beforeUpload">
        <el-button type="primary">上传图片</el-button>
        <template #tip>
          <div class="el-upload__tip">
            大小不超过500KB的jpg/png文件，且一次只能上传最多7张
          </div>
        </template>
      </el-upload>

      <!-- 表格 -->
      <el-table :data="carouselList" style="width: 100%;margin-top: 20px;">
        <el-table-column prop="_id" label="id" align="center" />
        <el-table-column label="图片" align="center">
          <template v-slot="scope">
            <img :src="scope.row.imgPath" alt="图片路径错误" style="height: 50px" />
          </template>
        </el-table-column>
        <el-table-column label="添加时间" align="center">
          <template v-slot="scope">
            {{ scope.row.addTime.replace('T', ' ').split('.')[0] }}
          </template>
        </el-table-column>
        <el-table-column label="是否启动" align="center">
          <template v-slot="scope">
            <el-switch v-model="scope.row.isDelete" @click="updateCarousel(scope.row._id)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template v-slot="scope">
            <el-button type="danger" size="small" @click="handleClose(scope.row._id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="demo-pagination-block">
        <div>
          <el-pagination v-model:current-page="page" v-model:page-size="pageSize" :page-sizes="[5, 10, 15, 20]"
            :background="true" layout="total, sizes, prev, pager, next, jumper" :total="total"
            @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        </div>
      </div>

    </div>

    <loading :loadState="loadState" />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import service from '@/utils/request';
import { ElMessage, ElMessageBox } from 'element-plus';
import loading from '@/components/loading.vue';


// 定义轮播图的类型
interface CarouselItem {
  id: number;
  imageUrl: string;
  title: string;
}

const page = ref(1)
const pageSize = ref(5)
const carouselList = ref<CarouselItem[]>()
const total = ref<number>(0)
const ActionUrl = ref<string>('')
const loadState = ref<boolean>(false)


// 删除
const handleClose = (id: string) => {
  ElMessageBox.confirm('您确定要删除该轮播图吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      delCarousel(id)
    })
    .catch(() => {
      ElMessage.success('取消删除')
    })
}

// 获取轮播图数据
const getCarousel = () => {
  loadState.value = true
  service.get(`/getCarousel`, { params: { page: page.value, pageSize: pageSize.value } }).then((res: any) => {
    carouselList.value = res.data
    total.value = res.total
    loadState.value = false
  })
}

onMounted(() => {
  getCarousel()
  ActionUrl.value = import.meta.env.VITE_GLOB_API_URL
})

// 上传成功时
const handlePreview = (uploadFile: any) => {
  const imgPath = import.meta.env.VITE_GLOB_API_URL + '/' + uploadFile.path;
  handleOnSubmit(imgPath)
}

// 上传图片-添加到后端数据库
const handleOnSubmit = (uploadFile: string) => {
  service.post('/addCarousel', { imgPath: uploadFile }).then((res: any) => {
    if (res.code === 200) {
      ElMessage.success('上传成功')
      getCarousel()
    }
  })
}

// 上传图片失败
const handleError = (err: any) => {
  ElMessage.error(`上传失败原因：${err}`)
}

// 图片数量限制
const handleExceed = (files: any, uploadFiles: any) => {
  ElMessage.warning(
    `限制是7个，你这次选择了${files.length}个文件，加起来总共是${files.length + uploadFiles.length}个`
  )
}

// 文件上传前校验
const beforeUpload = (file: any) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg';
  const isLt500KB = file.size / 1024 < 500;

  if (!isJpgOrPng) {
    alert('上传文件格式只能是 JPG/PNG/JPEG!');
  }
  if (!isLt500KB) {
    alert('上传文件大小不能超过 500KB!');
  }

  // 返回 true 允许上传，false 阻止上传
  return isJpgOrPng && isLt500KB;
}


// 更改每页数量
const handleSizeChange = (val: number) => {
  pageSize.value = val
  getCarousel()
}

// 选择页数
const handleCurrentChange = (val: number) => {
  page.value = val
  getCarousel()
}

// 删除轮播图
const delCarousel = (id: string) => {
  service.delete(`delCarousel/${id}`).then((res: any) => {
    if (res.code === 200) {
      ElMessage.success('删除成功')
      getCarousel()
    } else {
      ElMessage.error('删除失败')
    }
  })
}

// 更新轮播状态
const updateCarousel = (id: string) => {
  service.put(`/updateCarousel/${id}`).then((res: any) => {
    if (res.code === 200) {
      ElMessage.success('更新成功')
      getCarousel()
    } else {
      ElMessage.error('更新失败')
    }
  })
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
