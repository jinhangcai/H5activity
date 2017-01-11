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


    // 获取本地当前时间
    var clientDate = new Date(),
        clientTime = clientDate.getTime();

    var activityCode = '20161111',
        activityData = base.activityData(activityCode),
        userPhone = activityData.phone,         //用户手机号 非登录状态没有该字段，可用作判断是否登录
        sysTime = activityData.systemTime,      //系统时间
        startTime = activityData.allLinkTime[2].startTime,     //开始时间
        endTime = activityData.allLinkTime[2].endTime;     //结束时间


    var deltaTime = sysTime-clientTime, // 本地与服务器时间差
        startDateObj = new Date(startTime), // 开始时间对象
        startYear = startDateObj.getFullYear(),
        startMonth = startDateObj.getMonth(),
        startDate = startDateObj.getDate(),
        countDownList = []; // 倒计时节点数组

    // 录入节点时间
    for(var i = 0; i < 23; i++){
        var countDownTime = new Date(Date.UTC(startYear, startMonth, startDate, i, 11, 0, 0));
        countDownList.push(countDownTime.getTime())
    }

    var shareImg = location.protocol + '//' + location.host + $('#sharePic').val(),
        curPageUrl = window.location.href;
    var shareCurPage = {
        title: '双11多存一点，少花一点，钱庄这次优惠玩大了！',
        desc: '老朋友，钱庄11.11理财盛宴来袭，啥也别说，赶快来抢！',
        url: base.switchUrl('m' + activityCode + '/lottery')
    };

    // 抽奖次数上线
    var LOTTERYNUMMAX = 8;
