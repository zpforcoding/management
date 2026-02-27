import { Row, Col, Card, Progress, Statistic, Timeline,Tag } from "antd"
import { BarChartOutlined, SnippetsOutlined, DollarOutlined, LaptopOutlined } from "@ant-design/icons"
import ReactECharts from "echarts-for-react"
import { getOrderSplitData } from "../../api/dashboard"
import { useEffect, useState } from "react"
import "./index.scss"
const option2 = {
    title: {
        text: '拆单数量统计(单)'
    },
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'shadow'
        }
    },
    legend: {},
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
    xAxis: {
        type: 'category',
        boundaryGap: [0, 0.01],
        data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    },
    yAxis: {
        type: 'value',

    },
    series: [
        {
            name: '拆单数量',
            type: 'bar',
            data: [270, 302, 241, 332, 223, 520, 465, 340, 421, 461, 398, 443]
        }
    ]
};
const option3 = {
    title: {
        text: '各租户拆单占比',
        left: 'center'
    },
    tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    legend: {
        type: 'scroll',
        orient: 'vertical',
        right: 10,
        top: 20,
        bottom: 20,
        textStyle: {
            fontSize: 12
        }
    },
    series: [
        {
            name: '拆单占比',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['40%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: {
                borderRadius: 10,
                borderColor: '#fff',
                borderWidth: 2
            },
            label: {
                show: true,
                formatter: '{b|{b}：}{c}单\n{per|{d}%}',
                rich: {
                    b: {
                        fontSize: 14,
                        lineHeight: 20
                    },
                    per: {
                        color: '#333',
                        fontSize: 12,
                        lineHeight: 20
                    }
                }
            },
            emphasis: {
                label: {
                    show: true,
                    fontSize: 14,
                    fontWeight: 'bold'
                }
            },
            data: [
                { value: 120, name: '豪马格演示租户(对接精品库)' },
                { value: 95, name: '意凡诺（全线版)' },
                { value: 88, name: '江门尚博定制（全线版)' },
                { value: 76, name: '清远华丽轩智能家居（全线版)' },
                { value: 65, name: '酷家乐测试租户(海外版)' },
                { value: 58, name: '酷家乐演示配置(对接精品库)' },
                { value: 52, name: '适内家居（全线版)' },
                { value: 45, name: 'AI智库(生态)' }
            ]
        }
    ]
};
function Dashboard() {
    const initalOption = {
        title: {
            text: '当日拆单统计'
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: []
        },
        grid: {
            left: '%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        toolbox: {
            feature: {
                saveAsImage: {}
            }
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: ['0：00', '4：00', '8：00', '12：00', '16：00', '20：00', '24：00']
        },
        yAxis: {
            type: 'value'
        },
        series: []
    };
    const [data, setData] = useState(initalOption)
    useEffect(() => {
        const loadData = async () => {
            const { data: apiData } = await getOrderSplitData();
            const dataList = apiData.map((item: any) => ({
                name: item.name,
                data: item.data,
                type: "line",
                stack: "Total"
            }));
            const updataOption = {
                ...data,
                legend: {
                    data: dataList.map((item: any) => item.name),
                },
                series: dataList
            }
            setData(updataOption)
        }
        // loadData()
    }, [])

    return <div className="dashboard">
        <Row gutter={16}>
            <Col span={6}>
                <Card className="clearfix">
                    <div className="fl area">
                        <h2>13479</h2>
                        <p>园区总面积(平方米)</p>
                    </div>
                    <div className="fr">
                        <BarChartOutlined className="icon" />
                    </div>
                </Card>
            </Col>
            <Col span={6}>
                <Card className="clearfix">
                    <div className="fl area">
                        <h2>8635</h2>
                        <p>总租赁面积(平方米)</p>
                    </div>
                    <div className="fr">
                        <SnippetsOutlined className="icon" style={{ color: "#81c452" }} />
                    </div>
                </Card>
            </Col>
            <Col span={6}>
                <Card className="clearfix">
                    <div className="fl area">
                        <h2>38764</h2>
                        <p>园区总产值(万元)</p>
                    </div>
                    <div className="fr">
                        <DollarOutlined className="icon" style={{ color: "#62c9cb" }} />
                    </div>
                </Card>
            </Col>
            <Col span={6}>
                <Card className="clearfix">
                    <div className="fl area">
                        <h2>2874</h2>
                        <p>入驻企业总数(家)</p>
                    </div>
                    <div className="fr">
                        <LaptopOutlined className="icon" style={{ color: "#e49362" }} />
                    </div>
                </Card>
            </Col>
        </Row>
        <Row gutter={16} className="mt">
            <Col span={12}>
                <Card title="拆单统计情况">
                    <ReactECharts option={data}></ReactECharts>
                </Card>
            </Col>
            <Col span={12}>
                <Card title="拆单月度对比">
                    <ReactECharts option={option2}></ReactECharts>
                </Card>
            </Col>
        </Row>
        <Row gutter={16} className="mt">
            <Col span={12}>
                <Card title="租户拆单占比">
                    <ReactECharts option={option3}></ReactECharts>
                </Card>
            </Col>
            <Col span={6}>
                <Card title="充电桩空闲统计">
                    <div className="wrap">
                        <Progress type="circle" percent={75} />
                        <Statistic title="总充电桩数" value={75} suffix="/ 100" className="mt"/>
                    </div>

                </Card>
            </Col>
            <Col span={6}>
                <Card title="实时车辆信息" style={{height:"406px"}}>
                    <Timeline items={[
                        {
                            children: <><Tag color="green">进场</Tag>08:24车辆 京A66666</>
                        },
                        {
                            children: <><Tag color="red">出场</Tag>09:15 车辆 京A66666  </>,
                            color: 'red',
                        },
                        {
                            children: <><Tag color="green">进场</Tag>09:22 车辆 京A23456  </>,
                        },
                        {
                            children: <><Tag color="red">出场</Tag>10:43 车辆 京A18763  </>,
                            color: 'red',
                        },
                        {
                            children: <><Tag color="green">进场</Tag>13:38 车辆 京A88888  </>,
                        },
                        {
                            children: <><Tag color="green">进场</Tag>14:46 车辆 京A23456  </>,

                        },
                    ]}/>
                        
                </Card>
            </Col>
        </Row>
    </div>
}

export default Dashboard