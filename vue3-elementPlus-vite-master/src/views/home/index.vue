<template>
  <div>
    <div class="actives-data">
      <div class="actives-data-div">
        <p>累计人数</p>
        <p>{{ activesData.joinNum }}</p>
      </div>
      <div class="actives-data-div">
        <p>累计票数</p>
        <p>{{ activesData.accumulatedNum }}</p>
      </div>
      <div class="actives-data-div">
        <p>累计访问量</p>
        <p>{{ activesData.visitNum }}</p>
      </div>
    </div>

    <div class="chart-container">
      <div ref="ageChart" class="chart"></div>
      <div ref="jobChart" class="chart"></div>
    </div>

    <loading :loadState="loadState" />
  </div>
</template>

<script setup lang="ts">
// 引入ECharts
import service from '@/utils/request'
import * as echarts from 'echarts'
import { ref, onMounted, reactive } from 'vue'
import loading from '@/components/loading.vue'
import { ElMessage } from 'element-plus'

type activityMsgType = {
  _id: String
  endTime: String
  joinNum: Number
  rule: String
  startTime: String
  title: String
  visitNum: Number
  accumulatedNum: Number
}
const activesData = ref<activityMsgType>({
  _id: '',
  endTime: '',
  joinNum: 0,
  rule: '',
  startTime: '',
  title: '',
  visitNum: 0,
  accumulatedNum: 0
})
const jobDistributionNum = ref([])
const lookState = ref<string>('')
const loadState = ref<boolean>(false)

// 使用ref来引用DOM元素
const ageChart = ref<HTMLDivElement | null>(null)
const jobChart = ref<HTMLDivElement | null>(null)

function getactives() {
  service.get('/getactives').then((res: any) => {
    if (res.activityMsgs.length > 0) {
      activesData.value = res.activityMsgs[0]
    }
  })
}
function getuser() {
  try {
    service.get('/getShow').then((res: any) => {
      if (res.jobDistribution.length > 0) {
        jobDistributionNum.value = res.jobDistribution
      }
      ageChartinit()
    })
  } catch (err) {
    ElMessage.error(`获取数据失败,${err}`)
  }
}
async function getDetail() {
  try {
    await service.get('/getDetail').then((res: any) => {
      if (res.data_things[0].length > 0) {
        jobChartinit(res.data_things)
      } else {
        jobChartinit([])
      }
    })
  } catch (err) {
    ElMessage.error(`获取数据失败,${err}`)
  }
}

