<template>
  <div class="activecontainer">
    <div class="addactivebtn">
      <el-button type="primary" @click="setdialogvisiblew('add', null)">
        添加活动
      </el-button>
    </div>
    <div class="activeTb">
      <!-- 表格 -->
      <el-table :data="activels" style="width: 100%; margin-top: 20px">
        <el-table-column prop="title" label="活动标题" align="center" />
        <el-table-column prop="announcement" label="活动公告" align="center" />
        <el-table-column prop="joinNum" label="参赛人数" align="center" />
        <el-table-column prop="accumulatedNum" label="累计票数" align="center" />
        <el-table-column prop="visitNum" label="访问总量" align="center" />
        <el-table-column prop="rule" label="活动规则" align="center" />
        <el-table-column label="活动状态" align="center">
          <template v-slot="scope">
            <el-text v-if="checkActivityStatus(scope.row.startTime, scope.row.endTime) === '未开始'"
              class="mx-1">未开始</el-text>
            <el-text v-if="checkActivityStatus(scope.row.startTime, scope.row.endTime) === '已结束'" class="mx-1"
              type="danger">已结束</el-text>
            <el-text v-if="checkActivityStatus(scope.row.startTime, scope.row.endTime) === '进行中'" class="mx-1"
              type="success">进行中</el-text>
          </template>
        </el-table-column>
        <el-table-column label="开始时间" align="center">
          <template v-slot="scope">
            {{ getfullTime(scope.row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column label="结束时间" align="center">
          <template v-slot="scope">
            {{ getfullTime(scope.row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="150px">
          <template v-slot="scope">
            <el-button type="primary" size="small" @click="setdialogvisiblew('upd', scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="delact(scope.row._id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!--添加修改活动-->
    <el-dialog v-model="centerDialogVisible" :title="formstatus == 'add' ? '添加活动' : '修改活动'" width="500" align-center>
      <el-form ref="ruleFormRef" style="max-width: 600px" :model="ruleForm" :rules="rules" label-width="auto"
        class="demo-ruleForm" :size="formSize" status-icon show-close="false">
        <el-form-item label="活动名称" prop="title">
          <el-input v-model="ruleForm.title" placeholder="请输入活动名称"></el-input>
        </el-form-item>
        <el-form-item label="参赛人数" prop="joinNum">
          <el-input v-model.number="ruleForm.joinNum" placeholder="请输入参赛人数"></el-input>
        </el-form-item>
        <el-form-item label="累计票数" prop="accumulatedNum">
          <el-input v-model.number="ruleForm.accumulatedNum" placeholder="请输入累计票数"></el-input>
        </el-form-item>
        <el-form-item label="累计访问量" prop="visitNum">
          <el-input v-model.number="ruleForm.visitNum" placeholder="请输入累计访问量"></el-input>
        </el-form-item>
        <el-form-item label="活动公告" prop="visitNum">
          <el-input v-model.number="ruleForm.announcement" placeholder="请输入活动公告"></el-input>
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker v-model="ruleForm.startTime" type="datetime" placeholder="请选择开始时间" />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker v-model="ruleForm.endTime" type="datetime" placeholder="请选择结束时间" />
        </el-form-item>
        <el-form-item label="活动规则" prop="rule">
          <el-input v-model="ruleForm.rule" style="width: 480px" :autosize="{ minRows: 4, maxRows: 6 }" type="textarea"
            placeholder="请输入活动规则" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="resetForm">取消</el-button>
          <el-button v-if="formstatus == 'add'" type="primary" @click="addactive">
            确定
          </el-button>
          <el-button v-else type="primary" @click="updactive">
            修改
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import service from '@/utils/request'
import dayjs from 'dayjs'

//时间戳转化为事件
const getfullTime = (date: Date) => {
  return dayjs(date).format('YYYY年MM月DD日 HH:mm:ss')
}

//获取所有活动
let activels = ref([])
const getactives = async () => {
  let res: any = await service.get('/getactives')
  console.log(res)
  activels.value = res.activityMsgs
}
//控制对话框
const centerDialogVisible = ref(false)
//对话框添加或者修改的状态
const formstatus = ref<String>('add')
//显示对话框
//修改_id
let updid = ref('')
const setdialogvisiblew = (status: String, data: any) => {
  centerDialogVisible.value = true
  formstatus.value = status
  if (data) {
    updid.value = data._id
    ruleForm.title = data.title
    ruleForm.joinNum = data.joinNum
    ruleForm.accumulatedNum = data.accumulatedNum
    ruleForm.visitNum = data.visitNum
    ruleForm.announcement = data.announcement
    ruleForm.startTime = data.startTime
    ruleForm.endTime = data.endTime
    ruleForm.rule = data.rule
  }
}
//表单
interface RuleForm {
  title: String
  joinNum: Number
  accumulatedNum: Number
  visitNum: Number
  startTime: String
  endTime: String
  rule: String
  announcement: String
}

const formSize = ref('default')
const ruleFormRef = ref()
let ruleForm = reactive<RuleForm>({
  title: '',
  joinNum: 0,
  accumulatedNum: 0,
  visitNum: 0,
  startTime: '',
  endTime: '',
  rule: '',
  announcement: ''
})

const rules = reactive({
  title: [
    { required: true, message: "请输入活动名称", trigger: 'blur' }
  ],
  joinNum: [
    { required: true, message: "请输入参赛人数", trigger: 'blur' }
  ],
  accumulatedNum: [
    { required: true, message: "请输入累计票数", trigger: 'blur' }
  ],
  visitNum: [
    { required: true, message: "请输入累计访问量", trigger: 'blur' }
  ],
  announcement: [
    { required: true, message: "请输入活动公告", trigger: 'blur' }
  ],
  startTime: [
    { required: true, message: "请选择开始时间", trigger: 'blur' }
  ],
  endTime: [
    { required: true, message: "请选择结束时间", trigger: 'blur' }
  ],
  rule: [
    { required: true, message: "请输入活动规则", trigger: 'blur' }
  ],
})



const resetForm = () => {
  centerDialogVisible.value = false
  ruleForm.title = '',
    ruleForm.joinNum = 0,
    ruleForm.accumulatedNum = 0,
    ruleForm.visitNum = 0,
    ruleForm.startTime = '',
    ruleForm.endTime = '',
    ruleForm.rule = ''
}
//添加
const addactive = async () => {
  let res: any = await service.post("/addactivityMsg", ruleForm)
  if (res.code == 200) {
    centerDialogVisible.value = false
    getactives()
  }
}
//修改
const updactive = async () => {
  // console.log(updid.value);
  // console.log(ruleForm);
  let res: any = await service.post(`/updactive?updid=${updid.value}`, ruleForm)
  if (res.code == 200) {
    updid.value = ''
    resetForm()
    getactives()
  }

}
//删除
const delact = async (id: any) => {
  let res: any = await service.delete(`/delactive?delid=${id}`)
  if (res.code == 200) {
    getactives()
  }
}
//活动状态
const checkActivityStatus = (startt: any, endt: any) => {
  const currentTime = new Date(); // 当前时间
  const start = new Date(startt); // 活动开始时间
  const end = new Date(endt); // 活动结束时间

  if (currentTime < start) {
    return "未开始"; // 当前时间早于活动开始时间
  } else if (currentTime > end) {
    return "已结束"; // 当前时间晚于活动结束时间
  } else {
    return "进行中"; // 当前时间在活动的开始和结束之间
  }
}
onMounted(() => {
  getactives()
})
</script>

<style scoped>
.activecontainer {
  padding: 10px 20px;
}
</style>