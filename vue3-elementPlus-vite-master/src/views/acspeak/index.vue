<template>
  <div class="carousel">
    <div class="carousel-top">
      <!-- 添加按钮 -->
      <el-button type="primary" @click="addData">添加</el-button>

      <!-- 表格 -->
      <el-table :data="acspklList" style="width: 100%; margin-top: 20px;">
        <el-table-column prop="_id" label="id" align="center" />
        <el-table-column label="图片" align="center">
          <template v-slot="scope">
            <img v-if="scope.row.imgsrc" :src="scope.row.imgsrc" alt="图片路径错误" style="height: 50px" />
            <span v-else>暂无</span>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="文字" align="center" />
        <el-table-column label="操作" align="center">
          <template v-slot="scope">
            <el-button type="primary" size="small" @click="handleUpdate(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleClose(scope.row._id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 对话框 -->
      <el-dialog v-model="dialogFormVisible" :title="dialogText" :width="600">
        <el-form :model="form">
          <el-form-item label="文字" :label-width="formLabelWidth">
            <el-input v-model="form.content" autocomplete="off" />
          </el-form-item>
          <el-form-item label="图片" :label-width="formLabelWidth">
            <el-upload class="upload-demo" :action="ActionUrl + '/upload'" :before-upload="beforeUpload"
              :multiple="true" :on-success="handlePreview" :on-error="handleError" :show-file-list="false">
              <img v-if="form.imgsrc" :src="form.imgsrc" class="avatar" style="width: 15vw;" />
              <el-button v-else type="primary">上传图片</el-button>
            </el-upload>
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="cancel">取消</el-button>
            <el-button type="primary" @click="handleSave">确认</el-button>
          </div>
        </template>
      </el-dialog>
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

const acspklList = ref([]);
const ActionUrl = ref<string>('');
const loadState = ref<boolean>(false);
const dialogFormVisible = ref(false);
const formLabelWidth = '40px';
const dialogText = ref<string>('');

interface formTypes {
  _id?: string;
  imgsrc: string;
  content: string;
}

const form = ref<formTypes>({
  _id: '',
  imgsrc: '',
  content: ''
});

// 添加
const addData = () => {
  dialogFormVisible.value = true;
  dialogText.value = '添加';
  form.value = {
    imgsrc: '',
    content: ''
  }
}

// 编辑
const handleUpdate = (row: any) => {
  dialogText.value = '编辑';
  form.value = { ...row }; // 克隆一份数据，避免直接修改原始数据
  dialogFormVisible.value = true;
};

// 删除
const handleClose = (id: string) => {
  ElMessageBox.confirm('您确定要删除该图片吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      delacspk(id);
    })
    .catch(() => {
      ElMessage.success('取消删除');
    });
};

// 取消
const cancel = () => {
  dialogFormVisible.value = false;
};

// 获取轮播图数据
const getacspk = () => {
  loadState.value = true;
  service.get(`/getacspimgs`).then((res: any) => {
    acspklList.value = res.asimgs;
    loadState.value = false;
  });
};

onMounted(() => {
  getacspk();
  ActionUrl.value = import.meta.env.VITE_GLOB_API_URL;
});

// 上传成功时
const handlePreview = (uploadFile: any) => {
  form.value.imgsrc = import.meta.env.VITE_GLOB_API_URL + '/' + uploadFile.path;
};

// 上传图片失败
const handleError = (err: any) => {
  ElMessage.error(`上传失败原因：${err}`);
};

// 删除轮播图
const delacspk = (id: string) => {
  service.delete(`/delacspk?did=${id}`).then((res: any) => {
    if (res.code === 200) {
      ElMessage.success('删除成功');
      getacspk();
    }
  });
};

// 文件上传前校验
const beforeUpload = async (file: File): Promise<File> => {
  try {
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
};

// 确认保存编辑内容
const handleSave = () => {
  if (dialogText.value === '添加') {
    // 添加数据
    service.post('/addacspackimg', form.value).then((res: any) => {
      if (res.code === 200) {
        ElMessage.success('添加成功');
        dialogFormVisible.value = false;
        getacspk();
      } else {
        ElMessage.error('添加失败');
      }
    }).catch(() => {
      ElMessage.error('添加失败');
    });
  } else {
    // 编辑数据
    service.put("/putAcspimgs", form.value).then((res: any) => {
      if (res.code === 200) {
        ElMessage.success('编辑成功');
        dialogFormVisible.value = false;
        getacspk();
      } else {
        ElMessage.error('编辑失败');
      }
    }).catch(() => {
      ElMessage.error('编辑失败');
    });
  }
};
</script>

<style scoped lang="less">
.carousel {
  width: 100%;

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
