<template>
  <div class="userInfoabo">
    <el-button type="primary" style="margin: 20px;" @click="setdialogvisiblew('add', null)">
      添加用户
    </el-button>
    <label for="">搜索:</label><el-input v-model="searchcontent" style="width: 233px;" placeholder="按照姓名或者编号搜索"
      clearable />
    <el-button type="primary" style="margin: 20px;" @click="dosearch">
      搜索
    </el-button>
    <el-button type="primary" @click="handleFileClick">
      上传 Excel 表格
    </el-button>
    <!-- 上传图片按钮 -->
    <el-button type="primary" @click="handleImageUploadClick">
      上传图片
    </el-button>

    <!-- 隐藏的文件上传控件 -->
    <input type="file" ref="fileInput" accept=".xls,.xlsx" @change="handleFileChange" style="display: none" />

    <!-- 隐藏的文件上传控件 -->
    <input type="file" ref="imageInput" accept="image/*" multiple @change="handleImageUploadChange"
      style="display: none" />

    <!-- 表格 -->
    <el-table :data="userls" style="width: 97%; margin: 0 auto;">
      <el-table-column prop="name" label="姓名" align="center" />
      <el-table-column label="编号" align="center">
        <template v-slot="scope">{{ scope.row.mark }}号</template>
      </el-table-column>
      <el-table-column label="职位" align="center">
        <template v-slot="scope">
          {{ scope.row.position[0].jobTitle }}
        </template>
      </el-table-column>
      <el-table-column label="票数" align="center">
        <template v-slot="scope">
          {{ scope.row.vote }}
        </template>
      </el-table-column>
      <el-table-column label="简历审核" align="center">
        <template v-slot="scope">
          <el-tag type="success" v-if="scope.row.isAudit">已审核</el-tag>
          <el-tag type="danger" v-else style="cursor: pointer" @click="ElMessage.warning('请前去审核')">
            待审核
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" :width="500" align="center">
        <template v-slot="scope">
          <el-button type="primary" @click="goGift(scope.row)">礼物</el-button>
          <el-button type="primary" @click="goComment(scope.row._id)">
            留言板
          </el-button>
          <el-button type="primary" size="small" @click="setdialogvisiblew('upd', scope.row)">
            编辑
          </el-button>
          <el-button v-if="!scope.row.isAudit" type="primary" size="small" @click="allowisaudit(scope.row._id)">
            通过审核
          </el-button>
          <el-button type="danger" @click="deluser(scope.row._id)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination v-model:current-page="page" v-model:page-size="pageSize" :page-sizes="[5, 10, 15, 20]"
        :background="true" layout="total, sizes, prev, pager, next, jumper" :total="total"
        @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>

    <!--添加修改活动-->
    <el-dialog v-model="centerDialogVisible" :title="formstatus == 'add' ? '添加用户' : '修改用户'" :width="800" align-center>
      <el-form ref="ruleFormRef" style="max-width: 600px" :model="ruleForm" :rules="rules" label-width="auto"
        class="demo-ruleForm" :size="formSize" status-icon show-close="false">
        <el-form-item label="用户姓名" prop="name">
          <el-input v-model="ruleForm.name" placeholder="请输入用户姓名"></el-input>
        </el-form-item>
        <el-form-item label="用户封面" prop="avtor">
          <el-upload class="avatar-uploader" :action="ActionUrl + '/upload'" :show-file-list="false"
            :before-upload="beforeUpload" :on-success="handlePreview" :on-error="handleError">
            <img v-if="ruleForm.avtor" :src="ruleForm.avtor" class="avatar" />
            <el-button v-else type="primary">上传图片</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="用户简介" prop="introduce">
          <el-input type="textarea" v-model="ruleForm.introduce" placeholder="请输入用户简介"></el-input>
        </el-form-item>
        <el-form-item label="用户职位" prop="position">
          <el-select v-model="ruleForm.position" placeholder="请选择用户职位" style="width: 240px">
            <el-option v-for="item in positionls" :key="item._id" :label="item.jobTitle" :value="item._id" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="formstatus == 'upd'" label="票数" prop="vote">
          <el-input v-model.number="ruleForm.vote" placeholder="请输入用户票数"></el-input>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="resetForm">取消</el-button>
          <el-button v-if="formstatus == 'add'" type="primary" @click="addactive">
            确定
          </el-button>
          <el-button v-else type="primary" @click="updactive">修改</el-button>
        </div>
      </template>
    </el-dialog>
    <loading :loadState="loadState" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import service from '@/utils/request'
import { useRouter } from 'vue-router'
import { ElMessage, ElLoading } from 'element-plus'
import loading from '@/components/loading.vue'
import { compressImage } from '@/utils/compressImage'


const ActionUrl = ref<String>('')
const router = useRouter()
const loadState = ref<boolean>(false)

