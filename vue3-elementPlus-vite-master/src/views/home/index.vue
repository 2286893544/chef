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
  </div>
</template>

<script setup lang="ts">
// 引入ECharts
import service from '@/utils/request';
import * as echarts from 'echarts'
import { ref, onMounted, reactive } from 'vue'


type activityMsgType = {
  _id: String,
  endTime: String,
  joinNum: Number,
  rule: String,
  startTime: String,
  title: String,
  visitNum: Number,
  accumulatedNum: Number
}
const activesData = ref<activityMsgType>({
  _id: "",
  endTime: "",
  joinNum: 0,
  rule: "",
  startTime: "",
  title: "",
  visitNum: 0,
  accumulatedNum: 0
})
const jobDistributionNum = ref([])
let jobList = reactive([])
const lookState = ref<String>("")
const loadState = ref<Boolean>(false)

// 使用ref来引用DOM元素
const ageChart = ref<HTMLDivElement | null>(null)
const jobChart = ref<HTMLDivElement | null>(null)


function getactives() {
  service.get("/getactives").then((res: any) => {
    activesData.value = res.activityMsgs[0]
  })
}
function getuser() {
  try {
    service.get("/getShow").then((res: any) => {
      jobDistributionNum.value = res.jobDistribution
      ageChartinit()
    })
  } catch (err) {
    console.log(err)
  }
}
async function getDetail() {
  try {
    await service.get("/getDetail").then((res: any) => {
      jobList = res.data_things
      jobChartinit()
    })
  } catch (err) {
    console.log(err)
  }
}
function ageChartinit() {
  if (ageChart.value) {
    const myEcharts = echarts.init(ageChart.value)
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
function jobChartinit() {
  if (jobChart.value) {
    const myEcharts = echarts.init(jobChart.value);

    // 3. 定义所有的 Option 配置
    const allOptions: any = {};
    jobList.forEach((data) => {
      const optionId = data[0][2];
      const option = {
        id: optionId,
        title: {
          text: '职业划分票数',
          left: 'center'
        },
        xAxis: { type: 'category' },
        yAxis: { minInterval: 1 },
        animationDurationUpdate: 500,
        series: {
          type: 'bar',
          dimensions: ['x', 'y', 'groupId', 'childGroupId'],
          encode: {
            x: 'x',
            y: 'y',
            itemGroupId: 'groupId',
            itemChildGroupId: 'childGroupId'
          },
          data,
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
              goBack();
            }
          }
        ]
      };
      allOptions[optionId] = option;
    });

    // 4. 下钻和返回功能
    const optionStack: any = [];

    const goForward = (optionId: any) => {
      lookState.value = "返回"
      optionStack.push(myEcharts.getOption().id); // 保存当前的 optionId
      myEcharts.setOption(allOptions[optionId]); // 设置下一个层级的 option

      updateLookStateText(); // 更新 "Back" 文本
    };

    const goBack = () => {
      lookState.value = ""
      myEcharts.setOption(allOptions[optionStack.pop()]);
      updateLookStateText()
      // if (optionStack.length === 0) {
      //   console.log('Already in root level!');
      // } else {
      //   console.log('Go back to previous level.');
      // }
    };

    // 用于更新图表的 "Back" 文本
    const updateLookStateText = () => {
      const currentOption: any = myEcharts.getOption();
      currentOption.graphic[0].elements[0].style.text = lookState.value; // 更新文本
      myEcharts.setOption(currentOption); // 重新设置图表的配置

    };

    let option = allOptions['things']; // 初始层级是 "things"
    myEcharts.setOption(option); // 设置初始图表

    myEcharts.on('click', 'series', (params) => {
      const dataItem: any = params.data;
      if (dataItem[3]) {
        // 如果当前的点击项不是最底层数据，它有 data[3]，说明可以下钻
        const childGroupId = dataItem[3];
        const nextOptionId = childGroupId;
        goForward(nextOptionId); // 下钻到下一层级
      }
    });
  }
}

onMounted(() => {
  getactives()
  getuser()
  getDetail()
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
  /* 允许在小屏幕下换行 */
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
      /* 占满父容器 */
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
    /* 标题字体再缩小，适配小屏 */
  }

  .actives-data-div p:nth-child(2) {
    font-size: 16px;
    /* 数据字体再调整 */
  }

  .chart-container {
    margin-top: 15px;
    flex-direction: column;

    .chart {
      width: 90%;
      margin: 0 auto;
      height: 250px;
    }
  }
}
</style>
