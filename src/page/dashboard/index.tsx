import { Row, Col, Card, Progress, Statistic, Timeline,Tag } from "antd"
import { UserOutlined, ShoppingCartOutlined, BuildOutlined, AreaChartOutlined } from "@ant-design/icons"
import ReactECharts from "echarts-for-react"
import { getOrderSplitData } from "../../api/dashboard"
import { useEffect, useState } from "react"
import "./index.scss"
const option2 = {
    title: {
        text: '订单数量统计(单)'
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
            name: '订单数量',
            type: 'bar',
            data: [270, 302, 241, 332, 223, 520, 465, 340, 421, 461, 398, 443]
        }
    ]
};
const option3 = {
    title: {
        text: '用户订单占比',
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
            name: '订单占比',
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
            text: '当日订单统计'
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: ['订单数量']
        },
        grid: {
            left: '3%',
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
        series: [
            {
                name: '订单数量',
                type: 'line',
                stack: 'Total',
                data: [12, 18, 35, 42, 38, 28, 15],
                smooth: true,
                itemStyle: {
                    color: '#1890ff'
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [{
                            offset: 0, color: 'rgba(24, 144, 255, 0.3)'
                        }, {
                            offset: 1, color: 'rgba(24, 144, 255, 0.05)'
                        }]
                    }
                }
            }
        ]
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
                        <h2>37</h2>
                        <p>用户总数</p>
                    </div>
                    <div className="fr">
                        <UserOutlined className="icon" />
                    </div>
                </Card>
            </Col>
            <Col span={6}>
                <Card className="clearfix">
                    <div className="fl area">
                        <h2>9443</h2>
                        <p>订单数</p>
                    </div>
                    <div className="fr">
                        <ShoppingCartOutlined className="icon" style={{ color: "#81c452" }} />
                    </div>
                </Card>
            </Col>
            <Col span={6}>
                <Card className="clearfix">
                    <div className="fl area">
                        <h2>2.12</h2>
                        <p>工件数(百万)</p>
                    </div>
                    <div className="fr">
                        <BuildOutlined className="icon" style={{ color: "#62c9cb" }} />
                    </div>
                </Card>
            </Col>
            <Col span={6}>
                <Card className="clearfix">
                    <div className="fl area">
                        <h2>598.20</h2>
                        <p>工件面积(m²)(千)</p>
                    </div>
                    <div className="fr">
                        <AreaChartOutlined className="icon" style={{ color: "#e49362" }} />
                    </div>
                </Card>
            </Col>
        </Row>
        <Row gutter={16} className="mt">
            <Col span={12}>
                <Card title="订单统计情况">
                    <ReactECharts option={data}></ReactECharts>
                </Card>
            </Col>
            <Col span={12}>
                <Card title="订单月度对比">
                    <ReactECharts option={option2}></ReactECharts>
                </Card>
            </Col>
        </Row>
        <Row gutter={16} className="mt">
            <Col span={12}>
                <Card title="用户订单占比">
                    <ReactECharts option={option3}></ReactECharts>
                </Card>
            </Col>
            <Col span={6}>
                <Card title="活跃用户占比">
                    <div className="wrap">
                        <Progress type="circle" percent={68} />
                        <Statistic title="活跃用户数" value={37} suffix="/ 55" className="mt"/>
                    </div>
                </Card>
            </Col>
            <Col span={6}>
                <Card title="活跃用户趋势" style={{height:"406px"}}>
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