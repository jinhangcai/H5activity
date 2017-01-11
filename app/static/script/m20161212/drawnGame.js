define(function (require) {
    require('zepto.min');
    require('fastclick');
    //依赖
    var shareInit = require('share-init'),
        pageUrl = require('url-map'),
        base = require('base'),
        loadList = require('loadList'),
        Vue = require('vue');

    // fastclick代替zepto的tap,防止点透bug
    window.addEventListener('load', function () {
        FastClick.attach(document.body);
    }, false);


    var activityCode = '20161212',
        activityData = base.activityData(activityCode),
        userPhone = activityData.phone,         //用户手机号 非登录状态没有该字段，可用作判断是否登录
        sysTime = activityData.systemTime,      //系统时间
        endTime = activityData.endDate,      //系统时间
        startTime = activityData.startDate;     //开始时间

    var shareImg = location.protocol + '//' + location.host + $('#sharePic').val(),
        curPageUrl = window.location.href;
    var shareCurPage = {
        title: '1212剁手日，来钱庄抢钱抢大礼， 不一样的买买买！',
        desc: '快瞧，又一波剁手季的理财福利，双十二赶快接招！',
        url: base.switchUrl('m' + activityCode + '/drawnGame')
    };

//------------------------------------------------------------[页面逻辑]
    Vue.filter('countDown', function (value) {
        var l1 = value >= 10000 ? parseInt(value / 10000) : 0,
            l2 = value % 10000 >= 1000 ? parseInt(value % 10000 / 1000) : 0,
            l3 = value % 1000 >= 100 ? parseInt(value % 1000 / 100) : 0,
            l4 = value % 100 >= 10 ? parseInt(value % 100 / 10) : 0;
        return ''+l1+l2+':'+l3+l4;
    });
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
    // 对象池
    function Loop(size){
        this.size = size;
        this.init();
    }
    Loop.prototype = {
        init: function(){
            this.list = [];

            for(var i = 0; i < this.size; i++){
                this.list.push({
                    index: i,
                    status: false
                })
            }
        },
        getItem: function(){
            var lastList = this.list[this.size-1];
            if(!lastList.status){
                lastList.status = true;
                this.list.unshift(this.list.pop());
                return lastList.index;
            }else{
                return null;
            }
        },
        changeStatus: function(index){
            var _list = this.list;
            for(var i = 0; i < this.size; i++){
                if(_list[i].index == index){
                    _list[i].status = false
                }
            }
        },
        clearStatus: function(){
            for(var i = 0; i < this.size; i++){
                this.list[i].status = false
            }
        }
    };
    var packetLoopNum = base.isIOS() ? 6 : 1;
    new Vue({
        el: 'body',
        data: {
            pageLoading: false,
            isLogin: !!userPhone,
            isStart: sysTime >= startTime,
            isEnd: sysTime > endTime,
            isIOS: base.isIOS(),
            loading: false,
            isIOSApp: base.isApp && base.isIOS(),
            showAwardMask: false,
            userNumber: 1,
            usedNumber: 0,
            alertMask: false,
            alertContent: '',
            // 环节控制
            part: 1,
            newHandMask: false,
            startCountDown: 3,
            startCountDownMask: false,
            awardList: [],
            // 倒计时相关
            gameStartTime: 0,
            gameTime: 10000,
            countDownTime: 10000, // 倒计时10s
            countDownTimer: null,
            // 抽红包效果相关
            drawLock: false,
            packetLoop: new Loop(packetLoopNum),
            list: [
                {
                    unglued: false
                },{
                    unglued: false
                },{
                    unglued: false
                },{
                    unglued: false
                },{
                    unglued: false
                },{
                    unglued: false
                }
            ],
            encourageLoop: new Loop(6),
            encourageList: [
                {
                    text: '不要停',
                    unglued: false
                },{
                    text: '有红包的味道',
                    unglued: false
                },{
                    text: '红包在靠近',
                    unglued: false
                },{
                    text: '加油加油',
                    unglued: false
                },{
                    text: '坚持就是胜利',
                    unglued: false
                },{
                    text: '快了快了',
                    unglued: false
                }
            ],
            moveStatus: false,
            touchStartTime: 0,
            startY: 0,
            moveY: 0,
            endY: 0,
            timer: 0,
            style: false,
            redAmount: null,
            errorMsg: '',
            shareMask: false
        },
        ready: function () {
            var that = this;
            if(this.isStart && this.isLogin && !this.isEnd){
                $.ajax({
                    url: pageUrl.apiUrl.url + '/activity/monthlyActivity/queryDataOf20161212.html',
                    type: "post",
                    data: {
                        oauthToken: base.token,
                        native_view: (base.isApp ? 'app' : ''),
                        activityCode: activityCode
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    dataType: "json",
                    async: false,
                    success: function (data) {
                        if(data.resultCode === 1){
                            that.userNumber = data.resultData.link1_userTimes;
                            that.usedNumber = data.resultData.link1_usedTimes;
                        }else{
                            console.log(data.resultMsg);
                        }
                    }
                });
                document.addEventListener('touchmove', function(e){
                    if(!that.showAwardMask){
                        e.preventDefault();
                    }
                })
            }
            this.pageLoading = false;
        },
        methods: {
            touchStart: function(e){
                if(this.moveStatus || !this.drawLock){
                    return false;
                }
                this.touchStartTime = Date.now();
                this.moveStatus = true;
                this.startY = e.touches[0].clientY;
            },
            touchMove: function(e){
                if(!this.moveStatus || !this.drawLock){
                    return false;
                }
                e.preventDefault();
                this.endY = e.touches[0].clientY;
            },
            touchEnd: function(){
                if(!this.moveStatus || !this.drawLock){
                    return false;
                }
                if(this.endY < 10){
                    this.moveStatus = false;
                    return false;
                }
                var duration = Date.now() - this.touchStartTime,
                    move = this.startY - this.endY,
                    loopIndex = null,
                    encourageIndex = null;
                if(move > 10 && duration < 300 || move > 100){

                    if(Math.random() > 0.7){
                        encourageIndex = this.encourageLoop.getItem();
                        this.encourageList[encourageIndex].unglued = true;
                        this.hideEncourage(encourageIndex);
                    }

                    loopIndex = this.packetLoop.getItem();
                    if(loopIndex == null){
                        console.log('对象池枯竭');
                        return false;
                    }
                    this.list[loopIndex].unglued = true;
                }
                this.moveStatus = false;
                this.startY = 0;
                this.endY = 0;
            },
            transitionEnd: function(i){
                this.packetLoop.changeStatus(i);
                this.list[i].unglued = false;
            },
            hideEncourage: function(i){
                var that = this;
                setTimeout(function(){
                    that.encourageLoop.changeStatus(i);
                    that.encourageList[i].unglued = false;
                }, 1000)
            },
            clearEncourage: function(){
                this.encourageLoop.clearStatus();
                for(var i = 0, len = this.list.length; i < len; i++){
                    this.encourageList[i].unglued = false;
                }
            },
            clearLoop: function(){
                this.packetLoop.clearStatus();
                for(var i = 0, len = this.list.length; i < len; i++){
                    this.list[i].unglued = false;
                }
            },
            countDown: function(){
                var that = this;
                that.countDownTimer && clearInterval(that.countDownTimer);
                that.gameTime = that.countDownTime;
                this.countDownTimer = setInterval(function(){
                    that.gameTime -= 20;
                    if(that.gameTime <= 0){
                        that.drawLock = false;
                        that.showResult();
                        clearInterval(that.countDownTimer);
                    }
                }, 20)
            },
            play: function(){
                if(!this.isStart){
                    this.openAlert('12月8日才开始哦~');
                    return false;
                }
                if(!this.isLogin){
                    this.goLogin();
                    return false;
                }
                if(this.isEnd){
                    this.openAlert('活动结束了哦~');
                    return false;
                }
                if(this.usedNumber >= 3){
                    this.openAlert('今日机会已用完~');
                    return false;
                }
                if(this.userNumber <= 0){
                    this.openAlert('<span style="font-size:.24rem;">单笔投资满2000元</span><br>可玩:2次');
                    return false;
                }
                this.part = 2;
                this.startGame();
            },
            startGame: function(){
                if(this.usedNumber == 0){
                    this.openNewHand();
                }else{
                    this.openStartCountDown();
                }
            },
            startDraw: function(){
                this.getDrawnResult();
                this.drawLock = true;
                this.countDown();
            },
            showResult: function(){
                this.part = 3;
                this.clearLoop();
                this.clearEncourage();
            },
            getDrawnResult: function(){
                var that = this;
                that.redAmount = null;
                that.errorMsg = '';
                that.userNumber -= 1;
                that.usedNumber += 1;
                $.ajax({
                    url: pageUrl.apiUrl.url + '/activity/monthlyActivity/receiveRedOf20161212.html',
                    type: "post",
                    data: {
                        oauthToken: base.token,
                        native_view: (base.isApp ? 'app' : ''),
                        activityCode: activityCode
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    dataType: "json",
                    success: function (data) {
                        if(data.resultCode === 1){
                            that.userNumber = data.resultData.userTimes;
                            that.redAmount = data.resultData.redAmount;
                        }else{
                            that.errorMsg = data.resultMsg;
                        }
                    }
                });
            },
            openStartCountDown: function(){
                this.startCountDown = 3;
                this.startCountDownMask = true;
                var that = this;
                var startCountDownTimer = setInterval(function(){
                    if(that.startCountDown == 1){
                        clearInterval(startCountDownTimer);
                        that.startCountDownMask = false;
                        that.startDraw();
                    }
                    that.startCountDown -= 1;
                }, 1000)
            },
            openNewHand: function(){
                this.newHandMask = true;
            },
            closeNewHand: function(){
                this.newHandMask = false;
                this.openStartCountDown();
            },
            showAward: function(){
                if(!this.isStart){
                    this.openAlert('12月8日才开始哦~');
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
                        linkCode: 'click_get_redpacket'
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    dataType: "json",
                    async: false,
                    success: function (data) {
                        if(data.resultCode === 1){
                            that.awardList = data.resultData.list;
                        }else{
                            console.log(data.resultMsg);
                        }
                    }
                });
                this.showAwardMask = true;
            },
            hideAwardMask: function(){
                this.showAwardMask = false;
            },
            closeAlert: function(){
                this.alertContent = '';
                this.alertMask = false;
            },
            openAlert: function(content){
                this.alertContent = content;
                this.alertMask = true;
            },
            share: function(){// 在app下直接调出分享控件
                if (base.isApp) {
                    base.hybridProtocol({
                        tagName: 'getShare',
                        data: {
                            dataUrl: "",
                            imgUrl: shareImg,             //分享图片
                            link: shareCurPage.url,       //分享链接
                            title: shareCurPage.title,    //分享标题
                            desc: shareCurPage.desc,      //分享文案
                            type: ""
                        },
                        success: function (data) {
                        },
                        error: function (data) {
                        }
                    });
                }else{
                    this.shareMask = true
                }
            },
            hideShareMask: function () {
                this.shareMask = false;
            },
            goLogin: function(){
                base.gotoLogin();
            },
            goIndex: function(){
                base.checkAppEvent(base.switchUrl('m20161212/index'), '12.12狂派大礼 全民疯抢');
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