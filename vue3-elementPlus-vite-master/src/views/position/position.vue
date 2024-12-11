<template>
  <div class="position">
    <el-button type="primary" @click="dialogFormVisible = true">添加职位</el-button>
    <el-table :data="tableData" style="width: 100%;margin-top: 20px;">
      <el-table-column prop="_id" label="id" align="center" />
      <el-table-column prop="jobTitle" label="职位" align="center" />
      <el-table-column label="添加时间" align="center">
        <template v-slot="scope">
          {{ scope.row.addTime.replace('T', ' ').split('.')[0] }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200px" align="center">
        <template v-slot="scope">
          <el-button type="warning" @click="editDataMsg(scope.row)">编辑</el-button>
          <el-button type="danger" @click="open(scope.row._id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>


    <loading :loadState="loadState" />
  </div>

  <!-- 弹出框-添加 -->
  <el-dialog v-model="dialogFormVisible" title="添加职位" :width="500">
    <el-form :model="form">
      <el-form-item label="职位名称" :label-width="formLabelWidth">
        <el-input v-model="form.jobTitle" autocomplete="off" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="addClose()">取消</el-button>
        <el-button type="primary" @click="addData()"> 添加 </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 修改 -->
  <el-dialog v-model="dialogFormVisibleEdit" title="编辑职位" :width="500">
    <el-form :model="editData">
      <el-form-item label="职位名称" :label-width="formLabelWidth">
        <el-input v-model="editData.jobTitle" autocomplete="off" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="eidtClose()">取消</el-button>
        <el-button type="primary" @click="editDataAdd()"> 更新 </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 分页 -->
  <div class="demo-pagination-block">
    <div>
      <el-pagination v-model:current-page="page" v-model:page-size="pageSize" :page-sizes="[5, 10, 15, 20]"
        :background="true" layout="total, sizes, prev, pager, next, jumper" :total="total"
        @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>
  </div>
</template>

<script setup lang="ts">
import service from '@/utils/request';
import { ElMessage, ElMessageBox } from 'element-plus';
import { onMounted, ref } from 'vue';
import loading from '@/components/loading.vue';

// 数据类型
type posData = {
  _id: string,
  jobTime: string,
  addTime: string,
}
const tableData = ref<posData[]>([])
const dialogFormVisible = ref(false)
const dialogFormVisibleEdit = ref(false)
const formLabelWidth = '100px'
const form = ref({ jobTitle: "" })
const page = ref<number>(1)
const pageSize = ref<number>(5)
const total = ref<number>(0)
const editData = ref({ _id: "", jobTitle: "" })
const loadState = ref<boolean>(false)

// 删除消息确认框
const open = (id: string) => {
  ElMessageBox.confirm(
    '您确定要删除吗？',
    '警告！',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      await service.delete("/delPosition", { params: { id: id } }).then((res: any) => {
        if (res.code === 200) {
          getData()
          ElMessage({
            type: 'success',
            message: '删除成功',
          })
        } else {
          console.log(res.msg, res.err)
          ElMessage({
            type: 'error',
            message: '删除失败',
          })
        }
      })
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消删除',
      })
    })
}

// 更改数据
function editDataMsg(res: any) {
  dialogFormVisibleEdit.value = true
  editData.value = res
}

// 取消更新
function eidtClose() {
  dialogFormVisibleEdit.value = false
  editData.value = { _id: "", jobTitle: "" }
  ElMessage.warning("取消编辑")
}

// 更新
function editDataAdd() {
  service.put("/updatePosition", editData.value).then((res: any) => {
    if (res.code == 200) {
      ElMessage.success("编辑成功")
      dialogFormVisibleEdit.value = false
      getData()
    } else {
      ElMessage.error("编辑失败")
    }
  })
}

// 获取数据
function getData() {
  loadState.value = true
  service.get("/getPosition", { params: { page: page.value, pageSize: pageSize.value } }).then((res: any) => {
    if (res.code == 200) {
      tableData.value = res.data
      total.value = res.total
      loadState.value = false
    } else {
      ElMessage.error("获取数据失败")
      loadState.value = false
    }
  })
}

// 更改每页数量
const handleSizeChange = (val: number) => {
  pageSize.value = val
  getData()
}

// 选择页数
const handleCurrentChange = (val: number) => {
  page.value = val
  getData()
}

onMounted(() => {
  getData()
})

// 添加
async function addData() {
  await service.post("/addPosition", form.value).then((res: any) => {
    if (res.code == 200) {
      ElMessage.success("添加成功")
      dialogFormVisible.value = false
      form.value.jobTitle = ""
      getData()
    } else {
      ElMessage.error("添加失败")
    }
  })
}

// 取消添加
function addClose() {
  dialogFormVisible.value = false
  ElMessage.info("取消添加")
}
</script>

<style scoped lang="less">
.position {
  width: 97%;
  margin: 0 auto;
  margin-top: 20px;
}

.demo-pagination-block {
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 20px 0;
}
</style>