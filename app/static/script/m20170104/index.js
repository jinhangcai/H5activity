define(function (require) {
    require('zepto.min');
    require('fastclick');
    //依赖
    var shareInit = require('share-init'),
        pageUrl = require('url-map'),
        base = require('base'),
        slotMachine = require('raffle-slotMachine'),
        Vue = require('vue');

    // fastclick代替zepto的tap,防止点透bug
    window.addEventListener('load', function () {
        FastClick.attach(document.body);
    }, false);


    var activityCode = '20170104',
        activityData = base.activityData(activityCode),
        userPhone = activityData.phone,         //用户手机号 非登录状态没有该字段，可用作判断是否登录
        sysTime = activityData.systemTime,      //系统时间
        endTime = activityData.endDate,
        startTime = activityData.startDate;     //开始时间

    var shareImg = location.protocol + '//' + location.host + $('#sharePic').val(),
        curPageUrl = window.location.href;
    var shareCurPage = {
        title: '年终狂欢，红包赚翻天，投1万最高赢200元！',
        desc: '红包大派送啦！转盘天天摇，来一场温暖的跨年！',
        url: base.switchUrl('m' + activityCode + '/index')
    };

    function twoNum(num){
        return num >= 10 ? num : '0'+num
    }
    Vue.filter('date', function (value) {
        var dateObj = new Date(value),
            year = dateObj.getFullYear(),
            month = dateObj.getMonth() + 1,
            date = dateObj.getDate(),
            hours = twoNum(dateObj.getHours()),
            minutes = twoNum(dateObj.getMinutes()),
            seconds = twoNum(dateObj.getSeconds());
        return year+'.'+month+'.'+date+' '+hours+':'+minutes+':'+seconds;
    });
//------------------------------------------------------------[页面逻辑]
    new Vue({
        el: 'body',
        data: {
            pageLoading: true,
            isLogin: !!userPhone,
            isStart: sysTime >= startTime,
            isEnd: sysTime > endTime,
            isIOSApp: base.isApp && base.isIOS(),
            alertContent: '',
            alertMask: false,
            alertTitle: false,
            raffle: null,
            raffleLock: false,
            availableTimes: 0,
            usedTimes: 0,
            btnStyle: '',
            isRunning: false,
            showRecord: false,
            recordList: []
        },
        ready: function () {
            var that = this;
            if(this.isStart && this.isLogin){
                // 初始化数据 今日 可用 和 已用次数
                $.ajax({
                    url: pageUrl.apiUrl.url + '/activity/monthlyActivity/queryData.html',
                    type: "post",
                    data: {
                        oauthToken: base.token,
                        native_view: (base.isApp ? 'app' : ''),
                        activityCode: activityCode,
                        linkCode: 'integral_lottery'
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    dataType: "json",
                    async: false,
                    success: function (data) {
                        if(data.resultCode === 1){
                            that.availableTimes = data.resultData.availableTimes;
                            that.usedTimes = data.resultData.usedTimes;
                        }else{
                            console.log(data.resultMsg);
                        }
                    }
                });

                if(!this.isEnd){

                    var $raffleCon=$('#raffleCon'),
                        $raffleLi = $raffleCon.find('li');
                    this.raffle = new slotMachine({
                        awardsArr: [$raffleLi[0], $raffleLi[1], $raffleLi[2], $raffleLi[5], $raffleLi[8], $raffleLi[7], $raffleLi[6], $raffleLi[3]],  //必填,循环的元素数组,按顺序点亮
                        cycleIndex: 2,      //选填,开始定位到目标元素之前的旋转次数,默认为'2'
                        currentClass: 'on'  // 选填,选中元素的class样式,默认为'on'
                    });
                }
            }
            this.checkLotteryStatus();
            this.pageLoading = false;

        },
        methods: {
            openRecord: function(){

                if(!this.isStart){
                    this.showRecord = true;
                    return false;
                }
                if(!this.isLogin){
                    this.goLogin();
                    return false;
                }
                var that = this;
                $.ajax({
                    url: pageUrl.apiUrl.url + '/activity/monthlyActivity/myRed.html',
                    type: "post",
                    data: {
                        oauthToken: base.token,
                        native_view: (base.isApp ? 'app' : ''),
                        activityCode: activityCode,
                        linkCode: 'integral_lottery'
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    dataType: "json",
                    async: false,
                    success: function (data) {
                        if(data.resultCode === 1){
                            that.recordList = data.resultData.list;
                        }else{
                            console.log(data.resultMsg);
                        }
                    }
                });
                this.showRecord = true;
            },
            closeRecord: function(){
                this.showRecord = false;
            },
            checkLotteryStatus: function(){
                var state = '';
                if(!this.isStart){
                    state = 'btn-notStarted'
                }else if(this.isEnd){
                    state = 'btn-end'
                }else if(!this.isLogin){
                    state = 'btn-login'
                }else if(this.availableTimes == 0){
                    if(this.usedTimes >= 10){
                        state = 'btn-noChance'
                    }else{
                        state = 'btn-noTimes'
                    }
                }else{
                    state = 'default'
                }

                if(state != 'default'){
                    this.raffleLock = true;
                    this.btnStyle = state;
                }else{
                    this.raffleLock = false;
                    this.btnStyle = '';
                }
            },
            running: function(){
                this.availableTimes -= 1;
                this.usedTimes += 1;
                this.raffleLock = true;
                this.btnStyle = 'btn-ing';
                this.isRunning = true;
            },
            stopRunning: function(){
                this.btnStyle = '';
                this.isRunning = false;
            },
            globalLottery: function(){
                if(!this.isStart){
                    return false;
                }
                if(this.isEnd){
                    return false;
                }
                if(!this.isLogin){
                    this.goLogin();
                    return false;
                }
                if(this.btnStyle == 'btn-noTimes'){
                    this.openAlert('没有可玩次数了，快去投资吧');
                    return false;
                }
                if(this.raffleLock){
                    return false;
                }
                var that = this;

                that.running();
                $.ajax({
                    url: pageUrl.apiUrl.url + '/activity/monthlyActivity/globalLottery.html',
                    type: "post",
                    data: {
                        oauthToken: base.token,
                        native_view: (base.isApp ? 'app' : ''),
                        activityCode: activityCode,
                        linkCode: 'integral_lottery'
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    dataType: "json",
                    async: false,
                    success: function (data) {
                        if(data.resultCode === 1){
                            var amount = data.resultData.amount;
                            var num = that.switchNum(amount);
                            that.raffle.run(num, function(){
                                that.openAlert('恭喜您获得'+amount+'元红包', true);
                                that.stopRunning();
                            })

                        }else{
                            var content = '';
                            switch(data.errorCode){
                                case 'TODAY_TIMES_IS_10':
                                    content = '今日已领取10次';
                                    break;
                                case 'TODAY_TIMES_IS_OVER':
                                    content = '次数已用完';
                                    break;
                                case 'TRADE_TENDER_REDPACKET_OVERDUE':
                                    content = '红包不存在';
                                    break;
                                default:
                                    content = '服务器繁忙'
                            }
                            that.openAlert(content);
                        }
                    },
                    complete: function(xhr){
                        // resultCode 为0的时候 还原按钮状态
                        //if(xhr.responseJSON.resultCode == 0){
                        //    that.checkLotteryStatus();
                        //}
                    }
                });
            },
            switchNum: function(price){
                var num = 1;
                switch(price){
                    case 50:
                        num = 0;
                        break;
                    case 20:
                        num = 1;
                        break;
                    case 5:
                        num = 2;
                        break;
                    case 150:
                        num = 3;
                        break;
                    case 100:
                        num = 4;
                        break;
                    case 30:
                        num = 5;
                        break;
                    case 200:
                        num = 6;
                        break;
                    case 10:
                        num = 7;
                        break;
                }
                return num;
            },
            closeAlert: function(){
                this.alertContent = '';
                this.alertMask = false;
                this.checkLotteryStatus();
            },
            openAlert: function(content, showTitle){
                this.alertTitle = showTitle;
                this.alertContent = content;
                this.alertMask = true;
            },
            hideShareMask: function () {
                this.shareMask = false;
            },
            goLogin: function(){
                base.gotoLogin();
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