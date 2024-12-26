<!-- 礼物记录 -->
<template>
  <div class="present">
    <!-- 表单 -->
    <el-form :inline="true" :model="formInline" class="demo-form-inline">
      <el-form-item label="订单号">
        <el-input v-model="formInline.orderId" placeholder="请填写订单号" clearable />
      </el-form-item>
      <el-form-item label="金额">
        <el-input v-model="formInline.money" placeholder="金额" clearable />
      </el-form-item>
      <el-form-item label="赠送者姓名">
        <el-input v-model="formInline.buyerName" placeholder="赠送人姓名" clearable />
      </el-form-item>
      <el-form-item label="被赠送者姓名">
        <el-input v-model="formInline.sellerName" placeholder="被赠送人姓名" clearable />
      </el-form-item>
      <el-form-item label="订单状态">
        <el-select v-model="formInline.status" placeholder="请选择" clearable>
          <el-option label="待支付" value="pending" />
          <el-option label="支付成功" value="paid" />
          <el-option label="支付失败" value="failed" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">查询</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格 -->
    <el-table :data="tableData" stripe style="width: 100%; margin-top: 20px;">
      <el-table-column prop="buyerName" label="赠送人" align="center" />
      <el-table-column prop="sellerName" label="被赠送人" align="center" />
      <el-table-column label="订单状态" align="center">
        <template v-slot="scope">
          <el-tag type="warning" v-if="scope.row.status === 'pending'">待支付</el-tag>
          <el-tag type="success" v-else-if="scope.row.status === 'paid'">支付成功</el-tag>
          <el-tag type="danger" v-else-if="scope.row.status === 'failed'">支付失败</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="money" label="金额" align="center" />
      <el-table-column prop="money" label="票数" align="center" />
      <el-table-column label="订单创建时间" align="center">
        <template v-slot="scope">
          {{ changeTimeFormat(scope.row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="支付时间" align="center">
        <template v-slot="scope">
          {{ scope.row.updated_at!==scope.row.created_at ? changeTimeFormat(scope.row.updated_at) : '未支付' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template v-slot="scope">
          <el-button type="danger" @click="delOrderForm(scope.row._id)">删除</el-button>
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

const formInline = reactive({
  orderId: "",
  money: "",
  buyerName: "",
  sellerName: "",
  status: "",
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

function getOrderInfo() {
  service.get('/orderForm/getOrderInfo', { params: formInline }).then((res: any) => {
    tableData.value = res.data
    formInline.total = res.total
  })
}

// 删除订单
function delOrderForm(_id: string) {
  service.delete(`/orderForm/deleteOrder/${_id}`).then((res: any) => {
    if (res.code === 200) {
      getOrderInfo()
      ElMessage.success(res.msg)
    } else {
      ElMessage.error(res.msg)
    }
  })
}

function changeTimeFormat(time: string) {
  const date = new Date(time)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes() > 9 ? date.getMinutes() : `0${date.getMinutes()}`
  const second = date.getSeconds()
  const timeStr = `${year}-${month}-${day} ${hour}:${minute}:${second}`
  return timeStr
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