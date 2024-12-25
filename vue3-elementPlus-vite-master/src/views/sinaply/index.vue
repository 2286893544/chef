<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import service from '@/utils/request';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import loading from '@/components/loading.vue';

const fileList = ref([])
const ActionUrl = ref<String>('')
const router = useRouter()
const route = useRoute()
const loadState = ref<boolean>(false)
const vid = route.params.id
let voice = ref('active')
function goBack() {
  router.back()
}
//分页
let page = ref(1)
let pageSize = ref(5)
let total = ref(20)
// 更改每页数量
const handleSizeChange = (val: number) => {
	pageSize.value = val
	page.value = 1
	getvotedata()
}

// 选择页数
const handleCurrentChange = (val: number) => {
	page.value = val
	getvotedata()
}
let setvoice = (mtd: any) => {
    
    voice.value = mtd
    getvotedata()
}
//获取数据
let votehisdata = ref([])
let getvotedata = async() => {
    let res: any = await service.get("/homePage/sinaplyvotes", { params: { vid: vid, voice: voice.value, page: page.value, pageSize: pageSize.value } })
    votehisdata.value = res.pageData
    total.value = res.totalItems
}
onMounted(() => {
    getvotedata()
    
})
</script>
<template>
    <div>
        <div>
            <span class="back" @click="goBack">返回</span>
        </div>
        <div>
            <el-button type="primary" @click="setvoice('active')" :class="voice == 'passive'? 'dis' : '' ">赠送</el-button>
        <el-button type="primary" @click="setvoice('passive')" :class="voice == 'active'? 'dis' : '' ">得到</el-button>
        </div>
        <el-table :data="votehisdata" style="width: 100%; margin-top: 20px">
			<el-table-column prop="send" label="用户" align="center" />
			<el-table-column label="选手" align="center">
				<template v-slot="scope">
					{{ scope.row.acp }}号
				</template>
			</el-table-column>
			<el-table-column label="记录" align="center">
				<template v-slot="scope">
                    {{ scope.row.vote === 1 ? `${scope.row.send}给${scope.row.acp}投了1票` : `${scope.row.send}给${scope.row.acp}赠送了${scope.row.vote}朵鲜花` }}
					<!-- {{ scope.row.vote === 1 ? `${scope.row.desc[0].name}给${scope.row.desc2[0].name}投了1票` : `${scope.row.desc[0].name}给${scope.row.desc2[0].name}赠送了${scope.row.vote}朵鲜花` }} -->
				</template>
			</el-table-column>
			
		</el-table>
        <el-pagination v-model:current-page="page" v-model:page-size="pageSize" :page-sizes="[5, 10, 15, 20]"
				:background="true" layout="total, sizes, prev, pager, next, jumper" :total="total"
				@size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>
</template>
<style scoped>
.dis{
    background-color: gray;
}
</style>