define(function (require) {
//--------------------------------------------------【require】
    require('zepto.min');
    require('fastclick');
    //依赖
    var base = require('base'),
        shareInit = require('share-init'),
        pageUrl = require('url-map');

    // fastclick代替zepto的tap,防止点透bug
    window.addEventListener('load', function () {
        FastClick.attach(document.body);
    }, false);

    // 解决在微信上a标签:active伪类失效的bug
    window.addEventListener('touchstart', function () {
    }, false);
//--------------------------------------------------【变量】
    var isLogin,
        sysTime,startTime,endTime,
        activityData,
        activityCode='20160314';
    var share = {
        url: base.switchUrl('m'+activityCode+'/index'),
        title: '钱庄邀您免费体验超炫F16战斗机飞行！',
        desc: '最美季节就要玩最刺激的！钱庄日百万积分、F16战斗机1:1飞行带你一起直冲云霄！'
    },
        curPageUrl = window.location.href,
        shareImg = location.protocol + '//' + location.host + $('#sharePic').val();

    isLogin = base.checkLogin();
    activityData = base.activityData(activityCode);
    sysTime = activityData.systemTime;      //系统时间
    startTime = activityData.startDate;      //开始时间
    endTime = activityData.endDate;      //结束时间

    //   接口列表
    var ajaxUrl = {
        // 用户18号累计投资
        tenderOneDay:{
            url: pageUrl.apiUrl.url + '/activity/monthlyActivity/m0314/tenderOneDay.html'
        },
        // 投资排行
        tenderRank:{
            url: pageUrl.apiUrl.url + '/activity/monthlyActivity/m0314/tenderRank.html'
        },
        // 投资最高纪录
        showFirst:{
            url: pageUrl.apiUrl.url + '/activity/monthlyActivity/m0314/showFirst.html'
        }
    };

    var isPassFourteen = sysTime >= startTime, // 开始时间为 14号
        isPassFifteen = sysTime >= (startTime + 86400000), // 14号 + 24 * 60 * 60 * 1000
        isPassEighteen = sysTime >= (startTime + 345600000), // 14号 + 24 * 60 * 60 * 1000 *4
        unClosed = sysTime<endTime; // 活动未结束

    var hideCls = 'hide'; // 影藏元素className

//--------------------------------------------------【event】
    // 今日最高投资
    function todayBestEvent(){
        var todayBest,bestWrap;

        if(isPassFourteen && unClosed){
            todayBest = $('#todayBest');
            bestWrap = todayBest.find('.highlight');

            $.ajax({
                url: ajaxUrl.showFirst.url,
                type: "post",
                data: {
                    activityCode: activityCode
                },
                xhrFields: {
                    withCredentials: true
                },
                dataType: "json",
                success: function (data) {
                    if (data.resultCode == 1 && data.resultData) {
                        bestWrap.html(data.resultData[0].totalTender+'元');
                        todayBest.removeClass(hideCls)
                    }
                }
            });
        }
    }
    todayBestEvent();

    // 投资榜单
    function topListEvent(){
        var topListWrap,historyListBtn,topUl,htmlstr = '';
        if(isPassFifteen){
            historyListBtn = $('#historyListBtn');
            topListWrap = $('#topList');
            topUl = topListWrap.find('ul');
            historyListBtn.removeClass(hideCls);
            $.ajax({
                url: ajaxUrl.tenderRank.url,
                type: "post",
                data: {
                    activityCode: activityCode
                },
                xhrFields: {
                    withCredentials: true
                },
                dataType: "json",
                success: function (data) {
                    if (data.resultCode == 1) {
                        var _dataArr = data.resultData,
                            i, l = _dataArr.length;
                        if(l > 0){
                            for(i = 0; i<l; i++){
                                htmlstr += '<li><span>' + (i+1) + '</span><span>'+_dataArr[i].phone+'</span><span>'+_dataArr[i].totalTender+'</span></li>';
                            }
                            topUl.html(htmlstr);
                            topListWrap.removeClass(hideCls);
                        }
                    }
                }
            });
        }
    }
    topListEvent();

    // 个人累计投资
    function userTenderEvent(){
        var userTender,tenderWrap;

        if(isPassEighteen && isLogin){
            userTender = $('#userTender');
            tenderWrap = userTender.find('.highlight');

            $.ajax({
                url: ajaxUrl.tenderOneDay.url,
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
                        tenderWrap.html(data.resultData+'元');
                        userTender.removeClass(hideCls)
                    }
                }
            });
        }
    }
    userTenderEvent();

    $('.intro-btn').on('click', function(){
        base.checkAppEvent(base.switchUrl('m20160314/intro'), '阳春3月，钱庄带你装B带你飞')
    });

    $('.bbs,.gobbs').on('click', function(){
        base.checkAppEvent('https://bbs.qian360.com/app/index.html#&pageBbsDetailed?topicId=2391', '阳春3月，钱庄带你装B带你飞')
    });

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
});
