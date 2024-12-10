<template>
	<div class="userInfoabo">
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
			<el-table-column prop="vote" label="票数" align="center" />
			<el-table-column label="操作" width="330" align="center">
				<template v-slot="scope">
					<el-button type="primary" @click="gorich(scope.row)">简介</el-button>
					<el-button type="primary" @click="goComment(scope.row._id)">留言板</el-button>
					<el-button type="danger">删除</el-button>
					<el-button type="primary" size="small">编辑</el-button>
				</template>
			</el-table-column>
		</el-table>
		<div>
			<el-pagination v-model:current-page="page" v-model:page-size="pageSize" :page-sizes="[5, 10, 15, 20]"
				:background="true" layout="total, sizes, prev, pager, next, jumper" :total="total"
				@size-change="handleSizeChange" @current-change="handleCurrentChange" />
		</div>

		<loading :loadState="loadState" />
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import service from '@/utils/request';
import { useRouter } from 'vue-router';
import loading from '@/components/loading.vue';
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
	userls.value = res.users
	total.value = res.userstotal
	loadState.value = false
}
//onMounted
onMounted(() => {
	getdusers()
})
</script>

<style scoped>
.userInfoabo {
	padding: 10px 20px;
}
</style>