//------------------------------------------------------------[页面逻辑]

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
    Vue.filter('formatPrize', function (value) {
        var text;
        switch (value){
            case 'red_1':
                text = '1元现金红包';
                break;
            case 'red_5':
                text = '5元现金红包';
                break;
            case 'red_10':
                text = '10元现金红包';
                break;
            case 'red_30':
                text = '30元抵扣红包';
                break;
            case 'red_111':
                text = '111元抵扣红包';
                break;
            case 'coupon_0.5':
                text = '0.5%加息劵';
                break;
            case 'coupon_1':
                text = '1.0%加息劵';
                break;
        }
        return text;
    });
    new Vue({
        el: 'body',
        data: {
            pageLoading: true,
            isLogin: !!userPhone,
            isStart: sysTime >= startTime,
            isEnd: sysTime >= endTime,
            startTime: startTime,
            lotteryNum: 0,
            hasUsedTimes: 0,
            titleText: '加载中',
            lotteryStatus: 'notStart',
            lotteryList: [
                {
                    open: false,
                    prize: '?'
                },{
                    open: false,
                    prize: '?'
                },{
                    open: false,
                    prize: '?'
                },{
                    open: false,
                    prize: '?'
                },{
                    open: false,
                    prize: '?'
                },{
                    open: false,
                    prize: '?'
                }
            ],
            lock: false,
            openNum: null,
            prizeCode: '',
            cardStatus: 'close',
            showAwardMask: false,
            awardList: [],
            showAlertMask: false,
            alertPic: '',
            alertMsg: '',
            timer: null,
            isApp: base.isApp,
            isIOSApp: base.isApp && base.isIOS()
        },
        ready: function () {
            var that = this;

            if(that.isStart && !that.isEnd && that.isLogin){
                $.ajax({
                    url: pageUrl.apiUrl.url + '/activity/doubleEleven/queryRemainTimes.html',
                    type: "post",
                    data: {
                        oauthToken: base.token,
                        native_view: (base.isApp ? 'app' : ''),
                        type: 3
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    async: false,
                    dataType: "json",
                    success: function (data) {
                        if(data.resultCode === 1){
                            that.lotteryNum = data.resultData.remainTimes;
                            that.hasUsedTimes = data.resultData.hasUsedTimes;
                        }else{
                            console.log(data.resultMsg)
                        }
                    }
                });
            }
            //this.interval();
            this.pageLoading = false;

        },
        methods: {
            random: function(min, max){
                return parseInt(Math.random() * (max -min));
            },
            goLogin: function(){
                base.gotoLogin();
            },
            interval: function(){
                this.countDown();
                this.timer = setInterval(this.countDown,1000);
            },
            open: function(index){
                var formatCode;

                if(!this.isLogin){
                    this.goLogin();
                    return false;
                }
                if(!this.isStart){
                    formatCode = this.switchCode('smile', 0);
                    this.showAlert(formatCode.pic, formatCode.text);
                    return false;
                }else if(this.isEnd){
                    formatCode = this.switchCode('smile', 1);
                    this.showAlert(formatCode.pic, formatCode.text);
                    return false;
                }
                if(this.lock){
                    return false;
                }
                if(this.lotteryNum <= 0){
                    if(this.hasUsedTimes < LOTTERYNUMMAX){
                        formatCode = this.switchCode('remind', 0);
                    }else{
                        formatCode = this.switchCode('remind', 1);
                    }
                    this.showAlert(formatCode.pic, formatCode.text);
                    return false;
                }
                var that = this;
                this.lock = true;
                $.ajax({
                    url: pageUrl.apiUrl.url + '/activity/doubleEleven/openCard.html',
                    type: "post",
                    data: {
                        oauthToken: base.token,
                        native_view: (base.isApp ? 'app' : ''),
                        activityCode: activityCode,
                        linkCode: 'new_tender_amount'
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    dataType: "json",
                    success: function (data) {
                        if(data.resultCode === 1){
                            that.cardStatus = 'open';
                            that.openNum = index;
                            that.lotteryList[index].open = true;
                            that.prizeCode = data.resultData.result;
                            that.lotteryNum = data.resultData.remainTimes;
                            that.hasUsedTimes = data.resultData.hasUsedTimes;
                        }else if(data.resultCode === 0){
                            switch (data.errorCode){
                                case 'THIS_ROUND_IS_OVER':
                                    formatCode = that.switchCode('remind', 0);
                                    that.showAlert(formatCode.pic, formatCode.text);
                                    break;
                                case 'CHANCE_IS_OVER':
                                    if(that.hasUsedTimes < LOTTERYNUMMAX){
                                        formatCode = that.switchCode('remind', 0);
                                    }else{
                                        formatCode = that.switchCode('remind', 1);
                                    }
                                    that.showAlert(formatCode.pic, formatCode.text);
                                    that.lotteryNum = 0;
                                    break;
                                case 'ROUND_CHANCE_IS_OVER':
                                    formatCode = that.switchCode('remind', 1);
                                    that.showAlert(formatCode.pic, formatCode.text);
                                    break;
                                case 'THIS_ROUND_IS_NOT_START':
                                    formatCode = that.switchCode('smile', 0);
                                    that.showAlert(formatCode.pic, formatCode.text);
                                    break;
                                default:
                                    break;
                            }
                            that.lock = false;
                        }else{
                            console.log(data.resultMsg)
                        }
                    }
                });
            },
            close: function(index){
                this.lock = false;
                this.cardStatus = 'close';
                this.openNum = null;
                this.lotteryList[index].open = false;
                this.lotteryList[index].prize = '?';
            },
            transitionEnd: function(){
                var formatCode;
                if(this.cardStatus === 'open'){ // 卡打开
                    formatCode = this.switchCode(this.prizeCode);
                    this.showAlert(formatCode.pic, formatCode.text);
                    this.lotteryList[this.openNum].prize = formatCode.prize;
                }else{ // 卡关闭
                    this.close(this.openNum);
                }
            },
            switchCode: function(code, sayNum){
                var pic,text,prize,_random;
                switch (code){
                    case 'girl':
                        _random = this.random(0, 6);
                        pic = globalAlert.girl[_random].thumb;
                        text = globalAlert.girl[_random].say;
                        prize = '未中奖';
                        break;
                    default:
                        pic = globalAlert[code].thumb;
                        text = globalAlert[code].say;
                        prize = globalAlert[code].prize;
                        if(sayNum !== undefined){
                            text = text[sayNum]
                        }
                        break;
                }
                return {
                    pic: pic,
                    text: text,
                    prize: prize
                }
            },
            countDown: function(){
                var now = Date.now() + deltaTime,
                    delta = 0;
                for(var j = 0; j<23; j++){
                    var _delta = countDownList[j] - now;
                    if(_delta >= 0){
                        delta = _delta;
                        break;
                    }
                }
                if(delta == 0){
                    this.titleText = '结束了';
                    this.lotteryStatus = 'end';
                    this.timer && clearInterval(this.timer);
                    return false;
                }
                if(delta <= 1200000 || !this.isStart){ // 距离20分钟开启倒计时
                    var hours = twoNum(parseInt(delta / 3600000)),
                        minutes = twoNum(parseInt(delta % 3600000 / 60000)),
                        seconds = twoNum(parseInt(delta % 3600000 % 60000 / 1000));
                    this.titleText = '距开抢还有 '+hours+':'+minutes+':'+seconds;
                    this.lotteryStatus = 'notStart';
                }else if(delta >= 3540000){ // 距离倒计时 59分 开启翻牌
                    this.titleText = '开抢中';
                    this.lotteryStatus = 'open';
                }else{
                    this.titleText = '开抢中';
                    this.lotteryStatus = 'wait';
                }
            },
            showLotteryList: function(){
                if(!this.isLogin){
                    base.gotoLogin();
                    return;
                }
                if(!this.isStart){
                    var formatCode = this.switchCode('smile', 0);
                    this.showAlert(formatCode.pic, formatCode.text);
                    return false;
                }
                var that = this;
                $.ajax({
                    url: pageUrl.apiUrl.url + '/activity/doubleEleven/myRed.html',
                    type: "post",
                    data: {
                        oauthToken: base.token,
                        native_view: (base.isApp ? 'app' : ''),
                        activityCode: activityCode,
                        linkCode: 'new_tender_amount'
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    async: false,
                    dataType: "json",
                    success: function (data) {
                        if(data.resultCode === 1){
                            that.awardList = data.resultData.list;
                            that.showAwardMask = true;
                        }else{
                            console.log(data.resultMsg)
                        }
                    }
                });
            },
            hideAwardMask: function(){
                this.showAwardMask = false;
            },
            showAlert: function(pic, msg){
                this.showAlertMask = true;
                this.alertMsg = msg;
                this.alertPic = pic;
            },
            hideAlert: function(){
                this.showAlertMask = false;
                this.alertMsg = '';
                this.alertPic = '';
                if(this.cardStatus === 'open'){
                    this.cardStatus = 'close';
                    this.lotteryList[this.openNum].open = false;
                }
            },
            goIndex: function(){
                base.checkAppEvent(base.switchUrl('m' + activityCode + '/index'), '双11理财盛宴 多重惊喜嗨不停')
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