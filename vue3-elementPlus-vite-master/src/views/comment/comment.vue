<template>
  <div class="commentStyle">
    <span class="back" @click="goBack">返回</span>

    <el-table :data="comment" style="width: 100%">
      <el-table-column prop="name" label="姓名" align="center" />
      <el-table-column label="头像" align="center">
        <template v-slot="scope">
          <el-image style="width: 100px; height: 100px" :src="scope.row.avtor" />
        </template>
      </el-table-column>
      <el-table-column label="添加时间" align="center">
        <template v-slot="scope">
          {{ scope.row.startTime.replace('T', ' ').split('.')[0] }}
        </template>
      </el-table-column>
      <el-table-column prop="content" label="审核" align="center">
        <template v-slot="scope">
          <el-switch v-model="scope.row.audit" @click="changeState(scope.row._id)" />
        </template>
      </el-table-column>
      <el-table-column label="内容" align="center">
        <template v-slot="scope">
          <span class="w-100px mb-2 contentText">
            {{ scope.row.content }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template v-slot="scope">
          <el-button type="danger" size="small" @click="deleteComment(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination v-model:current-page="page" v-model:page-size="pageSize" :page-sizes="[3, 5, 7, 9]"
      :background="true" layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
      @current-change="handleCurrentChange" />
  </div>
</template>

<script setup lang="ts">
import service from '@/utils/request';
import { ElMessage, ElMessageBox } from 'element-plus';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router'

type commentType = {
  _id: String,
  audit: Boolean,
  cid: String,
  content: String,
  name: String,
  startTime: Date,
  uid: String
}

const route = useRoute()
const cid = route.params.id
const comment = ref<commentType[]>([])
const page = ref<number>(1)
const pageSize = ref<number>(3)
const total = ref<number>(0)
const router = useRouter()

function goBack() {
  router.back()
}

function getComment() {
  service.get(`/getComment`, { params: { cid, page: page.value, pageSize: pageSize.value } }).then((res: any) => {
    if (res.code === 200) {
      comment.value = res.data
      total.value = res.total
    } else {
      ElMessage.error(res.msg)
      console.log(res.err)
    }
  })
}

onMounted(() => {
  getComment()
})



const handleSizeChange = (val: number) => {
  pageSize.value = val
  getComment()
}
const handleCurrentChange = (val: number) => {
  page.value = val
  getComment()
}

function deleteComment(id: String) {
  ElMessageBox.confirm(
    '您确定要删除吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      service.delete(`/delComment`, { params: { id } }).then((res: any) => {
        if (res.code === 200) {
          ElMessage.success(res.msg)
          getComment()
        } else {
          ElMessage.error(res.msg)
          console.log(res.err)
        }
      })
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '已取消删除',
      })
    })
}

function changeState(_id: string) {
  try {
    service.put(`/updateComment`, { _id }).then((res: any) => {
      if (res.code === 200) {
        ElMessage.success('更新成功')
        getComment()
      }
    })
  } catch (err) {
    ElMessage.error('修改失败')
    console.log(err)
  }
}

</script>

<style scoped lang="less">
.commentStyle {
  width: 20vw;
  // /* margin-top: 20px; */
}

.contentText {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.back {
  color: #63B0FF;
  font-weight: bold;
  font-size: 20px;
}


.back:hover {
  color: #AAD4FF;
  cursor: pointer;
}
</style>