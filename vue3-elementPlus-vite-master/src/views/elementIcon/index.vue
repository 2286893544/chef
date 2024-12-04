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
			<el-table-column prop="age" label="年龄" align="center" />
			<el-table-column label="性别" align="center">
				<template v-slot="scope">
					{{ scope.row.gender ? '男' : '女' }}
				</template>
			</el-table-column>
			<el-table-column prop="vote" label="票数" align="center" />
			<el-table-column label="操作" align="center">
				<template v-slot="scope">
					<el-button type="danger">删除</el-button>
					<el-button type="primary" @click="goComment(scope.row._id)">留言板</el-button>
				</template>
			</el-table-column>
		</el-table>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import service from '@/utils/request';
import { useRouter } from 'vue-router'


const router = useRouter()
function goComment(id: string) {
	router.push(`/comment/${id}`)
}

//获取所有用户
let userls = ref([])
let getdusers = async () => {
	let res: any = await service.get("/getuser")
	userls.value = res.users
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