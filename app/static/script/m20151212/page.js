define(function (require) {
//--------------------------------------------------【require】
    require('zepto.min');
    require('fastclick');
    //引入依赖
    var base = require('base');
    var cookie = require('cookie'),
        hybridProtocol = require('native-calls'),
        shareInit = require('share-init'),
        Dialog = require('activity-dialog'),
        pageUrl = require('url-map'),
        slotMachine = require('raffle-slotMachine'),
        CheckAddress = require('check_address_moudle');

    // fastclick代替zepto的tap,防止点透bug
    window.addEventListener('load', function () {
        FastClick.attach(document.body);
    }, false);
//--------------------------------------------------【变量】
    var isLogin,
        sysTime,startTime,endTime,
        activityData,
        inviteCode,phone,
        integral = 0;

    var activityCode = '20151212';
//--------------------------------------------------【基础数据以及活动数据】
    var curPageUrl = window.location.href;

    // 登录状态
    isLogin = base.checkLogin();

    // 活动数据 & 登陆情况下用户数据
    //{
    //    endDate: 1447862399000
    //    inviteCode: "4qqq",
    //    phone: "187****1811",
    //    startDate: 1447171200000,
    //    systemTime: 1446805542995
    //}
    activityData = base.activityData(activityCode);
    sysTime = activityData.systemTime;
    startTime = activityData.startDate;
    endTime = activityData.endDate;
    if(isLogin){
        inviteCode = activityData.inviteCode;
        phone = activityData.phone;
        integral = activityData.integral;
    }
    var invitePageUrl = base.switchUrl('register', 'inviteCode='+inviteCode+'&phone='+phone+'&activityCode='+activityCode);
    var myPrizeUrl = base.switchUrl('m'+activityCode+'/myPrize');
    var shareImg = location.protocol + '//' + location.host + $('#sharePic').val();

    myPrizeUrl = (sysTime > endTime) ? base.urlQuery(myPrizeUrl, 'isend=true') : base.urlQuery(myPrizeUrl, 'isend=false');
    myPrizeUrl = base.isApp ? base.urlQuery(myPrizeUrl, 'native_view=app&oauthToken='+base.token) : myPrizeUrl;
    var shareCurPage = {
            url: base.switchUrl('m'+activityCode+'/index')
        },
        bbs = {
            title: '积分兑好礼，年终福利提前送',
            url: 'http://bbs.qian360.com/app/index.html#&pageBbsDetailed?topicId=1996'
        },
        myPrize = {
            title: '我的奖品',
            url: myPrizeUrl+'&activityCode='+activityCode
        },
        share = {
            title: '好友@你，年终壕礼还未领取！',
            desc: '红包、小米电视、iPhone6S plus都已备好，丰厚大礼等你来兑！'
        };

    share.url = isLogin ? invitePageUrl : shareCurPage.url;

//--------------------------------------------------【selecter】
    var body = $('body'),
        viewport = $('.viewport');

    var inviteBtn = $('#inviteBtn'),
        investBtn = $('.investBtn'),
        myPrizeBtn = $('#myPrizeBtn'),
        shareMask = $('#shareMask');

//--------------------------------------------------【event】
    // 通用弹框初始化
    var commonDialog = new Dialog({
        btns: [{
            cls: 'btn',
            text: '知道了',
            callback: function(self){
                self.close();
            }
        }]
    });
    function openDailog(contentstr){
        commonDialog.setcontent(contentstr).open();
    }

    // 去领取奖品弹出框
    var prizeDialog = new Dialog({
        btns: [{
            cls: 'btn',
            text: '妥妥的',
            callback: function(self){
                self.close();
            }
        }]
    });
    function openprizeDialog(contentstr){
        prizeDialog.setcontent(contentstr).open();
    }

    // 去领取奖品弹出框
    var checkAddress;
    var addressDialog = new Dialog({
        btns: [{
            cls: 'btn',
            text: '填写收货地址',
            callback: function(){
                    checkAddress = checkAddress || new CheckAddress({
                            token: base.token,
                            activityCode: activityCode
                        });
                    checkAddress.showCont();
            }
        }]
    });
    function openaddressDialog(contentstr){
        addressDialog.setcontent(contentstr).open();
    }

    // 需要操作的走这
    function checkLoginEvent(callback){
        if(!isLogin){
            base.gotoLogin();
            return false;
        }
        callback && callback();
    }
    // 邀请好友方法
    function inviteEvent(){
        if(!checkTimeEvent()){
            return;
        }
        if(base.isApp){
            hybridProtocol({
                tagName: 'getShare',
                data: {
                    dataUrl: "",
                    imgUrl: shareImg,
                    link: share.url,
                    title: share.title,
                    desc: share.desc,
                    type: ""
                },
                success: function (data) {},
                error: function (data) {}
            });
        }else{
            shareInit({
                isApp: base.isApp,
                dataUrl: "",
                imgUrl: shareImg,
                shareLink: share.url,
                curLink: curPageUrl,
                title: share.title,
                desc: share.desc,
                type: ""
            });
            shareMask.css('display','block');
        }
    }
    // 跳转我的奖品
    function myPrizeEvent(){
        if(!checkTimeEvent(false,true)){
            return;
        }
        base.checkAppEvent(myPrize.url, myPrize.title)
    }
    // 判断活动是否开始
    function checkTimeEvent(notcheckstart,notcheckend){
        if(sysTime >= startTime && sysTime < endTime){
            return true;
        }else if(sysTime < startTime){
            if(notcheckstart){
                return true;
            }
            openDailog('<p class="cont">活动还未开始<br>敬请期待</p>')
        }else if(sysTime >= endTime){
            if(notcheckend){
                return true;
            }
            openDailog('<p class="cont">活动已结束<br>下次再来吧</p>')
        }
        return false;
    }

//--------------------------------------------------【顶栏浮动定位】
    function fixedTopBar(){
        var topBar = $('.top-bar'),
            topBarTop = topBar.position().top;
        var fixCls = 'fixed';
        var timer = null;
        $(window).on('scroll', function(){
            clearTimeout(timer);
            timer = setTimeout(function(){
                tofixed();
            },40)
        });
        function tofixed(){
           if(body.scrollTop() >= topBarTop){
               topBar.addClass(fixCls);
           }else{
               topBar.removeClass(fixCls);
           }
        }
        tofixed();
    }
    fixedTopBar();

//--------------------------------------------------【2015 12 13后定位到积分兑壕礼栏目】
    function positionPointsBar(){
        var pointsBar = $('.activity-item').eq(1),
            _barTop = pointsBar.position().top - $('.top-bar').height(); // 定位高度 = 栏目定位高度 - 浮动顶栏高度
        if(startTime+86400000 < sysTime){
            body.scrollTop(_barTop);
        }
    }
    positionPointsBar();

//--------------------------------------------------【活动说明收起/展开】
    function ruleSwitch(){
        var ruleWrap = $('.rule-wrap'),
            ruleBtn = ruleWrap.find('.btn');
        var hideCls = 'rule-hide';
        ruleBtn.on('click', function(){
            if(ruleWrap.hasClass(hideCls)){
                ruleWrap.removeClass(hideCls)
            }else{
                ruleWrap.addClass(hideCls)
            }
        })
    }
    ruleSwitch();
//--------------------------------------------------【转盘抽奖】
    function raffle(){
        var userPoints = $('.user-points'),
            raffleStartBtn = $('#raffleStartBtn'),
            rafBtnInner = raffleStartBtn.find('a');

        var disCls = 'disabled';

        if(sysTime < startTime){
            userPoints.html('<span class="points-label">活动即将开始</span>');
            raffleStartBtn.addClass(disCls);
            rafBtnInner.html('活动<br>即将开始');
            return false;
        }
        var RecordBtn = $('#RecordBtn');
        if(!isLogin){
            userPoints.html('<span class="points-label">当前积分: <a class="underline" href="javascript:;">登录查看</a></span>');
            raffleStartBtn.removeClass(disCls);
            rafBtnInner.html('请先登录');
            userPoints.on('click',base.gotoLogin);
            raffleStartBtn.on('click',base.gotoLogin);
            RecordBtn.css('display','none');
            return false;
        }
        RecordBtn.on('click', function(){
            checkLoginEvent(myPrizeEvent);
        });
        var pointsNum = $('.points-num'),
            raffleNum = $('#raffleNum');

        var pointsVal = integral,
            raffleVal = 0,
            totalTimes = 0;
            tokenStr = '';

        function raffleRender(){
            pointsNum.text(pointsVal);
            raffleNum.text(raffleVal);
            if(totalTimes == 3 ){
                raffleStartBtn.addClass(disCls);
                rafBtnInner.html('今日机会<br>已用完');
            }else if(pointsVal < 500){
                raffleStartBtn.addClass(disCls);
                rafBtnInner.html('积分不足');
            }else{
                raffleStartBtn.removeClass(disCls);
                rafBtnInner.html('开始抽奖');
            }
        }
        if(sysTime > endTime){
            raffleRender();
            raffleStartBtn.addClass(disCls);
            rafBtnInner.html('活动已结束');
            return false;
        }
        function raffleInit(){
            $.ajax({
                url: pageUrl.userLotteryTimes.url,
                type: "post",
                data: {
                    oauthToken: base.token,
                    native_view: (base.isApp ? 'app' : ''),
                    activityCode: activityCode,
                    lotteryType: 'integral_lottery'
                },
                xhrFields: {
                    withCredentials: true
                },
                dataType: "json",
                success: function (data) {
                    if (data.resultCode == 1) {
                        raffleVal = data.resultData.times;
                        tokenStr = data.resultData.tokenStr;
                        totalTimes = data.resultData.gotTimes;
                        raffleRender();
                    }
                }
            });
        }
        raffleInit();

        var isRafflIng = false;
        var raffleLi = $('.raffle-con li');
        var raffle = new slotMachine({
            awardsArr: [raffleLi[0], raffleLi[1], raffleLi[2], raffleLi[5], raffleLi[8], raffleLi[7], raffleLi[6], raffleLi[3]],
            cycleIndex: 2
        });
        function raffleEvent(){
            if(isRafflIng || raffleStartBtn.hasClass('disabled')){
                return false;
            }
            var defText = '';
            $.ajax({
                url: pageUrl.userLottery.url,
                type: "post",
                data: {
                    oauthToken: base.token,
                    native_view: (base.isApp ? 'app' : ''),
                    activityCode: activityCode,
                    tokenStr: tokenStr,
                    lotteryType: 'integral_lottery'
                },
                xhrFields: {
                    withCredentials: true
                },
                dataType: "json",
                beforeSend: function(){
                    defText = rafBtnInner.html();
                    raffleStartBtn.addClass(disCls);
                    rafBtnInner.html('正在抽奖');
                    isRafflIng = true;
                },
                success: function (data) {
                    if (data.resultCode == 1) {
                        pointsVal = data.resultData.integral;
                        raffleVal = data.resultData.times;
                        tokenStr = data.resultData.tokenStr;
                        totalTimes = data.resultData.gotTimes;
                        var codeid = data.resultData.code;
                        raffle.run(codeid, function () {
                            var obj = $('.raffle-con li[data-id="' + codeid + '"]');
                            var img = obj.find('img').attr('src');
                            var _html = '<div class="pic"><img src="'+img+'"></div><p class="cont">恭喜您，获得'+codeid+'</p>';
                            if((codeid == '红酒1瓶')||(codeid == '钱小二')){
                                openaddressDialog(_html)
                            }else{
                                openprizeDialog(_html)
                            }
                            isRafflIng = false;
                            raffleRender();
                        });
                    }else{
                        openDailog('<p class="cont">' + data.resultMsg + '</p>');
                        raffleStartBtn.removeClass(disCls);
                        rafBtnInner.html(defText);
                        isRafflIng = false;
                    }
                },
                error: function(){
                    openDailog('<p class="cont">服务器繁忙，请稍后再试</p>');
                    raffleStartBtn.removeClass(disCls);
                    rafBtnInner.html(defText);
                    isRafflIng = false;
                }
            });
        }
        raffleStartBtn.on('click', raffleEvent);
    }
    raffle();
//--------------------------------------------------【事件绑定】

    // 邀请好友
    inviteBtn.on('click', function(){
        checkLoginEvent(inviteEvent);
    });
    // 立即投资
    investBtn.on('click', function(){
        base.gotoProductList();
    });
    // 我的奖品
    myPrizeBtn.on('click', function(){
        checkLoginEvent(myPrizeEvent);
    });
    $('.bbs').on('click', function(){
        base.checkAppEvent(bbs.url, bbs.title);
    });

    // 页面分享初始化
    shareInit({
        isApp: base.isApp,
        dataUrl: "",
        imgUrl: shareImg,
        shareLink: shareCurPage.url,
        curLink: curPageUrl,
        title: share.title,
        desc: share.desc,
        type: ""
    });
    // 加载完关闭 loading
    $('#loadpage').css('display','none');
    // 点击关闭分享遮罩
    shareMask.on('click',function(){
        shareMask.css('display','none');
    });
//--------------------------------------------------【图片懒加载】
    function loadImg(url,callback){
        var img = new Image();
        img.onload = function(){
            callback && callback();
        };
        img.src = url;
    }
    function lazyImgs(){
        var imgs = $('.dt-list img, .raffle-con img, .points-list img');
        imgs.each(function(i, item){
            var self = $(item),
                dataSrc = self.attr('data-src');
            if(dataSrc){
                loadImg(dataSrc, function(){
                    self.attr('src', dataSrc)
                        .removeAttr('data-src');
                })
            }
        })
    }
    lazyImgs();
});