define(function (require) {
    require('zepto.min');
    require('fastclick');

    require('shake');
    //依赖
    var shareInit = require('share-init'),
        pageUrl = require('url-map'),
        cookie = require('cookie'),
        base = require('base'),
        Vue = require('vue');

    // fastclick代替zepto的tap,防止点透bug
    window.addEventListener('load', function () {
        FastClick.attach(document.body);
    }, false);


    var activityCode = '20160718',
        activityData = base.activityData(activityCode),
        userPhone = activityData.phone,         //用户手机号 非登录状态没有该字段，可用作判断是否登录
        sysTime = activityData.systemTime,      //系统时间
        startTime = activityData.startDate,     //开始时间
        endTime = startTime + 6*86400000,
        userShareBrand = '',
        checkShareBrand = base.hrefParameter.get('shareBrand'),
        isGreedyDay = sysTime >= startTime + 3*86400000 && sysTime < startTime + 4*86400000;


    // cookie 存入活动代码 用于注册用户获取渠道来源
    cookie.setCookie('activityCode', activityCode, 2592000000, '.qian360.com', '/');

    var shareImg = location.protocol + '//' + location.host + $('#sharePic').val(),
        curPageUrl = window.location.href;
    var shareCurPage = {
        title: '最牛的摇骰子游戏，摇出“5个1”，惊喜好礼火爆来袭~',
        desc: '想做大赢家就来幸运骰子摇一摇，看到的朋友都忍不住尝试了！',
        url: base.switchUrl('m' + activityCode + '/index')
    };


    // 摇一摇音乐
    var shakeSound = new buzz.sound(globalMusic[0], {
        preload: 'metadata',
        autoplay: false,
        volume: 100,
        loop: false
    });
    // 摇出结果音乐
    var resultSound = new buzz.sound(globalMusic[1], {
        preload: 'metadata',
        autoplay: false,
        volume: 100,
        loop: false
    });

    var myShakeEvent = new Shake({
        threshold: 15
    });
    myShakeEvent.start();
//------------------------------------------------------------[页面逻辑]
    new Vue({
        el: 'body',
        data: {
            pageLoading: true,
            isLogin: !!userPhone,
            isStart: sysTime >= startTime,
            isEnd: sysTime > endTime,
            isGreedyDay: isGreedyDay,
            investMax: 10,
            showUserState: false,
            alertState: false,
            tabNum: 1,
            chanceNum: 0,
            pointTotal: 0,
            shareNum: 0,
            investNum: 0,
            lotteryShowData: [],
            pointList: [
                {num: 5},
                {num: 3},
                {num: 6},
                {num: 1},
                {num: 4}
            ],
            isNotSnake: true,
            isSnake: false,
            isSnakeLock: false,
            isShowResult: false,
            snakeTimer: null,
            tokenStr: '',
            resultText: '很遗憾，没有中奖',
            alertText: '',
            classObject: {
                'wobble': false,
                'animated': false
            },
            shareMask: false
        },
        computed: {
            hasChance: function(){
                return this.chanceNum > 0;
            }
        },
        ready: function () {
            var that = this;
            window.addEventListener('shake', that.shake, false);
            this.pageLoading = false;
            if(isGreedyDay){
                this.investMax = '不限';
                this.tabNum = 2;
            }
            if(!this.isStart){
                return false;
            }
            // 公共中奖列表
            $.ajax({
                url: pageUrl.lotteryShow.url,
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
                        var dataLength = data.resultData.length;
                        if(dataLength > 0){
                            that.lotteryShowData = data.resultData;
                            setTimeout(rollShow, 10);
                        }

                    }
                }
            });

            if(!this.isLogin){
                return false;
            }
            // 抽奖初始化数据
            if(!this.isEnd){
                $.ajax({
                    url: pageUrl.userLotteryTimes.url,
                    type: "post",
                    data: {
                        oauthToken: base.token,
                        native_view: (base.isApp ? 'app' : ''),
                        activityCode: activityCode,
                        lotteryType: 'lottery'
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    dataType: "json",
                    async: false,
                    success: function (data) {
                        if (data.resultCode == 1) {
                            that.chanceNum = data.resultData.times;
                            that.tokenStr = data.resultData.tokenStr;
                        }
                    }
                });
            }
            // 抽奖次数细分数据
            $.ajax({
                url: pageUrl.chanceHistory.url,
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
                    if (data.resultCode == 1) {
                        that.shareNum = data.resultData.shareGot;
                        that.investNum = data.resultData.tenderGot;
                    }
                }
            });
            // 获取分享码
            $.ajax({
                url: pageUrl.userShare.url,
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
                    if (data.resultCode == 1) {
                        userShareBrand = data.resultData;
                        shareEvent();
                    }
                }
            });
        },
        methods: {
            goonSnake: function(){
                this.isNotSnake = true;
                this.isSnakeLock = false;
                this.isShowResult = false;
            },
            tab: function(num){
                this.tabNum = num;
            },
            shake: function(){
                // 摇一摇状态锁定
                if(this.isSnakeLock){
                    return false;
                }

                if(!this.isSnake){ // 不在摇动中
                    // 活动未开始
                    if(!this.isStart){
                        this.alertText = '活动未开始';
                        this.alertState = true;
                        return false;
                    }
                    // 活动未开始
                    if(this.isEnd){
                        this.alertText = '活动已结束';
                        this.alertState = true;
                        return false;
                    }

                    // 未登陆
                    if(!this.isLogin){
                        base.gotoLogin();
                        return false;
                    }

                    // 今日机会已用完 且不是 18号
                    if((this.shareNum + this.investNum) === 13 && this.chanceNum === 0 && !this.isGreedyDay){
                        this.alertText = '今日机会已用完<br>明天再来吧~';
                        this.alertState = true;
                        return false;
                    }
                    if(!this.hasChance){
                        this.showUserState = true;
                        return false;
                    }
                }

                var that = this;
                // 判断是否一直在摇的状态
                if(that.snakeTimer !== null){
                    // 在摇的状态关闭上一次
                    clearTimeout(that.snakeTimer);

                    // 摇一摇音乐停止
                    shakeSound.stop();
                }
                if(!that.isSnake) { // 不在摇动中
                    that.classObject = {
                        'wobble': true,
                        'animated': true
                    };
                    that.isNotSnake = false;
                    that.isSnake = true;

                    that.chanceNum -= 1;
                    that.pointList = [];
                }

                // 摇一摇音乐
                shakeSound.play();

                // 摇一摇状态 延迟2秒后续操作 用于监听一直在摇的状态
                that.snakeTimer = setTimeout(function(){
                    that.isSnakeLock = true;

                    // 增加动画时间控制，至少3秒
                    var timerNum = 0, data;
                    setTimeout(function(){
                        timerNum++;
                        showResult();
                    }, 1000);
                    $.ajax({
                        url: pageUrl.userLottery.url,
                        type: "post",
                        data: {
                            oauthToken: base.token,
                            native_view: (base.isApp ? 'app' : ''),
                            activityCode: activityCode,
                            tokenStr: that.tokenStr,
                            shareBrand: checkShareBrand,
                            lotteryType: 'lottery'
                        },
                        xhrFields: {
                            withCredentials: true
                        },
                        dataType: "json",
                        success: function (d) {
                            if (d.resultCode == 1) {
                                timerNum++;
                                data = d;
                                showResult();
                            }else{

                                that.pointList = randomPoint(18, 5);
                                that.alertText = d.resultMsg;
                                that.alertState = true;
                                that.classObject={
                                    'wobble': false,
                                    'animated': false
                                };
                                that.isSnake = false;
                                that.isNotSnake = true;
                                that.isSnakeLock = false;
                            }
                        },
                        error: function(){

                            that.pointList = randomPoint(18, 5);
                            that.alertText = '系统繁忙，请稍后再试~';
                            that.alertState = true;

                            that.classObject={
                                'wobble': false,
                                'animated': false
                            };
                            that.isSnake = false;
                            that.isNotSnake = true;
                            that.isSnakeLock = false;
                            that.chanceNum += 1;

                        }
                    });
                    function showResult(){
                        if(timerNum === 2){
                            // 结果音乐
                            resultSound.play();

                            var point = data.resultData.point;
                            that.pointTotal = point;
                            that.resultText = switchResult(point);
                            that.chanceNum = data.resultData.times;
                            that.tokenStr = data.resultData.tokenStr;
                            that.pointList = randomPoint(point, 5);
                            that.classObject={
                                'wobble': false,
                                'animated': false
                            };
                            that.isSnake = false;
                            that.isShowResult = true;
                        }
                    }
                }, 2000);
            },
            linkRecord: function () {
                if(this.isLogin){
                    base.checkAppEvent(base.switchUrl('m' + activityCode + '/records'), '我的记录');
                }else{
                    base.gotoLogin();
                }
            },
            linkGameRule: function () {
                base.checkAppEvent(base.switchUrl('m' + activityCode + '/rule'), '玩法');
            },
            showUserPanel: function(){
                if(this.isLogin){
                    if(this.isSnake){
                        return false;
                    }
                    this.showUserState = true;
                }else{
                    base.gotoLogin();
                }
            },
            closeUserPop: function(){
                this.showUserState = false;
            },
            closeAlertPop: function(){
                this.alertState = false;
            },
            goInvest: function(){
                base.gotoProductList();
            },
            goShare: function(){
                if(base.isApp){
                    base.hybridProtocol({
                        tagName: 'getShare',
                        data: {
                            dataUrl: "",
                            imgUrl: shareImg,
                            link: base.urlQuery(shareCurPage.url, 'shareBrand='+userShareBrand),
                            title: shareCurPage.title,
                            desc: shareCurPage.desc,
                            type: ""
                        },
                        success: function (data) {},
                        error: function (data) {}
                    });
                }else{
                    this.shareMask = true;
                }
            },
            hideShareMask: function(){
                this.shareMask = false;
            }
        }
    });


    // 公共中奖列表展示
    function rollShow(){
        var warp = $('.other-list'),
            rollUl = warp.find('ul'),
            lists = warp.find('li'),
            max = lists.length,
            index = 0,
            step = 1,
            realHeight = warp.height();

        if(max <= 1){
            return;
        }

        warp.css('height', realHeight);
        lists.css({
            'height': realHeight,
            'line-height': realHeight+'px'

        });
        rollUl.append(lists.clone());
        rollUl.on('transitionend webkitTransitionEnd', function(){
            if(index > max - step){
                rollUl.css({
                    "-webkit-transition-duration": "0ms",
                    "transition-duration": "0ms",
                    "-webkit-transform":"translateY(0px)",
                    "transform":"translateY(0px)"
                });
            }
        });
        function run(){
            index += step;
            if(index > max){
                index = step;
            }
            rollUl.css({
                "-webkit-transition-duration": "1000ms",
                "-webkit-transform":"translateY(" +(-realHeight*index)+"px)",
                "transition-duration": "1000ms",
                "transform":"translateY(" +(-realHeight*index)+"px)"
            });
        }

        setInterval(run, 3000)
    }

    // 点数和 随机生成点数
    function randomPoint(sum, diceNum){

        var arr = [],
            diceMax = 6,
            diceMin = 1,
            surplus = sum;

        if(diceNum*diceMax < sum){
            console.log('点数和太大');
            return;
        }

        if(diceNum*diceMin > sum){
            console.log('点数和太小');
            return;
        }
        for(var i=1; i<diceNum; i++){
            var max = Math.min(diceMax, (surplus-diceNum+i)),
                min = Math.max(diceMin, surplus - (diceNum-i)*diceMax);
            var result = Math.round(Math.random()*(max-min)) + min;
            surplus = surplus - result;
            arr.push({num: result});
        }
        arr.push({num: surplus});
        return arr;
    }
    // 显示中奖文案
    function switchResult(code){
        var text = '';
        if(code === 5){
            text = '大满贯，获得160元红包'
        }else if(code >= 28){
            text = '好腻害，获得90元红包'
        }else if(code >= 24){
            text = '棒棒哒，获得40元红包'
        }else if(code >= 20){
            text = '不错哦，获得12元红包'
        }else{
            text = '很遗憾，没有中奖'
        }
        return text;
    }
//------------------------------------------------------------[分享]

    function shareEvent() {
        shareInit({
            isApp: base.isApp,
            dataUrl: "",
            imgUrl: shareImg,
            shareLink: base.urlQuery(shareCurPage.url,"shareBrand="+userShareBrand),
            curLink: curPageUrl,
            title: shareCurPage.title,
            desc: shareCurPage.desc,
            type: ""
        });
    }

    shareEvent();
});