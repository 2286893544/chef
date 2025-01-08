<!-- 简历审核 -->
<template>
  <div class="present">
    <!-- 表单 -->
    <el-form :inline="true" :model="formInline" class="demo-form-inline">
      <el-form-item label="姓名">
        <el-input v-model="formInline.name" placeholder="请填写订单号" clearable />
      </el-form-item>
      <el-form-item label="手机号">
        <el-input v-model="formInline.phone" placeholder="金额" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">查询</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格 -->
    <el-table :data="tableData" stripe style="width: 100%; margin-top: 20px;">
      <el-table-column prop="name" label="用户名" align="center" />
      <el-table-column prop="phone" label="手机号" align="center" />
      <el-table-column label="订单状态" align="center">
        <template v-slot="scope">
          <el-tag type="warning">待审核</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template v-slot="scope">
          <el-button type="primary" @click="gorich(scope.row)">查看简历</el-button>
          <el-button type="success" @click="passAudit(scope.row._id)">审核通过</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="demo-pagination-block">
      <el-pagination v-model:current-page="formInline.page" v-model:page-size="formInline.pageSize"
        :page-sizes="[5, 10, 15, 20]" :disabled="false" :background="false"
        layout="total, sizes, prev, pager, next, jumper" :total="formInline.total" @size-change="handleSizeChange"
        @current-change="handleCurrentChange" />
    </div>
  </div>
</template>

<script setup lang="ts">
import service from '@/utils/request'
import { ElMessage } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const formInline = reactive({
  name: "",
  phone: "",
  page: 1,
  pageSize: 5,
  total: 0
})
const tableData = ref([])

onMounted(() => {
  getOrderInfo()
})

// 查询
const onSubmit = () => {
  getOrderInfo()
}

// 查看简历
const router = useRouter()
let gorich = (id: any) => {
  router.push(`/riched/${id._id}`)
  sessionStorage.setItem('richText', JSON.stringify(id.richText))
}

// 通过简历
const passAudit = async (_id: String) => {
  try {
    let result: any = await service.put('/passAudit', { _id })
    if (result.code == 200) {
      ElMessage.success('审核成功')
      getOrderInfo()
    }
    else ElMessage.error('审核失败')
    console.log(result)
  } catch (err) {
    ElMessage.error(`审核失败：${err}`)
  }
}

function getOrderInfo() {
  service.get('/getAuditData', { params: formInline }).then((res: any) => {
    tableData.value = res.data
    formInline.total = res.total
  })
}

const handleSizeChange = (val: number) => {
  formInline.page = 1;
  formInline.pageSize = val;
  getOrderInfo()
}
const handleCurrentChange = (val: number) => {
  formInline.page = val;
  getOrderInfo()
}


</script>

<style scoped>
.present {
  width: 97% !important;
  margin: 0 auto;
  margin-top: 20px;
}

.demo-form-inline {
  width: 100%;
}

.demo-pagination-block {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-top: 20px;
}
</style>