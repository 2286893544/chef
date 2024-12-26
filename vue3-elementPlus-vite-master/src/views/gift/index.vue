<!-- 礼物 -->
<template>
  <div class="container">
    <el-button type="info" @click="goBack">返回</el-button>
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
          {{ changeTimeFormat(scope.row.updated_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template v-slot="scope">
          <el-button type="danger" @click="delOrderForm(scope.row._id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="demo-pagination-block">
      <el-pagination v-model:current-page="page" v-model:page-size="pageSize" :page-sizes="[5, 10, 15, 20]"
        :disabled="false" :background="false" layout="total, sizes, prev, pager, next, jumper" :total="total"
        @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>
  </div>
</template>

<script setup lang="ts">
import service from '@/utils/request';
import { ElMessage } from 'element-plus';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute()
const router = useRouter()
const _id = route.params.id
const tableData = ref([])
const page = ref(1)
const pageSize = ref(5)
const total = ref(5)


onMounted(() => {
  getAllOrder()
})

// 返回上一级
function goBack() {
  router.back()
}

// 获取订单数据
function getAllOrder() {
  service.get('/orderForm/getAllOrder', { params: { page: page.value, pageSize: pageSize.value, sellerId: _id } }).then((res: any) => {
    tableData.value = res.data
    total.value = res.total
  })
}

// 删除订单
function delOrderForm(_id: string) {
  service.delete(`/orderForm/deleteOrder/${_id}`).then((res: any) => {
    if (res.code === 200) {
      getAllOrder()
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
  pageSize.value = val
  getAllOrder()
}
const handleCurrentChange = (val: number) => {
  page.value = val
  getAllOrder()
}

</script>

<style scoped>
.container {
  width: 97% !important;
  margin: 0 auto;
  margin-top: 20px;
}

.demo-pagination-block {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-top: 20px;
}
</style>