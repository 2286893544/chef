<template>
	<div class="userInfoabo">
		<el-button type="primary" @click="setdialogvisiblew('add', null)">
        添加用户
      </el-button>
		<el-table :data="userls" style="width: 100%; margin-top: 20px">
			<el-table-column prop="name" label="姓名" align="center" />
			<el-table-column label="编号" align="center">
				<template v-slot="scope">
					{{ scope.row.mark }}号
				</template>
			</el-table-column>
			<el-table-column label="头像" align="center">
				<template v-slot="scope">
					<img :src="scope.row.avtor" alt="图片路径错误" style="height: 50px" />
				</template>
			</el-table-column>
			<el-table-column label="职位" align="center">
				<template v-slot="scope">
					{{ scope.row.position[0].jobTitle }}
				</template>
			</el-table-column>
			<el-table-column prop="age" label="年龄" align="center" />
			<el-table-column label="性别" align="center">
				<template v-slot="scope">
					{{ scope.row.gender ? '男' : '女' }}
				</template>
			</el-table-column>
			<el-table-column label="票数" align="center">
				<template v-slot="scope">
					{{ scope.row.vote }}
				</template>
			</el-table-column>
			<el-table-column label="操作" width="330" align="center">
				<template v-slot="scope">
					<el-button type="primary" @click="gorich(scope.row)">简介</el-button>
					<el-button type="primary" @click="goComment(scope.row._id)">留言板</el-button>
					<el-button type="danger">删除</el-button>
					<el-button type="primary" size="small" @click="setdialogvisiblew('upd', scope.row)">编辑</el-button>
				</template>
			</el-table-column>
		</el-table>
		<div>
			<el-pagination v-model:current-page="page" v-model:page-size="pageSize" :page-sizes="[5, 10, 15, 20]"
				:background="true" layout="total, sizes, prev, pager, next, jumper" :total="total"
				@size-change="handleSizeChange" @current-change="handleCurrentChange" />
		</div>


		<!--添加修改活动-->
		<el-dialog v-model="centerDialogVisible" :title="formstatus == 'add' ? '添加用户' : '修改用户'" width="500" align-center>
      <el-form ref="ruleFormRef" style="max-width: 600px" :model="ruleForm" :rules="rules" label-width="auto"
        class="demo-ruleForm" :size="formSize" status-icon show-close="false">
        <el-form-item label="用户姓名" prop="name">
          <el-input v-model="ruleForm.name" placeholder="请输入用户姓名"></el-input>
        </el-form-item>
        <el-form-item label="用户封面" prop="cover">
			<el-upload
				class="avatar-uploader"
				:action="ActionUrl + '/upload'"
				:show-file-list="false"
				:on-success="handlePreview"
				:on-error="handleError"
			>
				<img v-if="ruleForm.cover" :src="ruleForm.cover" class="avatar" />
				<el-button v-else type="primary">上传图片</el-button>
			</el-upload>
        </el-form-item>
        <el-form-item label="用户年龄" prop="age">
          <el-input v-model.number="ruleForm.age" placeholder="请输入用户年龄"></el-input>
        </el-form-item>
        <el-form-item label="用户性别" prop="gender">
			<el-switch v-model="ruleForm.gender" active-text="男" inactive-text="女" />
        </el-form-item>
        <el-form-item label="用户标签" prop="label">
          <el-input v-model="ruleForm.label" placeholder="请输入用户标签"></el-input>
        </el-form-item>
		<el-form-item label="用户职位" prop="position">
			<el-select v-model="ruleForm.position" placeholder="请选择用户职位" style="width: 240px">
			<el-option
				v-for="item in positionls"
				:key="item._id"
				:label="item.jobTitle"
				:value="item._id"
			/>
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
          <el-button v-else type="primary" @click="updactive">
            修改
          </el-button>
        </div>
      </template>
    </el-dialog>
		<loading :loadState="loadState" />
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import service from '@/utils/request';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import loading from '@/components/loading.vue';

const fileList = ref([])
const ActionUrl = ref<String>('')
const router = useRouter()
const loadState = ref<boolean>(false)
//
let gorich = (id: any) => {
	router.push(`/riched/${id._id}`,)
	sessionStorage.setItem("richText", JSON.stringify(id.richText))
}
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
	let res: any = await service.get("/getuser", { params: { nowPage: page.value, pageSize: pageSize.value } })
	const users = res.users
	for(let user of users){
		user.vote = await getuvotes(user._id)
	}
	userls.value = users
	total.value = res.userstotal
	loadState.value = false
}
//获取用户的票数
let getuvotes = async(id: any) => {
	let res: any = await service.get("/getapuservotes", { params: { apuid: id } })
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
  	ruleForm.cover = data.cover
  	ruleForm.age = data.age
  	ruleForm.gender = data.gender
  	ruleForm.label = data.label
  	ruleForm.position = data.position[0]._id
	ruleForm.vote = data.vote

  }
}
//表单
interface RuleForm {
  name: string,
  cover: string,
  age: number,
  gender: boolean,
  label: string,
  position: string,
  vote: number
}

const formSize = ref('default')
const ruleFormRef = ref()
let ruleForm = reactive<RuleForm>({
  name: '',
  cover: '',
  age: 0,
  gender: true,
  label: '',
  position: '',
  vote: 0
})

const rules = reactive({
  name: [
    { required: true, message: "请输入姓名", trigger: 'blur' }
  ],
  cover: [
  	{ required: true, message: "请上传封面", trigger: 'blur' }
  ],
  age: [
  	{ required: true, message: "请输入年龄", trigger: 'blur' }
  ],
  gender: [
	{ required: true, message: "请选择性别", trigger: 'blur' }
  ],
  label: [
  	{ required: true, message: "请输入标签", trigger: 'blur' }
  ],
  position: [
    { required: true, message: "请选择职位", trigger: 'blur' }
  ],
  vote: [
  { required: true, message: "请输入票数", trigger: 'blur' }
  ]
})



const resetForm = () => {
  centerDialogVisible.value = false
  ruleForm.name = ''
  	ruleForm.cover = ''
  	ruleForm.age = 0
  	ruleForm.gender = true
  	ruleForm.label = ''
  	ruleForm.position = ''
	ruleForm.vote = 0
}
//添加
const addactive = async () => {
  let res: any = await service.post("/adduser", ruleForm)
  if (res.code == 200) {
    centerDialogVisible.value = false
    getdusers()
  }
}
//修改
const updactive = async () => {
  let res: any = await service.post(`/upduserinfo?uid=${updid.value}`, ruleForm)
  if (res.code == 200) {
	let vote = ruleForm.vote - prevote.value
    let res2: any = await service.post('addaftdoorvote', { apid: updid.value, opa: vote })
	updid.value = ''
    resetForm()
    getdusers()
  }

}


// 上传成功时
const handlePreview = (uploadFile: any) => {
  const imgsrc = import.meta.env.VITE_GLOB_API_URL + '/' + uploadFile.path;
  ruleForm.cover = imgsrc
}


// 上传图片失败
const handleError = (err: any) => {
  ElMessage.error(`上传失败原因：${err}`)
}

//获取所有职位
let positionls = ref<any>([])
const getpositions = async() => {
	let res = await service.get("/getPosition")
	positionls.value = res.data
	
}
//onMounted
onMounted(() => {
	getdusers()
	getpositions()
	ActionUrl.value = import.meta.env.VITE_GLOB_API_URL
})
</script>

<style scoped>

</style>