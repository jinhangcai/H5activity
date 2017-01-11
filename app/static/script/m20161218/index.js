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


    var activityCode = '20161218',
        activityData = base.activityData(activityCode),
        userPhone = activityData.phone,         //用户手机号 非登录状态没有该字段，可用作判断是否登录
        sysTime = activityData.systemTime,      //系统时间
        part4StartTime = activityData.allLinkTime[3].startTime,      //4环节开始时间
        part2EndTime = activityData.allLinkTime[1].endTime,      //2环节结束时间
        endTime = activityData.endDate,
        startTime = activityData.startDate;     //开始时间

    var shareImg = location.protocol + '//' + location.host + $('#sharePic').val(),
        curPageUrl = window.location.href;
    var shareCurPage = {
        title: '1218年终盛典来袭，老板说，给你发钱发购物卡啦！',
        desc: '亲，16年最后一个钱庄日了，真的不爬起来再投一点么？',
        url: base.switchUrl('m' + activityCode + '/index')
    };

    function milliFormat(s){//添加千位符
        s = s+'';
        if(/[^0-9\.]/.test(s)) return "invalid value";
        s=s+',';
        var re=/(\d)(\d{3},)/;
        while(re.test(s)){
            s=s.replace(re,"$1,$2");
        }
        s=s.replace(/,$/,"");
        return s;
    }
