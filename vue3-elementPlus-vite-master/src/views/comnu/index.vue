<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import service from '@/utils/request';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';


const fileList = ref([])
const ActionUrl = ref<String>('')
const router = useRouter()
//分页
let page = ref(1)
let pageSize = ref(5)
let total = ref(20)
// 更改每页数量
const handleSizeChange = (val: number) => {
	pageSize.value = val
	page.value = 1
	getcomnudata()
}

// 选择页数
const handleCurrentChange = (val: number) => {
	page.value = val
	getcomnudata()
}
//搜索
let searchphone = ref<String>('')
let searchcomnu = () => {
    page.value = 1
    getcomnudata()
}
//获取数据
let comnudata = ref([])
let getcomnudata = async () => {
	let res: any = await service.get("/getcomnuser", { params: { phone: searchphone.value, nowpage: page.value, pagesize: pageSize.value } })
	comnudata.value = res.comus
	total.value = res.comustl
}
onMounted(() => {
	getcomnudata()
})
</script>
<template>
	<div>
        <div>
            <div>
                <label for="">用户电话：</label>
                <el-input v-model="searchphone" style="width: 233px;" placeholder="用户电话"/>
                <el-button type="primary" style="margin: 20px;" @click="searchcomnu">
                搜索用户
            </el-button>
            </div>
            
        </div>
		<el-table :data="comnudata" style="width: 97%; margin: 0 auto; margin-top: 20px">
			<el-table-column label="用户" align="center">
				<template v-slot="scope">
					<!-- {{ scope.row.send }} -->
					{{ scope.row.deviceid }}
				</template>
			</el-table-column>

		</el-table>

		<div class="pagination">
			<el-pagination v-model:current-page="page" v-model:page-size="pageSize" :page-sizes="[5, 10, 15, 20]"
				:background="true" layout="total, sizes, prev, pager, next, jumper" :total="total"
				@size-change="handleSizeChange" @current-change="handleCurrentChange" />
			
		</div>
	</div>
</template>
<style scoped>
.pagination {
	width: 98%;
	margin: 0 auto;
	display: flex;
	justify-content: center;
	align-items: center;
	margin-top: 20px;
}
</style>