//
let gosinaply = (id: any) => {
  router.push(`/sinaply/${id._id}`)
}
// 前往投票
const goGift = (id: any) => {
  router.push(`/gift/${id._id}`)
}
//搜索条件
let searchcontent = ref('')
//分页
let page = ref(1)
let pageSize = ref(5)
let total = ref(20)
// 更改每页数量
const handleSizeChange = (val: number) => {
  pageSize.value = val
  page.value = 1
  getdusers()
}

// 选择页数
const handleCurrentChange = (val: number) => {
  page.value = val
  getdusers()
}

function goComment(id: string) {
  router.push(`/comment/${id}`)
}

//获取所有用户
let userls = ref([])
let getdusers = async () => {
  loadState.value = true
  let res: any = await service.get('/getuser', {
    params: { nowPage: page.value, pageSize: pageSize.value, searchcontent: searchcontent.value }
  })
  userls.value = res.users
  total.value = res.userstotal
  loadState.value = false
}
//获取用户的票数
let getuvotes = async (id: any) => {
  let res: any = await service.get('/getapuservotes', {
    params: { apuid: id }
  })
  let votes = res.apuallvotes
  return votes
}
//控制对话框
const centerDialogVisible = ref(false)
//对话框添加或者修改的状态
const formstatus = ref<String>('add')
//显示对话框
//修改_id
let updid = ref('')
let prevote = ref(0)
const setdialogvisiblew = (status: String, data: any) => {
  centerDialogVisible.value = true
  formstatus.value = status

  if (data) {
    updid.value = data._id
    prevote.value = data.vote
    ruleForm.name = data.name
    ruleForm.avtor = data.avtor
    ruleForm.introduce = data.introduce
    ruleForm.position = data.position[0]._id
    ruleForm.vote = data.vote
  }
}
//表单
interface RuleForm {
  name: string
  avtor: string
  introduce: string
  position: string
  vote: number
}

const formSize = ref('default')
const ruleFormRef = ref()
let ruleForm = reactive<RuleForm>({
  name: '',
  avtor: '',
  introduce: '',
  position: '',
  vote: 0
})

const rules = reactive({
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  avtor: [{ required: true, message: '请上传封面', trigger: 'blur' }],
  introduce: [{ required: true, message: '请输入简介', trigger: 'blur' }],
  position: [{ required: true, message: '请选择职位', trigger: 'blur' }],
  vote: [{ required: true, message: '请输入票数', trigger: 'blur' }]
})

const resetForm = () => {
  centerDialogVisible.value = false
  ruleForm.name = ''
  ruleForm.avtor = ''
  ruleForm.introduce = ''
  ruleForm.position = ''
  ruleForm.vote = 0
}
//添加
const addactive = async () => {
  let res: any = await service.post('/adduser', {
    ...ruleForm,
    isApply: true,
    isAudit: true
  })
  if (res.code == 200) {
    centerDialogVisible.value = false
    ruleForm.name = ''
    ruleForm.avtor = ''
    ruleForm.introduce = ''
    ruleForm.position = ''
    ruleForm.vote = 0
    getdusers()
  }
}
//删除
const deluser = async (userid: any) => {
  let res: any = await service.delete(`/deluser/${userid}`)
  if (res.code == 200) {
    getdusers()
  }
}
//修改
const updactive = async () => {
  let res: any = await service.post(
    `/upduserinfo?uid=${updid.value}`,
    ruleForm
  )
  if (res.code == 200) {
    let vote = ruleForm.vote - prevote.value
    let res2: any = await service.post('addaftdoorvote', {
      apid: updid.value,
      opa: vote
    })
    updid.value = ''
    resetForm()
    getdusers()
  }
}
//搜搜
const dosearch = () => {
  getdusers()
}
// 上传成功时
const handlePreview = (uploadFile: any) => {
  const imgsrc = import.meta.env.VITE_GLOB_API_URL + '/' + uploadFile.path
  console.log(imgsrc)

  ruleForm.avtor = imgsrc
}

// 上传图片失败
const handleError = (err: any) => {
  ElMessage.error(`上传失败原因：${err}`)
}

