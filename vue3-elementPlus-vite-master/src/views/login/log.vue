<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router';
import service from '@/utils/request';
const router = useRouter()
const formSize = ref('default')
const ruleFormRef = ref()
const ruleForm = reactive({
  act: '',
  pwd: '',
})

const setuse = (res) => {
  userStore.setuserpinia(res)
}
const asatoken = (res) => {
  disatoken.setatoken(res)
}
const asrtoken = (res) => {
  disrtoken.setrtoken(res)
}
const rules = reactive({
  act: [
    { required: true, message: '请输入账号', trigger: 'blur' },
  ],
  pwd: [
    { required: true, message: '请输入密码', trigger: 'blur' },
  ],
})

const submitForm = async (formEl) => {
  if (!formEl) return
  await formEl.validate(async(valid, fields) => {
    if (valid) {
      let res = await service.post("/adlogin", ruleForm)
      console.log(res);
      if (res.code == 200) {
        localStorage.setItem("token", res.token)
        router.push("/home")
      }else if(res.code == 401){
        console.log("用户被禁用");
      }else{
        console.log("登录失败");
      }
    } else {
      console.log('error submit!', fields)
    }
  })
}

// const resetForm = (formEl) => {
//   if (!formEl) return
//   formEl.resetFields()
// }



</script>
<template>
  <div id="logimagebox">
    <div class="colorimg">
      <div class="logformtitle">
        <div class="logtitle">
          <h1>投票系统后台管理</h1>
          <p>SHUANGHUILENGYITONGZHIHUIYUANQU</p>
        </div>
        <div class="logform">
          <div class="rightlogform">
            <h2>欢迎登录</h2>
            <el-form ref="ruleFormRef" hide-required-asterisk="true" style="max-width: 600px" :model="ruleForm" :rules="rules" label-width="auto"
              class="demo-ruleForm" :size="formSize" status-icon>
              <el-form-item label="账号" prop="act">
                <el-input v-model="ruleForm.act" placeholder="请输入账号"/>
              </el-form-item>
              <el-form-item label="密码" prop="pwd">
                <el-input v-model="ruleForm.pwd" placeholder="请输入密码"/>
              </el-form-item>
              <el-form-item>
                <el-button class="logbtn" type="primary" @click="submitForm(ruleFormRef)">
                  登录
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
#logimagebox {
  width: 100%;
  height: 100vh;
  
}

.colorimg {
  width: 100%;
  height: 100%;
  background-color: rgba(92, 163, 150, 0.8);
  position: relative;
}

.logformtitle {
  width: 800px;
  height: 460px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.logformtitle .logtitle {
  text-align: center;
  color: white;
}

.logtitle p {
  font-size: 12px;
}

.logformtitle .logform {
  height: 397px;
  background-color: white;
  margin-top: 12px;
}

.logform {
  display: flex;
  justify-content: center;
}

.logform .leftimg {
  width: 400px;
  height: 100%;
  background-image: url('/src/static/2.png');
  background-size: cover;
}

.logform .rightlogform {
  width: 400px;
  height: 100%;
  box-sizing: border-box;
  padding-right: 50px;
  padding-top: 30px;
  text-align: center;
}
.rightlogform{
  position: relative;
}
.el-form{
  width: 266px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.logbtn{
  background-color: rgba(0, 119, 97);
  width: 266px;
  height: 40px;
  text-align: center;
  border: none;
  border-radius:30px;
  position: relative;
  right: 24px;

}
.el-input__wrapper{
  border: none !important;;
}
</style>