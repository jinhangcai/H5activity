define(function (require) {
    require('zepto.min');
    require('fastclick');
    //依赖
    var shareInit = require('share-init'),
        base = require('base'),
        Vue = require('vue'),
        hrefParameter = require('href-parameter'),
        Format = require('date-format'),
        hybridProtocol = require('native-calls'),
        Dialog = require('activity-dialog');
    var pageUrl = require('url-map');
    // fastclick代替zepto的tap,防止点透bug
    window.addEventListener('load', function () {
        FastClick.attach(document.body);
    }, false);
    var timeFormat = Format;
    var activityCode = '20160618',
        //isLogin = base.checkLogin(),        // 是否登录
        activityData = base.activityData(activityCode),
        sysTime = activityData.systemTime,      //系统时间
        startTime = activityData.startDate,     //开始时间
        mmdata = activityData.integral/10;
        var wrap = $('.activity-eggs'),
            eggs =  $('.egg'),
            hammer = $('#hammer');
        var _x = 0,_y = 0,isdown = false,isdownload = true;
        var sharebrand='',shareCurPage;
//------------------------------------------------------------[分享]
        var shareImg = location.protocol + '//' + location.host + $('#sharePic').val(),
            curPageUrl = window.location.href;
            shareCurPage = {
                title: '快来，钱庄2周年庆典，惊喜福利足以撩拨你的心扉了！',
                desc: '今年生日不止嗨一次，来钱庄陪小二一起收生日好礼！',
                url: base.switchUrl('m' + activityCode + '/rock')
            };
        function shareEvent() {
            shareInit({
                isApp: base.isApp,
                dataUrl: "",
                imgUrl: shareImg,
                shareLink: base.urlQuery(shareCurPage.url,"sharebrand="+sharebrand),
                curLink: curPageUrl,
                title: shareCurPage.title,
                desc: shareCurPage.desc,
                type: ""
            });
        }
    //------------------------------------------------------------[页面逻辑]
    new Vue({
        el: 'body',
        data: {
            rulePop: false,
            investment: 0,
            money:mmdata,
            pageLoading:true,
            receivePop:false,
            datasals:false,
            nosals:false,
            redsals:false,
            poker:false,
            gotTimes:0,
            tokenStr:0,
            group:0,
            grouptwo:0,
            assembly:0,
            title:'',
            whether:false,
            type:0,
            linkhide:false,
            lists:[]
        },
        computed: {
            isLogin: function () {
                return !!activityData.phone;
            },
            isStart: function () {
                return sysTime > startTime + 86400000 *12;
            },
            isEnd: function(){
                return   sysTime >  startTime+ 86400000 *13;
            },
            isStartday: function () {
                return sysTime > (startTime +( 86400000 *12+32400000));
            }
        },
        ready: function () {
            var _this = this;
            this.pageLoading = false;
            shareEvent();
            if(sysTime < (startTime + 86400000 *12)){
                return;
            }
            // 分享确认
            var userShareBrand = hrefParameter.get('shareBrand');
            if(userShareBrand){
                $.ajax({
                    url: pageUrl.checkUserShare.url,
                    type: "post",
                    data: {
                        shareBrand: userShareBrand,
                        activityCode: activityCode
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    dataType: "json",
                    success: function (data) {}
                });
            }

            //获取分享码
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
                        sharebrand = data.resultData;
                        shareEvent();
                    }
                }
            });
            //可砸次数
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
                success: function (data) {
                    if(data.resultCode ==1){
                        _this.investment = data.resultData.times;
                        //_this.money = data.resultData.integral;
                        _this.gotTimes = data.resultData.gotTimes;
                        _this.tokenStr = data.resultData.tokenStr;
                    }

                }
            });

        },
        methods: {
            linkHome: function () {
                if (!base.isApp) {
                    base.checkAppEvent(base.switchUrl('m' + activityCode + '/index'), '主会场')
                } else {
                    base.goHistory();
                }
            },
            linkLogin: function () {
                base.gotoLogin();
            },
            linkBbs: function () {
                base.checkAppEvent('https://bbs.qian360.com/posts/list/2610.page#13358', '');
            },
            showRulePop: function () {
               // this.rulePop = true;
                if(this.iis){
                    console.log(1)
                    this.iis = false;
                }else{
                    console.log(2)
                    this.iis = true;
                }

            },
            hideRulePop: function () {
                this.rulePop = false;
            },
            showReceivePop: function () {
                this.receivePop = true;
            },
            hideReceivePop:function(){
                this.receivePop = false;
            },
            showdatasalse:function(){
                var _this = this;
                //中奖记录
                $.ajax({
                    url: pageUrl.myPrice.url,
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
                        if(data.resultData.lotteryWinList == ''){
                            _this.nosals = true;
                        }else{
                           var resultDatalotteryWinList = data.resultData.lotteryWinList.length,
                               arr = [];
                            for(var i=0;i<resultDatalotteryWinList;i++){
                                var _list = data.resultData.lotteryWinList[i],
                                    form = timeFormat.format(_list.addTime, 'HH:mm:ss');
                                arr.push({prize: _list.prize, time: form})
                            }
                            _this.lists = arr;
                            _this.datasals = true;
                        }
                    }
                });
            },
            shownosalse:function(){
                this.nosals = true;
            },
            hidesalse:function(){
                this.sales = false;
                this.datasals = false;
                this.nosals = false;
                this.redsals = false;
                var egg = $('.egg');
                egg.removeClass('smash-egg');

            },
            gotoProductList:function(){
                base.gotoProductList();
            },
            pokeron:function(){
              this.poker = false
            },
            eggclick:function(e){
                _x = e.pageX - wrap.offset().left;
                _y = e.pageY - wrap.offset().top;
                hammer.css({
                    'top': _y,
                    'left': _x,
                    '-webkit-transform': 'rotate(-60deg) translate(-0%, -70%)',
                    'transform': 'rotate(-60deg) translate(-0%, -70%)'
                });
                isdown = true;
            },
            hammer:function(){
                if(isdown){
                    hammer.css({
                        'top': _y,
                        'left': _x,
                        '-webkit-transform': 'rotate(20deg) translate(-0%, -70%)',
                        'transform': 'rotate(20deg) translate(-0%, -70%)'
                    });
                    isdown = false;
                }
            },
            showShareMask: function () {
                var _this = this;
                function userShareEvent(){
                    if(base.isApp){
                        hybridProtocol({
                            tagName: 'getShare',
                            data: {
                                dataUrl: "",
                                imgUrl: shareImg,
                                link: base.urlQuery(shareCurPage.url, 'shareBrand='+sharebrand),
                                title: shareCurPage.title,
                                desc: shareCurPage.desc,
                                type: ""
                            },
                            success: function (data) {},
                            error: function (data) {}
                        });
                    }else{
                        _this.poker = true;
                    }
                }
                userShareEvent()
            },
            Loginclick:function(){
                base.gotoLogin();
                return;
            },
            eggsonclick:function(list){
                var _this = this;
                var egg = $('.egg');
                if(!_this.isLogin){
                    base.gotoLogin();
                    return;
                }

                //活动未开始
                if(_this.isLogin && !_this.isStart){
                    _this.redsals = true;
                    _this.whether = false;
                    _this.title = '活动未开始~';
                    return ;
                }

                //活动已结束
                if(_this.isLogin && _this.isEnd){
                    _this.redsals = true;
                    _this.whether = false;
                    _this.title = '活动已结束~';
                    return ;
                }
                if(_this.gotTimes >= 5 && _this.investment == 0){
                    _this.redsals = true;
                    _this.whether = false;
                    _this.title = '活动机会已用完~';
                    return ;
                }
                if(_this.gotTimes < 5 && _this.investment == 0){
                    _this.redsals = true;
                    _this.whether = false;
                    _this.title = '投资或分享可获得砸蛋机会~';
                    return ;
                }
                if(isdownload){
                    isdownload = false;
                    //砸蛋接口
                    $.ajax({
                        url: pageUrl.userLottery.url,
                        type: "post",
                        data: {
                            oauthToken: base.token,
                            native_view: (base.isApp ? 'app' : ''),
                            activityCode: activityCode,
                            lotteryType: 'lottery',
                            tokenStr:_this.tokenStr
                        },
                        xhrFields: {
                            withCredentials: true
                        },
                        dataType: "json",
                        async:false,
                        success: function (data) {
                            _this.investment = data.resultData.times;
                            _this.tokenStr = data.resultData.tokenStr;
                            _this.gotTimes = data.resultData.gotTimes;
                            setTimeout(function(){
                                _this.redsals = true;
                                _this.whether = true;
                            },300);
                            if(data.resultData.code == '10元话费券'){
                                _this.type = 2;
                            }
                            if(parseInt(data.resultData.code) <= 20 && data.resultData.code != '10元话费券'){
                                _this.type = 3;
                                _this.grouptwo = parseInt(data.resultData.code);
                                _this.group = data.resultData.code;
                            }else if(parseInt(data.resultData.code) == 50){
                                _this.type = 1;
                                _this.group = 20;
                                _this.grouptwo = 30;
                                _this.assembly = data.resultData.code;
                            }else if(parseInt(data.resultData.code) == 88){
                                _this.type = 1;
                                _this.group = 20;
                                _this.grouptwo = 68;
                                _this.assembly = data.resultData.code;
                            }
                            egg.eq(list).addClass('smash-egg');
                            isdownload = true;
                        }
                    });
                }
            }
        }
    });
    //------------------------------------------------------------[分享]
    //var shareImg = location.protocol + '//' + location.host + $('#sharePic').val(),
    //    curPageUrl = window.location.href;
    // shareCurPage = {
    //    title: '快来，钱庄2周年庆典，惊喜福利足以撩拨你的心扉了！',
    //    desc: '今年生日不止嗨一次，来钱庄陪小二一起收生日好礼！',
    //    url: base.switchUrl('m' + activityCode + '/rock')
    //};

});