//获取所有职位
let positionls = ref<any>([])
const getpositions = async () => {
  let res = await service.get('/getPosition')
  positionls.value = res.data
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
//审核简历
const allowisaudit = async (id: any) => {
  let res: any = await service.put('passAudit', {
    _id: id
  })
  if (res.code == 200) {
    getdusers()
  }
}

const fileInput = ref<any>(null); // 参考隐藏的文件输入控件

// 上传文件
const handleFileClick = () => {
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  fileInput?.click(); // 激活文件选择框
};

// 文件选择改变时触发
const handleFileChange = async (event: Event) => {
  const fileInput: any = event.target as HTMLInputElement;
  const file = fileInput?.files?.[0];

  if (file) {
    try {
      loadState.value = true;
      const formData = new FormData();
      formData.append('file', file); // 将文件附加到 FormData

      // 发送到后端
      const response: any = await service.post('/uploadFile/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.code === 200) {
        ElMessage.success('上传成功!');
      } else {
        ElMessage.error('上传失败');
      }
      fileInput.value = null; // 清空文件输入框
      getdusers()
      loadState.value = false;
    } catch (error) {
      fileInput.value = null; // 清空文件输入框
      console.error('上传失败:', error);
      ElMessage.error('上传失败');
    }
  } else {
    ElMessage.error('请选择文件');
    fileInput.value = null; // 清空文件输入框
  }
};

// 定义一个全局变量来存储进度信息
let uploadProgress: number = 0;
let loadingInstance: any = null;

// 隐藏的文件输入控件
const imageInput = ref<HTMLInputElement | null>(null);

// 点击上传图片按钮时触发
const handleImageUploadClick = () => {
  imageInput.value?.click(); // 激活文件选择框
};

// 上传进度更新函数
const updateProgress = (percentCompleted: number) => {
  if (uploadProgress !== percentCompleted) {
    uploadProgress = percentCompleted;

    if (!loadingInstance) {
      // 如果没有实例，创建一个新的
      loadingInstance = ElLoading.service({
        lock: true,
        text: `上传进度: ${uploadProgress}%`,
        background: 'rgba(0, 0, 0, 0.7)',
      });
    } else {
      // 更新现有实例
      loadingInstance.setText(`上传进度: ${uploadProgress}%`);
    }
  }
};

// 上传文件的请求
const uploadFiles = async (formData: FormData): Promise<void> => {
  try {
    const files: File[] = formData.getAll('files') as File[];
    let failedUploads: string[] = []; // 存储上传失败的文件名
    let successfulUploads: string[] = []; // 存储上传成功的文件名

    // 定义重试机制
    const retryUpload = async (file: File, retries: number = 3): Promise<void> => {
      const singleFileFormData: FormData = new FormData();
      singleFileFormData.append('files', file);

      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const response: any = await service.post('/uploadFile/uploadImage', singleFileFormData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent: ProgressEvent) => {
              const percentCompleted: number = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              console.log(`已加载: ${progressEvent.loaded}, 总共: ${progressEvent.total}`);
              console.log(`上传进度: ${percentCompleted}%`);
              updateProgress(percentCompleted);

              // 解决卡在63%的问题，确保进度条更新
              if (percentCompleted === 100) {
                setTimeout(() => {
                  updateProgress(100);
                }, 500); // 延迟更新以确保进度条到达100%
              }
            },
          });

          if (response.code === 200) {
            successfulUploads.push(file.name); // 记录成功的文件名
            return; // 成功后退出重试循环
          } else {
            throw new Error(`图片 ${file.name} 上传失败！`);
          }
        } catch (error) {
          console.error(`尝试 ${attempt} 上传图片 ${file.name} 失败:`, error);
          if (attempt === retries) {
            ElMessage.error(`图片 ${file.name} 上传失败！`);
            failedUploads.push(file.name); // 记录失败的文件名
          }
        }
      }
    };

    // 使用 Promise.all 并行上传所有文件以提高速度
    const uploadPromises = files.map((file: File) => retryUpload(file));

    // 确保只创建一个 loading 实例
    if (!loadingInstance) {
      loadingInstance = ElLoading.service({
        lock: true,
        text: '上传中...',
        background: 'rgba(0, 0, 0, 0.7)',
      });
    }

    await Promise.all(uploadPromises);

    if (successfulUploads.length > 0) {
      ElMessage.success(`以下图片上传成功: ${successfulUploads.join(', ')}`);
    }

    if (failedUploads.length > 0) {
      ElMessage.error(`以下图片上传失败: ${failedUploads.join(', ')}`);
    }
  } catch (error) {
    ElMessage.error('上传失败，请重试！');
  } finally {
    // 上传完成后关闭实例
    if (loadingInstance) {
      loadingInstance.close();
      loadingInstance = null;
    }
  }
};

// 文件选择改变时触发
const handleImageUploadChange = async (event: Event) => {
  const fileInput = event.target as HTMLInputElement;
  const files: any = fileInput.files;

  if (files && files.length > 0) {
    try {
      // 检查文件类型
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

      for (const file of files) {
        if (!allowedTypes.includes(file.type)) {
          ElMessage.error(`文件 ${file.name} 不是支持的图片格式（JPG/PNG/GIF）！`);
          return;
        }
      }

      // 创建 FormData 对象
      const formData = new FormData();
      for (const file of files) {
        formData.append('files', file); // 使用 'files' 作为字段名
      }

      // 发送上传请求
      uploadFiles(formData);
    } catch (error) {
      ElMessage.error('上传失败，请重试！');
    } finally {
      // 清空文件输入框
      if (fileInput) fileInput.value = '';
    }
  } else {
    ElMessage.error('请选择文件！');
  }
};

//onMounted
onMounted(() => {
  getdusers()
  getpositions()
  ActionUrl.value = import.meta.env.VITE_GLOB_API_URL
})
</script>

<style scoped>
.pagination {
  width: 98%;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.avatar {
  width: 30vw;
}
</style>
