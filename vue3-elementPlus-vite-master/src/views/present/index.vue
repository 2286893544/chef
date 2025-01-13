<!-- 礼物记录 -->
<template>
  <div class="present">
    <!-- 表单 -->
    <el-form :inline="true" :model="formInline" class="demo-form-inline">
      <el-form-item label="排序方式">
        <el-select v-model="formInline.filterType" placeholder="请选择排序方式" clearable>
          <el-option label="按天" value="day" />
          <el-option label="按月" value="month" />
          <el-option label="按年" value="year" />
        </el-select>
      </el-form-item>
      <el-form-item label="日期" v-if="formInline.filterType">
        <el-date-picker v-if="formInline.filterType === 'day'" v-model="formInline.date" type="date"
          placeholder="选择日期" />
        <el-date-picker v-else-if="formInline.filterType === 'month'" v-model="formInline.date" type="month"
          placeholder="选择月份" />
        <el-date-picker v-else-if="formInline.filterType === 'year'" v-model="formInline.date" type="year"
          placeholder="选择年份" />
      </el-form-item>
      <el-form-item label="赠送者姓名">
        <el-input v-model="formInline.buyerName" placeholder="赠送人姓名" clearable />
      </el-form-item>
      <el-form-item label="被赠送者姓名">
        <el-input v-model="formInline.sellerName" placeholder="被赠送人姓名" clearable />
      </el-form-item>
      <el-form-item label="金额排序">
        <el-select v-model="formInline.sort" placeholder="请选择" clearable>
          <el-option label="升序" value="asc" />
          <el-option label="降序" value="desc" />
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
      <el-table-column prop="totalAmount" label="总金额" align="center" />
      <el-table-column prop="totalOrders" label="订单总数" align="center" />
      <el-table-column label="支付成功率 (%)" align="center">
        <template v-slot="scope">
          {{ scope.row.successRate ? scope.row.successRate.toFixed(2) + '%' : '0%' }}
        </template>
      </el-table-column>
      <el-table-column label="平均订单金额" align="center">
        <template v-slot="scope">
          {{ scope.row.avgOrderAmount ? scope.row.avgOrderAmount.toFixed(2) : '0' }}
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

const formInline: any = reactive({
  buyerName: "",
  sellerName: "",
  page: 1,
  pageSize: 5,
  total: 0,
  sort: "",
  filterType: "",
  date: ""
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
  const params = { ...formInline };

  // 日期格式化
  if (params.date) {
    const year = params.date.getFullYear();
    const month = (params.date.getMonth() + 1).toString().padStart(2, "0"); // 月份需要加 1
    const day = params.date.getDate().toString().padStart(2, "0"); // 补齐两位数字

    if (params.filterType === "day") {
      params.date = `${year}-${month}-${day}`; // 格式化为 YYYY-MM-DD
    } else if (params.filterType === "month") {
      params.date = `${year}-${month}`; // 格式化为 YYYY-MM
    } else if (params.filterType === "year") {
      params.date = `${year}`; // 格式化为 YYYY
    }
  }
  console.log(params.date);


  service.get('/orderForm/getOrderInfo', { params }).then((res: any) => {
    tableData.value = res.userStatistics
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



<!-- <el-table-column prop="buyerName" label="赠送人" align="center" />
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
    {{ scope.row.updated_at !== scope.row.created_at ? changeTimeFormat(scope.row.updated_at) : '待支付' }}
  </template>
</el-table-column> -->