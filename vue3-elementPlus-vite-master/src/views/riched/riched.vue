<template>
    <div class="rich-text-editor">
        <el-button type="info" @click="goBack" style="margin: 20px;">返回</el-button>
        <div ref="editorContainer" class="editor-container"></div>
        <el-button type="primary" @click="submit">添加</el-button>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Quill from 'quill' // 引入编辑器
import 'quill/dist/quill.snow.css'
import axios from 'axios'
import service from '@/utils/request'
import { ElMessage } from 'element-plus'

// 获取环境变量中的上传地址
const uploadUrl = import.meta.env.VITE_GLOB_API_URL + '/upload'
const route = useRoute()
const router = useRouter()
const uId = route.params.id || ''
let richText = sessionStorage.getItem("richText") ? JSON.parse(sessionStorage.getItem("richText") as string) : "";

function goBack() {
    router.go(-1)
}


var quill: any;
const editorContainer = ref<any>(null)

//quill编辑器的字体
var fonts = ['SimSun', 'SimHei', 'Microsoft-YaHei', 'KaiTi', 'FangSong', 'Arial', 'Times-New-Roman', 'sans-serif'];
var Font: any = Quill.import('formats/font');
Font.whitelist = fonts; //将字体加入到白名单 
Quill.register(Font, true);

onMounted(() => {
    quill = new Quill(editorContainer.value, {
        theme: 'snow',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'], // 加粗，斜体，下划线，删除线
                ['blockquote', 'code-block'], // 引用，代码块

                [{ 'header': 1 }, { 'header': 2 }], // 1、2 级标题
                [{ 'script': 'sub' }, { 'script': 'super' }], // 上标/下标
                [{ 'size': ['small', false, 'large', 'huge'] }], // 字体大小
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }], // 标题
                [{ 'indent': '-1' }, { 'indent': '+1' }], // 缩进
                [{ 'color': [] }, { 'background': [] }], // 字体颜色，字体背景颜色
                [{ 'font': fonts }],       //把上面定义的字体数组放进来
                [{ 'align': [] }], // 对齐方式
                ['clean'], // 清除字体样式
                ['image'] // 上传图片
            ],
        },
    })

    // 如果 richText 存在，回显到编辑器
    if (richText) {
        // 使用 dangerouslyPasteHTML 回显 HTML 数据
        quill.clipboard.dangerouslyPasteHTML(richText);
    }

    // 自定义图片上传按钮的事件
    const imageHandler = () => {
        const input = document.createElement('input')
        input.setAttribute('type', 'file')
        input.setAttribute('accept', 'image/*')
        input.click()

        // 选择文件后上传
        input.onchange = () => {
            const file = input.files?.[0]
            if (file) {
                uploadImage(file)
            }
        }
    }

    // 注册图片上传事件
    const toolbar = quill?.getModule('toolbar')
    toolbar?.addHandler('image', imageHandler)
})

// 图片上传函数
function uploadImage(file: File) {
    const formData = new FormData()
    formData.append('file', file)

    // 上传图片到服务器
    axios.post(uploadUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
        .then((response) => {
            const imageUrl = `${import.meta.env.VITE_GLOB_API_URL}/${response.data.path}`

            // 获取当前光标位置
            const range = quill?.getSelection()
            if (range) {
                const imgTag = `<img src="${imageUrl}" alt="Uploaded Image" style="max-width: 50%; height: auto;" />`;

                // 获取当前光标位置，并插入 img 标签
                const currentHTML = quill.root.innerHTML;
                const beforeCursor = currentHTML.substring(0, range.index); // 光标前的内容
                const afterCursor = currentHTML.substring(range.index); // 光标后的内容

                // 更新编辑器内容，插入 img 标签
                quill.root.innerHTML = beforeCursor + imgTag + afterCursor;

                // 将光标位置移动到图片后面
                quill.setSelection(range.index + imgTag.length);
            } else {
                ElMessage.error('图片上传失败，服务器返回无效路径');
            }
        })
        .catch((error) => {
            console.error('图片上传失败', error)
        })
}

function submit() {
    if (quill) {
        // 获取编辑器的 HTML 内容
        const html = quill.root.innerHTML
        // 内联样式处理
        // const htmlWithInlineStyles = inlineStyles(html);
        richText = inlineStyles(html);
        // 更新简历
        modifyResume(richText)
    }
}

// 修改简历
function modifyResume(richText: string) {
    service.put("/changeRichText", { id: uId, content: richText }).then((res: any) => {
        if (res.code == 200) {
            ElMessage.success("修改成功")
            goBack()
        } else {
            ElMessage.error("修改失败")
        }
    })
}

// 内联样式函数
function inlineStyles(htmlContent: string): string {
    const doc = new DOMParser().parseFromString(htmlContent, 'text/html');

    // 获取所有带有对齐的元素
    const elements = doc.querySelectorAll('[class*="ql-align-"]');

    elements.forEach((element: any) => {
        const alignClass: any = Array.from(element.classList).find((className: any) => className.startsWith('ql-align-'));
        if (alignClass) {
            const alignValue = alignClass.replace('ql-align-', '');  // 获取对齐值
            element.style.textAlign = alignValue;  // 将对齐样式内联到元素
        }
    });

    // 获取所有带有颜色、背景色的元素
    const colorElements = doc.querySelectorAll('[style*="color"]');
    colorElements.forEach((element: any) => {
        const colorValue = element.style.color; // 获取颜色
        if (colorValue) {
            element.style.color = colorValue;  // 确保颜色内联
        }
    });

    // 返回内联样式的 HTML 内容
    return doc.documentElement.innerHTML;
}

</script>

<style scoped lang="less">
.editor-container {
    height: 70vh;
    border: 1px solid #ccc;
    margin-top: 20px;
}
</style>