function ageChartinit() {
  if (ageChart.value) {
    const myEcharts = echarts.init(ageChart.value);
    if (jobDistributionNum.value.length === 0) {
      // 数据为空，显示“暂无数据”的提示
      myEcharts.setOption({
        title: {
          text: '职位分布 (无数据)',
          left: 'center',
          top: 'center',
          textStyle: {
            fontSize: 20,
            color: '#999'
          }
        },
        series: []  // 空的 series 表示无数据
      });
    } else {
      // 正常的数据渲染
      // 设置图表的选项
      myEcharts.setOption({
        title: {
          text: '职位分布',
          left: 'center'
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          top: '5%',
          left: 'left',
          orient: 'vertical'
        },
        series: [
          {
            name: '职位分布',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            padAngle: 5,
            itemStyle: {
              borderRadius: 10
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 20,
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: jobDistributionNum.value
          }
        ]
      })
    }
  }
}

function jobChartinit(jobListData: any) {
  if (jobChart.value) {
    const myEcharts = echarts.init(jobChart.value);
    if (jobListData.length === 0) {
      // 数据为空，显示“暂无数据”的提示
      myEcharts.setOption({
        title: {
          text: '职业划分票数 (无数据)',
          left: 'center',
          top: 'center',
          textStyle: {
            fontSize: 20,
            color: '#999'
          }
        },
        series: []  // 空的 series 表示无数据
      });
    } else {
      // 正常的数据渲染
      const myEcharts = echarts.init(jobChart.value)

      // 获取屏幕宽度来决定旋转角度
      let rotateAngle = 0;
      if (window.innerWidth <= 768) {
        rotateAngle = 45;  // 小屏幕设备，旋转 45 度
      } else if (window.innerWidth <= 1024) {
        rotateAngle = 30;  // 中等屏幕设备，旋转 30 度
      } else {
        rotateAngle = 0;   // 大屏幕设备，不旋转
      }

      // 定义所有的 Option 配置
      const allOptions: any = {}
      jobListData.forEach((data: any) => {
        const optionId = data[0][2]
        const option = {
          id: optionId,
          title: {
            text: '职业划分票数',
            left: 'center'
          },
          grid: {
            top: '20%', // 增加顶部边距，避免Y轴标签被遮挡
            left: '15%', // 增加左侧边距，确保标签有足够的显示空间
            right: '10%', // 右侧边距增加，确保右侧不被遮挡
            bottom: '30%' // 增加底部边距，确保图表底部有足够空间
          },
          xAxis: {
            type: 'category',
            axisLabel: {
              textStyle: {
                fontSize: 12, // 调整字体大小
                color: '#000' // 设置字体颜色
              },
              rotate: rotateAngle, // 动态设置旋转角度
              padding: [0, 0, 10, 0] // 设置标签的内边距
            }
          },
          yAxis: {
            minInterval: 1,
            axisLabel: {
              textStyle: {
                fontSize: 12, // 调整Y轴标签字体大小
                color: '#000' // 设置Y轴标签颜色
              }
            }
          },
          series: {
            type: 'bar',
            data: data,
            universalTransition: {
              enabled: true,
              divideShape: 'clone'
            }
          },
          graphic: [
            {
              type: 'text',
              left: 50,
              top: 20,
              style: {
                text: lookState.value,
                fontSize: 18,
                fill: 'grey'
              },
              onclick: function () {
                goBack()
              }
            }
          ]
        }
        allOptions[optionId] = option
      })

      // 下钻和返回功能
      const optionStack: any = []

      const goForward = (optionId: any) => {
        lookState.value = '返回'
        optionStack.push(myEcharts.getOption().id) // 保存当前的 optionId
        myEcharts.setOption(allOptions[optionId]) // 设置下一个层级的 option

        updateLookStateText() // 更新 "Back" 文本
      }

      const goBack = () => {
        lookState.value = ''
        myEcharts.setOption(allOptions[optionStack.pop()])
        updateLookStateText()
      }

      // 用于更新图表的 "Back" 文本
      const updateLookStateText = () => {
        const currentOption: any = myEcharts.getOption()
        currentOption.graphic[0].elements[0].style.text = lookState.value // 更新文本
        myEcharts.setOption(currentOption) // 重新设置图表的配置
      }

      let option = allOptions['things'] // 初始层级是 "things"
      myEcharts.setOption(option) // 设置初始图表

      myEcharts.on('click', 'series', (params) => {
        const dataItem: any = params.data
        if (dataItem[3]) {
          // 如果当前的点击项不是最底层数据，它有 data[3]，说明可以下钻
          const childGroupId = dataItem[3]
          const nextOptionId = childGroupId
          goForward(nextOptionId) // 下钻到下一层级
        }
      })
    }
  }
}


onMounted(() => {
  loadState.value = true
  Promise.all([getactives(), getuser(), getDetail()])
    .then(() => {
      loadState.value = false
    })
    .catch(() => {
      loadState.value = true
    })
})
</script>

<style lang="less" scoped>
.actives-data {
  width: 80%;
  height: auto;
  margin: 0 auto;
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-top: 20px;
  margin-bottom: 20px;

  .actives-data-div {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    text-align: center;

    p {
      width: 100%;
    }

    p:nth-child(1) {
      font-size: 18px;
      margin-bottom: 8px;
    }

    p:nth-child(2) {
      font-size: 28px;
      color: red;
      font-family: electronicFont;
      font-weight: bold;
    }
  }
}

.chart-container {
  width: 98%;
  margin: 0 auto;
  margin-top: 40px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;

  .chart {
    width: 45%;
    height: 350px;
    margin-bottom: 20px;
  }
}

/* 平板及以下设备 */
@media (max-width: 768px) {
  .actives-data {
    width: 95%;
  }

  .actives-data-div p:nth-child(1) {
    font-size: 16px;
  }

  .actives-data-div p:nth-child(2) {
    font-size: 22px;
  }

  .chart-container {
    width: 100%;
    flex-direction: column;

    .chart {
      width: 80%;
      height: 300px;
    }
  }
}

/* 小屏设备（如手机，max-width: 480px） */
@media (max-width: 480px) {
  .actives-data {
    width: 100%;
    margin-top: 10px;
  }

  .actives-data-div p:nth-child(1) {
    font-size: 12px;
  }

  .actives-data-div p:nth-child(2) {
    font-size: 16px;
  }

  .chart-container {
    margin-top: 15px;
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    width: 100%;
    margin-bottom: 20px;
    font-size: 12px;

    .chart {
      width: 90%;
      margin: 0 auto;
      height: 250px;
    }
  }
}
</style>