//------------------------------------------------------------[页面逻辑]
    Vue.filter('toWrap', function (num) {
        var numStr = milliFormat(num);
        return '<span class="red">'+numStr.split('').join('</span><span class="red">')+'</span>';
    });
    new Vue({
        el: 'body',
        data: {
            pageLoading: true,
            isLogin: !!userPhone,
            isStart: sysTime >= startTime,
            isPart4Start: sysTime >= part4StartTime,
            isEnd: sysTime > endTime,
            isPart2End: sysTime > part2EndTime,
            part: 1,
            canPart5: false,
            totalQDay: 0,
            totalQDayMount: 0,
            packetNum: 0,
            isReceived: false,
            couponIsReceived: false,
            partMap: [2, 3, 4, 5, 6],
            alertMask: false,
            alertContent: '',
            timeOutMask: false,
            timeOutContent: '',
            timeOutTimer: null,
            userTotal: 0,
            availableTimes: 0,
            hasReceivedTimes: 0,
            interest: 0,
            isIOSApp: base.isApp && base.isIOS(),
            shareMask: false
        },
        ready: function () {
            var that = this;
            if(this.isStart && this.isLogin){
                // 累计收益
                $.ajax({
                    url: pageUrl.apiUrl.url + '/activity/monthlyActivity/queryData.html',
                    type: "post",
                    data: {
                        oauthToken: base.token,
                        native_view: (base.isApp ? 'app' : ''),
                        activityCode: activityCode,
                        linkCode: 'qian360_tender_total'
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    dataType: "json",
                    async: false,
                    success: function (data) {
                        if(data.resultCode === 1){
                            that.interest = data.resultData.interest;
                        }else{
                            console.log(data.resultMsg);
                        }
                    }
                });
                // 环节2是否已领过
                $.ajax({
                    url: pageUrl.apiUrl.url + '/activity/monthlyActivity/queryData.html',
                    type: "post",
                    data: {
                        oauthToken: base.token,
                        native_view: (base.isApp ? 'app' : ''),
                        activityCode: activityCode,
                        linkCode: 'send_money'
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    dataType: "json",
                    async: false,
                    success: function (data) {
                        if(data.resultCode === 1){
                            that.couponIsReceived = data.resultData.isReceived;
                        }else{
                            console.log(data.resultMsg);
                        }
                    }
                });
                if(!this.isEnd){
                    // 可用抽红包次数（环节3）
                    $.ajax({
                        url: pageUrl.apiUrl.url + '/activity/monthlyActivity/queryData.html',
                        type: "post",
                        data: {
                            oauthToken: base.token,
                            native_view: (base.isApp ? 'app' : ''),
                            activityCode: activityCode,
                            linkCode: 'draw_pic'
                        },
                        xhrFields: {
                            withCredentials: true
                        },
                        dataType: "json",
                        async: false,
                        success: function (data) {
                            if(data.resultCode === 1){
                                that.availableTimes = data.resultData.availableTimes;
                                that.hasReceivedTimes = data.resultData.hasReceivedTimes;
                            }else{
                                console.log(data.resultMsg);
                            }
                        }
                    });
                }
            }
            this.pageLoading = false;

        },
        methods: {
            timeMachineStart: function(){
                if(!this.isStart){
                    this.openAlert('12月16日才开始哦~');
                    return false;
                }
                if(this.isEnd){
                    this.openAlert('活动结束了哦~');
                    return false;
                }
                if(!this.isLogin){
                    this.goLogin();
                    return false;
                }
                var that = this;
                $.ajax({
                    url: pageUrl.apiUrl.url + '/activity/monthlyActivity/receiveRed.html',
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
                            that.totalQDay = data.resultData.times;
                            that.totalQDayMount = data.resultData.total;
                            that.packetNum = data.resultData.redAmount;
                            that.isReceived = data.resultData.isReceived;

                            that.partMap = that.totalQDay==0 ? [2, 7, 8, 5, 6] : [2, 3, 4, 5, 6];
                            that.timeMachine(0)
                        }else{
                            console.log(data.resultMsg);
                        }
                    }
                });
            },
            timeMachine: function(index){
                var that = this;

                this.switchPart(index,function(i){
                    if(i < 4){
                        setTimeout(function(){
                            that.timeMachine(i)
                        }, 750)
                    }else{
                        that.canPart5 = true;
                    }
                })
            },
            openLottery: function(){
                var that = this;
                this.switchPart(4, function(){

                    if(that.isReceived){
                        that.timeOutAlert('已领过')
                    }
                })
            },
            switchPart: function(index, cb){
                var that = this;
                that.part = that.partMap[index];
                setTimeout(function(){
                    var spans = $('.machine .content span'),
                        spanLength = spans.length,
                        i = 0;
                    next();
                    function next(){
                        setTimeout(function(){
                            if(i < spanLength){
                                next();
                            }else{
                                cb && cb(index+1);
                            }
                            spans.eq(i++).css('opacity', '1');
                        }, 150)
                    }
                },0);
            },
            sendMoney: function(){
                if(!this.isStart){
                    this.openAlert('12月16日才开始哦~');
                    return false;
                }
                if(this.isPart2End){
                    this.openAlert('活动结束了哦~');
                    return false;
                }
                if(!this.isLogin){
                    this.goLogin();
                    return false;
                }
                if(this.couponIsReceived){
                    this.openAlert('已领过');
                    return false;
                }
                var that = this;
                $.ajax({
                    url: pageUrl.apiUrl.url + '/activity/monthlyActivity/receiveCoupon.html',
                    type: "post",
                    data: {
                        oauthToken: base.token,
                        native_view: (base.isApp ? 'app' : ''),
                        activityCode: activityCode,
                        linkCode: 'send_money'
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    dataType: "json",
                    async: false,
                    success: function (data) {
                        if(data.resultCode === 1){
                            that.couponIsReceived = true;
                        }else{
                            // resultCode == 0失败  errorCode=HAS_RECEIVED 已领过 errorCode=TENDER_NOT_ENOUGH 投资不够
                            if(data.resultCode == 0){
                                switch(data.errorCode){
                                    case 'HAS_RECEIVED':
                                        that.openAlert('已领过');
                                        break;
                                    case 'TENDER_NOT_ENOUGH':
                                        that.openAlert('12月16日-17日两天<br>累计投资满8000元才可领取');
                                        break;
                                }
                            }
                            console.log(data.resultMsg);
                        }
                    }
                });
            },
            drawPic: function(type){
                var that = this;
                if(!this.isStart){
                    this.openAlert('12月16日才开始哦~');
                    return false;
                }
                if(this.isEnd){
                    this.openAlert('活动结束了哦~');
                    return false;
                }
                if(!this.isLogin){
                    this.goLogin();
                    return false;
                }
                if(that.availableTimes == 0){
                    if(that.hasReceivedTimes < 3){
                        this.openAlert('单笔投资满5000元才可领取');
                    }else{
                        this.openAlert('活动期间每人最多可领3次');
                    }
                    return false;
                }
                that.availableTimes -= 1;
                that.hasReceivedTimes += 1;
                $.ajax({
                    url: pageUrl.apiUrl.url + '/activity/monthlyActivity/receiveRed.html',
                    type: "post",
                    data: {
                        oauthToken: base.token,
                        native_view: (base.isApp ? 'app' : ''),
                        activityCode: activityCode,
                        linkCode: 'draw_pic',
                        type: type
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    dataType: "json",
                    async: false,
                    success: function (data) {
                        if(data.resultCode === 1){
                            that.timeOutAlert('领取成功')
                        }else{
                            // resultCode == 0失败  errorCode=CHANCE_IS_OVER 机会用完了 errorCode=TENDER_NOT_ENOUGH 投资不够
                            if(data.resultCode == 0){
                                switch(data.errorCode){
                                    case 'CHANCE_IS_OVER':
                                        that.openAlert('活动期间每人最多可领3次');
                                        break;
                                    case 'TENDER_NOT_ENOUGH':
                                        that.openAlert('单笔投资满5000元才可领取');
                                        break;
                                }
                            }
                            console.log(data.resultMsg);
                        }
                    }
                });
            },
            closeAlert: function(){
                this.alertContent = '';
                this.alertMask = false;
            },
            openAlert: function(content){
                this.alertContent = content;
                this.alertMask = true;
            },
            timeOutAlert: function(content){
                var that = this;
                this.timeOutContent = content;
                this.timeOutMask = true;
                this.timeOutTimer && clearTimeout(this.timeOutTimer);
                this.timeOutTimer = setTimeout(function(){
                    that.timeOutMask = false;
                }, 3000)
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