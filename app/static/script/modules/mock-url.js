/**
 * Created by Administrator on 2015/11/2.
 */
define(function (require) {
    require('mock');
    var pageUrl = require('url-map');
    Mock.mock(pageUrl.h5CheckLogin.url, {
        "resultCode": 1,
        "resultData": {
            "bankCardStatus": 0,
            "cardID": "3425**********0018",
            "newHandStatus": 1,
            "payPwdStatus": 1,
            "phone": "18857874159",
            "realName": "王*俊",
            "realNameStatus": 1
        },
        "resultMsg": "系统返回消息"
    });
    // app检查登陆
    Mock.mock(pageUrl.appCheckLogin.url, {
        resultCode: 1
    });
    // 活动初始数据
    Mock.mock(pageUrl.activityData.url, {
        resultCode: 1,
        resultData: {
            endDate: 1478053911568,
            allLinkTime:[
                {
                    endTime:1471535999000,
                    id:39,
                    startTime:1471449600000
                },
                {
                    endTime:1471535999000,
                    id:39,
                    startTime:1471449600000
                },
                {
                    endTime:1479969886000,
                    id:39,
                    startTime:1478153267435
                }
            ],
            inviteCode: "4qqq",
            phone: "187****1811",
            startDate: 1477967511568,
            systemTime: 1478155509472
        }
    });
    Mock.mock(pageUrl.lotteryTimes.url, {
        resultCode: 1,
        resultData: {
            lotteryHistory: [
                {prize: '之'},
                {prize: '理财'}
            ],
            times: 10,
            gotTimes: 0,
            tokenStr: "1447304068896"
        }
    });
    //初始化
    Mock.mock(pageUrl.totalTender.url, {
        resultCode: 1,
        resultData: {
            code: '理',
            times: 10,
            gotTimes: 0,
            "investment|1": [1, 2, 3, 4, 5, 6, 7],
            "money|1": [100, 50, 10],
            tokenStr: "1447304068896"
        }
    });
    //分享
    Mock.mock(pageUrl.userShare.url, {
        resultCode: 1,
        resultData: 'dfasfsadfsaf'
    });
    // 抽奖接口
    Mock.mock(pageUrl.userLottery.url, {
        resultCode: 1,
        resultData: {
            'code|5-30': 1,
            times: 0,
            'gotTimes|1-14': 1,
            tokenStr: "1447304068896"
        }
    });
    //公共抽奖记录
    Mock.mock(pageUrl.lotteryShow.url, {
        resultCode: 1,
        'resultData|1-5': [{'phone|1': ['188****4159','138****4121','136****4431','155****8888'], prize: 10, 'point|5-30': 1}]
    });
    //抽奖初始化数据
    Mock.mock(pageUrl.userLotteryTimes.url, {
        resultCode: 1,
        'resultData': {
            'times|1-10': 1,
            'gotTimes|10-20': 1,
            'tokenStr': 'dsafwrfsdvsdaes'
        }
    });
    //抽奖次数细分
    Mock.mock(pageUrl.chanceHistory.url, {
        resultCode: 1,
        'resultData': {
            "shareGot|0-3": 1,
            "tenderGot|0-10": 1
        }
    });
    // 中奖记录
    Mock.mock(pageUrl.myPrice.url, {
        "resultCode": 1,
        "resultData": {
            "giftList": [],
            "lotteryWinList|5-30": [{
                "addTime": 1447171322000,
                "phone": "188****4159",
                "prize|1": ["12元红包", "无"],
                "point|5-30":1
            }]
        },
        "resultMsg": ""
    });
    // 我的奖品
    Mock.mock(pageUrl.pricecenter.url, {
        "1元红包": 1,
        "5元红包": 1
    });
    // 检查是否有默认地址
    Mock.mock(pageUrl.checkAddress.url, {
        'resultCode|0-3': 1,
        resultData: {
            name: '王英俊',
            tel: '18857874159',
            province: '浙江省',
            city: '杭州',
            address: "测试地址"
        },
        resultMsg: '服务器返回信息'
    });
    // 确认收货地址
    Mock.mock(pageUrl.ajaxActivityAddressM.url, {
        resultCode: 1,
        resultData: {
            name: '王英俊',
            tel: '18857874159',
            province: '浙江省',
            city: '杭州',
            address: "测试地址"
        },
        resultMsg: '服务器返回信息'
    });
    // 省份数据
    Mock.mock(pageUrl.getProvinceList.url, {
        "resultCode": 1,
        "resultData": [{"id": 1, "name": "北京", "nid": "beijing", "order": 10, "pid": 0}, {
            "id": 21,
            "name": "天津",
            "nid": "tianjin",
            "order": 10,
            "pid": 0
        }, {"id": 40, "name": "上海", "nid": "shanghai", "order": 10, "pid": 0}, {
            "id": 61,
            "name": "重庆",
            "nid": "zhongqing",
            "order": 10,
            "pid": 0
        }, {"id": 102, "name": "河北省", "nid": "hebeisheng", "order": 10, "pid": 0}, {
            "id": 297,
            "name": "山西省",
            "nid": "shanxisheng",
            "order": 10,
            "pid": 0
        }, {"id": 439, "name": "内蒙古区", "nid": "neimengguqu", "order": 10, "pid": 0}, {
            "id": 561,
            "name": "辽宁省",
            "nid": "liaoningsheng",
            "order": 10,
            "pid": 0
        }, {"id": 690, "name": "吉林省", "nid": "jilinsheng", "order": 10, "pid": 0}, {
            "id": 768,
            "name": "黑龙江省",
            "nid": "heilongjiangsheng",
            "order": 10,
            "pid": 0
        }, {"id": 924, "name": "江苏省", "nid": "jiangsusheng", "order": 10, "pid": 0}, {
            "id": 1057,
            "name": "浙江省",
            "nid": "zhejiangsheng",
            "order": 11,
            "pid": 0
        }, {"id": 1170, "name": "安徽省", "nid": "anhuisheng", "order": 10, "pid": 0}, {
            "id": 1310,
            "name": "福建省",
            "nid": "fujiansheng",
            "order": 10,
            "pid": 0
        }, {"id": 1414, "name": "江西省", "nid": "jiangxisheng", "order": 10, "pid": 0}, {
            "id": 1536,
            "name": "山东省",
            "nid": "shandongsheng",
            "order": 10,
            "pid": 0
        }, {"id": 1711, "name": "河南省", "nid": "henansheng", "order": 10, "pid": 0}, {
            "id": 1905,
            "name": "湖北省",
            "nid": "hubeisheng",
            "order": 10,
            "pid": 0
        }, {"id": 2034, "name": "湖南省", "nid": "hunansheng", "order": 10, "pid": 0}, {
            "id": 2184,
            "name": "广东省",
            "nid": "guangdongsheng",
            "order": 10,
            "pid": 0
        }, {"id": 2403, "name": "广西区", "nid": "guangxiqu", "order": 10, "pid": 0}, {
            "id": 2541,
            "name": "海南省",
            "nid": "hainansheng",
            "order": 10,
            "pid": 0
        }, {"id": 2570, "name": "四川省", "nid": "sichuansheng", "order": 10, "pid": 0}, {
            "id": 2791,
            "name": "贵州省",
            "nid": "guizhousheng",
            "order": 10,
            "pid": 0
        }, {"id": 2892, "name": "云南省", "nid": "yunnansheng", "order": 10, "pid": 0}, {
            "id": 3046,
            "name": "西藏区",
            "nid": "xicangqu",
            "order": 10,
            "pid": 0
        }, {"id": 3128, "name": "陕西省", "nid": "shanxisheng", "order": 10, "pid": 0}, {
            "id": 3256,
            "name": "甘肃省",
            "nid": "gansusheng",
            "order": 10,
            "pid": 0
        }, {"id": 3369, "name": "青海省", "nid": "qinghaisheng", "order": 10, "pid": 0}, {
            "id": 3422,
            "name": "宁夏区",
            "nid": "ningxiaqu",
            "order": 10,
            "pid": 0
        }, {"id": 3454, "name": "新疆区", "nid": "xinjiangqu", "order": 10, "pid": 0}, {
            "id": 3571,
            "name": "台湾省",
            "nid": "taiwansheng",
            "order": 10,
            "pid": 0
        }, {"id": 3573, "name": "香港特区", "nid": "xianggangtequ", "order": 10, "pid": 0}, {
            "id": 3575,
            "name": "澳门特区",
            "nid": "aomentequ",
            "order": 10,
            "pid": 0
        }],
        "resultMsg": "服务器返回信息"
    });
    // 省份对应城市数据
    Mock.mock(pageUrl.showArea.url, [
        {"id": 925, "name": "杭州", "nid": "nanjing", "order": 10, "pid": 924}, {
            "id": 940,
            "name": "无锡",
            "nid": "wuxi",
            "order": 10,
            "pid": 924
        }, {"id": 950, "name": "徐州", "nid": "xuzhou", "order": 10, "pid": 924}, {
            "id": 963,
            "name": "常州",
            "nid": "changzhou",
            "order": 10,
            "pid": 924
        }, {"id": 972, "name": "苏州", "nid": "suzhou", "order": 10, "pid": 924}, {
            "id": 985,
            "name": "南通",
            "nid": "nantong",
            "order": 10,
            "pid": 924
        }, {"id": 995, "name": "连云港", "nid": "lianyungang", "order": 10, "pid": 924}, {
            "id": 1004,
            "name": "淮安",
            "nid": "huaian",
            "order": 10,
            "pid": 924
        }, {"id": 1014, "name": "盐城", "nid": "yancheng", "order": 10, "pid": 924}, {
            "id": 1025,
            "name": "扬州",
            "nid": "yangzhou",
            "order": 10,
            "pid": 924
        }, {"id": 1034, "name": "镇江", "nid": "zhenjiang", "order": 10, "pid": 924}, {
            "id": 1042,
            "name": "泰州",
            "nid": "taizhou",
            "order": 10,
            "pid": 924
        }, {"id": 1050, "name": "宿迁", "nid": "suqian", "order": 10, "pid": 924}
    ]);
    // 通过手机号码获取 信息
    Mock.mock(pageUrl.phoneDate.url, {
        resultCode: 1,
        resultData: {
            endDate: 1447862399000,
            inviteCode: "4qqq",
            phone: "18857874159",
            startDate: 1447171200000,
            systemTime: 1447505542995,
            totalNum: 2,
            hasNum: 1
        },
        resultMsg: '服务器返回信息'
    });
    // 刮刮卡获奖信息
    Mock.mock(pageUrl.scratchDate.url, {
        resultCode: 1,
        resultData: {
            prize: '5元红包',
            totalNum: 2,
            hasNum: 1
        },
        resultMsg: '服务器返回信息'
    });

    // 获取特定活动的红包
    Mock.mock(pageUrl.clickGetRedpacket.url, {
        resultCode: 1,
        resultData: {
            money:10,
            isReceived:1
        },
        resultMsg: '服务器返回信息'
    });

    // 活动参与人数
    Mock.mock(pageUrl.countOlympicPerson.url, {
        resultCode: 1,
        resultData: {
            num:10
        },
        resultMsg: '服务器返回信息'
    });
    // 活动参与人数
    Mock.mock(pageUrl.queryAdventureData.url, {
        "resultCode":1,
        "resultData":{
            "teamAll|1-100":1,
            "personalAll|1-100":1
        },
        "resultMsg":""
    });
    // 20160918钱庄日交易额
    Mock.mock(pageUrl.apiUrl.url + '/activity/monthlyActivity/queryDataOf20160918.html', {
        "resultCode":1,
        "resultData":{
            "personalAll|1-100":1,
            "qzAll|1-100":1
        },
        "resultMsg":""
    });
    // 20161018数据部分
    Mock.mock(pageUrl.apiUrl.url + '/activity/monthlyActivity/queryDataOf20161018.html', {
        "resultCode":1,
        "resultData":{
            "all1820":0,
            "inviteNum":488,
            "statusList":[false,false,true,false,false,false],
            "all18":0
        },
        "resultMsg":""
    });
    // 20161018领取红包
    Mock.mock(pageUrl.apiUrl.url + '/activity/monthlyActivity/receiveRedOf20161018.html', {
        "resultCode":1,
        "resultData":{
        },
        "resultMsg":""
    });
    // 20161101数据部分
    Mock.mock(pageUrl.apiUrl.url + '/activity/monthlyActivity/queryDataOfSaveWages.html', {
        "resultCode":1,
        "resultData":{
            "page":{
                "currentPage":1,
                "end":3,
                "pages":20,
                "pernum":10,
                "start":0,
                "total":3
            },
            "list":[
                {"currentMonthAdd":40,"currentMonthSum":8000,"date":1477497600000,"redAmount":4},
                {"currentMonthAdd":500,"currentMonthSum":20000,"date":1477032983638,"redAmount":10},
                {"currentMonthAdd":-50,"currentMonthSum":10000,"date":1472659200000,"redAmount":5}
            ]},
            "resultMsg":""
        }
    );
    //请求生成唯一分享码接口
    Mock.mock(pageUrl.createShareCode.url, {
        "resultCode":1,
        "resultData":{
            "shareBrand":"TNVV"
        },
        "resultMsg":""
    });
    //点击分享链接接口
    Mock.mock(pageUrl.clickShareLink.url, {
        "resultCode":1,
        "resultMsg":""
    });
    Mock.mock(pageUrl.openRed.url, {
        "resultCode":1,
        'resultData':{
            redAmount:10,
            isTodayShared:false
        },
        "resultMsg":""
    });
    //页面初始化次数查询
    Mock.mock(pageUrl.queryInitParamsOfLinkOne.url, {
        "resultCode":1,
        'resultData':{
            isTodayRedTimesOver:false,
            isTodayUserTimesOver:false,
        },
        "resultMsg":""
    });
    //页面初始化次数查询
    Mock.mock(pageUrl.queryDataOfLink4.url, {
        "resultCode":1,
        'resultData':{
           'personalAll':123123
        },
        "resultMsg":""
    });
    // 20161111 获取PK次数
    Mock.mock(pageUrl.apiUrl.url + '/activity/doubleEleven/queryRemainTimes.html', {
            "resultCode":1,
            "resultData": 5,
            "resultMsg":""
        }
    );
    // 20161111 获取PK
    Mock.mock(pageUrl.apiUrl.url + '/activity/doubleEleven/pk.html', {
            "resultCode":1,
            "resultData": {
                pkResult: 'win',
                remainTimes: 3
            },
            "resultMsg":""
        }
    );
    // 20161111 最嗨11分
    Mock.mock(pageUrl.apiUrl.url + '/activity/doubleEleven/openCard.html', {
            "resultCode":1,
            "resultData": {
                "result": "girl",
                "remainTimes":"2",
                "hasUsedTimes":"0"
            },
            "resultMsg":""
        }
    );
    // 20161111 获取我的红包列表
    Mock.mock(pageUrl.apiUrl.url + '/activity/doubleEleven/myRed.html', {
            "resultCode":1,
            "resultData": {
                "list|1-10":[
                    {
                        "addTime": 1477032983638,
                        "point":1,
                        "type": "red_1"
                    }
                ]
            },
            "resultMsg":""
        }
    );
    //20161118活动
    Mock.mock(pageUrl.queryDataOf20161118.url, {
        "resultCode":1,
        'resultData':{
            'personalAll':469000
        },
        "resultMsg":""
    });
    Mock.mock(pageUrl.queryInitParamsOf20161118.url, {
        "resultCode":1,
        'resultData':{
            'personalAll':469000,
            'redFlag':false,
            'couponFlag':'noReceived',
            'couponAmount':0,
            'redAmount':0
        },
        "resultMsg":""
    });
    Mock.mock(pageUrl.getGiftOf20161118.url, {
        "resultCode":1,
        'resultData':{
            'couponAmount':1,
            'redAmount':'8'
        },
        "resultMsg":""
    });
    // 20161212 双十二初始化数据接口
    Mock.mock(pageUrl.apiUrl.url + '/activity/monthlyActivity/queryDataOf20161212.html', {
            "resultCode":1,
            "resultData": {
                "link1_usedTimes": 1,
                "link1_userTimes": 2,
                "link2_totalTimes": 2,
                "link3_personalAll": 5164357,
                "link3_list|12": [
                    {
                        "phone": 18857874159,
                        "total": 1564654564
                    }
                ]
            },
            "resultMsg":""
        }
    );
    // 20161212 领红包接口
    Mock.mock(pageUrl.apiUrl.url + '/activity/monthlyActivity/receiveRedOf20161212.html', {
            "resultCode":1,
            "resultData": {
                "redAmount": 1
            },
            "resultMsg":""
        }
    );
    // 20161212 领加息券接口
    Mock.mock(pageUrl.apiUrl.url + '/activity/monthlyActivity/receiveCouponOf20161212.html', {
            "resultCode":1,
            "errorCode": "NO_AVAILABLE_TENDER", // （NO_AVAILABLE_TENDER:没有投资大于5000; TODAY_CHANCE_IS_OVER:今日已领取; TOTAL_CHANCE_IS_OVER:总次数已用完）
            "resultData": '',
            "resultMsg":""
        }
    );
    // 20161212 我的红包接口
    Mock.mock(pageUrl.apiUrl.url + '/activity/monthlyActivity/myRed.html', {
            "resultCode":1,
            "resultData": {
                "list|1-10":[
                    {
                        "addTime": 1477032983638,
                        "point":1,
                        "type": "red_1"
                    }
                ]
            },
            "resultMsg":""
        }
    );
    // 20161218 个人累计收益/个人可用次数
    Mock.mock(pageUrl.apiUrl.url + '/activity/monthlyActivity/queryData.html', {
            "resultCode":1,
            "resultData": {
                "interest":"300.44",
                "availableTimes": "2"
            },
            "resultMsg":""
        }
    );
    // 20161218 钱庄日真情回馈/财运红包滚滚来
    Mock.mock(pageUrl.apiUrl.url + '/activity/monthlyActivity/receiveRed.html', {
        "resultCode":1,
        //resultCode == 1成功
        //resultCode == 0失败  errorCode=CHANCE_IS_OVER 机会用完了
        //errorCode=TENDER_NOT_ENOUGH 投资不够
        //errorCode=PARAM_NOT_RIGHT 参数不正确
        "resultData":{
            "times":"3",
            "total":"10000",
            "redAmount":"5",
            "isReceived":"true"
        },
        "resultMsg":""}
    );
    // 20161218 爆款加息
    Mock.mock(pageUrl.apiUrl.url + '/activity/monthlyActivity/receiveCoupon.html', {
        "resultCode":1,
        //resultCode == 1成功
        //resultCode == 0失败  errorCode=HAS_RECEIVED 已领过
        //errorCode=TENDER_NOT_ENOUGH 投资不够
        "resultData":{
        },
        "resultMsg":""}
    );
    //20161224 分享彩蛋初始化接口（今日是否领取）
    Mock.mock(pageUrl.apiUrl.url + '/activity/monthlyActivity/queryData.html', {
        "resultCode":1,
        resultData:{
            flag:0.2,    //falg ==empty 未领取      falg !=empty 已领取(返回具体金额)
            availableTimes: 3,
            usedTimes: 3,
            receivedTimes: 1,
            isReceived: 0,
            isShared: false,
            "103":"28.0",
            "102":"18.0",
            "101":"8.0",
            "investSum":138888
        }
    });
    //#投资彩蛋领取礼品接口
    Mock.mock(pageUrl.apiUrl.url + '/activity/share/receiveGift.html', {
        resultData:{
            resultCode:1,
            errorCode:'TENDER_NOT_ENOUGH'
        }
    });

    //20170104 投资彩蛋领取礼品接口
    Mock.mock(pageUrl.apiUrl.url + '/activity/monthlyActivity/globalLottery.html', {
        "resultCode":1,
        //resultData.resultCode = 1成功     resultData.amount（中奖金额）
        //resultData.resultCode = 0失败
        //errorCode(TODAY_TIMES_IS_10:今日已领取10次   TODAY_TIMES_IS_OVER：次数已用完   TRADE_TENDER_REDPACKET_OVERDUE：红包不存在
        "resultData":{
            amount: 200
        },
        "resultMsg":""
    });
    //20170125点灯
    Mock.mock(pageUrl.apiUrl.url + '/activity/monthlyActivity/receiveGift.html', {
        resultCode:1,
        resultData:{
            result: '18元抵扣红包'
        },
        errorCode:'TENDER_NOT_ENOUGH'
    });
    return pageUrl;
});