define(function (require) {
    require('zepto.min');
    require('fastclick');
    //依赖
    var shareInit = require('share-init'),
        pageUrl = require('url-map'),
        base = require('base'),
        Vue = require('vue');

    // fastclick代替zepto的tap,防止点透bug
    window.addEventListener('load', function () {
        FastClick.attach(document.body);
    }, false);


    var activityCode = '20161101',
        activityData = base.activityData(activityCode),
        userPhone = activityData.phone,         //用户手机号 非登录状态没有该字段，可用作判断是否登录
        sysTime = activityData.systemTime,      //系统时间
        startTime = activityData.startDate;     //开始时间

    var shareImg = location.protocol + '//' + location.host + $('#sharePic').val(),
        curPageUrl = window.location.href;
    var shareCurPage = {
        title: '还嫌工资不够花？该试试工资拯救计划了！',
        desc: '工资低不要紧，钱庄每月给你发拯救资金！',
        url: base.switchUrl('m' + activityCode + '/index')
    };

//------------------------------------------------------------[页面逻辑]
    Vue.filter('date', function (value) {
        var date = new Date(value),
            year = date.getFullYear(),
            month = date.getMonth() + 1;
        return year+'年'+month+'月';
    });
    new Vue({
        el: 'body',
        data: {
            pageLoading: true,
            isLogin: !!userPhone,
            isStart: sysTime >= startTime,
            list: [],
            dataListLen: 0,
            startTime: startTime,
            isIOSApp: base.isApp && base.isIOS()
        },
        ready: function () {
            var that = this;

            if(that.isStart && that.isLogin){

                var _list = [],
                    sysDate = new Date(sysTime),
                    sysYear = sysDate.getFullYear(),
                    sysMonth = sysDate.getMonth(),
                    startDate = new Date(startTime),
                    startYear = startDate.getFullYear(),
                    startMonth = startDate.getMonth(),
                    lastDate = new Date(),
                    lastYear = sysYear,
                    lastMonth = sysMonth - 1,
                    beforeLastDate = new Date(),
                    beforeLastYear = sysYear,
                    beforeLastMonth = sysMonth - 2;

                switch (sysMonth){
                    case 0:
                        lastYear = sysYear -1;
                        lastMonth = 11;
                        beforeLastYear = sysYear -1;
                        beforeLastMonth = 10;
                        break;
                    case 1:
                        lastYear = sysYear;
                        lastMonth = 0;
                        beforeLastYear = sysYear -1;
                        beforeLastMonth = 11;
                        break;
                    default:
                        break;
                }
                lastDate.setFullYear(lastYear);
                lastDate.setMonth(lastMonth);
                beforeLastDate.setFullYear(beforeLastYear);
                beforeLastDate.setMonth(beforeLastMonth);

                if(sysMonth + (sysYear - startYear) * 12 - startMonth > 0){
                    _list = [
                        {"currentMonthAdd":0,"currentMonthSum":0,"date":lastDate.getTime(),"redAmount":0,"yearMonth":lastYear+"-"+lastMonth},
                        {"currentMonthAdd":0,"currentMonthSum":0,"date":beforeLastDate.getTime(),"redAmount":0,"yearMonth":beforeLastYear+"-"+beforeLastMonth}
                    ]
                }else{
                    _list = [
                        {"currentMonthAdd":0,"currentMonthSum":0,"date":lastDate.getTime(),"redAmount":0,"yearMonth":lastYear+"-"+lastMonth}
                    ]
                }

                $.ajax({
                    url: pageUrl.apiUrl.url + '/activity/monthlyActivity/queryDataOfSaveWages.html',
                    type: "post",
                    data: {
                        oauthToken: base.token,
                        native_view: (base.isApp ? 'app' : ''),
                        activityCode: activityCode,
                        pernum: 2,
                        currentPage: 1
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    async: false,
                    dataType: "json",
                    success: function (data) {
                        if(data.resultCode === 1){
                            var list = data.resultData.list,
                                len = list.length;
                            that.dataListLen = len;
                            if(len > 0){
                                for(var i = 0; i<len; i++){
                                    var _listDate = new Date(list[i].date),
                                        _yearMonth = _listDate.getFullYear() + '-' + _listDate.getMonth();
                                    for(var j = 0,_len = _list.length; j<_len; j++)
                                    if(_yearMonth == _list[j].yearMonth){
                                        _list[j] = list[i]
                                    }
                                }
                            }
                            that.list = _list;
                        }else{
                            console.log(data.resultMsg)
                        }
                    }
                });
            }

            this.pageLoading = false;

        },
        methods: {
            goLogin: function(){
                base.gotoLogin();
            },
            goHistory: function(){
                base.checkAppEvent(base.switchUrl('m20161101/history'), '历史记录')
            },
            goInvest: function(){
                base.gotoProductList();
            }
        }
    });

//------------------------------------------------------------[分享]

    function shareEvent() {
        shareInit({
            isApp: base.isApp,
            dataUrl: "",
            imgUrl: shareImg,
            shareLink: shareCurPage.url,
            curLink: curPageUrl,
            title: shareCurPage.title,
            desc: shareCurPage.desc,
            type: ""
        });
    }

    shareEvent();
});