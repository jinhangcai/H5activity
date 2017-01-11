define(function (require, exports, module) {
//--------------------------------------------------【require】
    require('zepto.min');
    require('fastclick');
    //引入依赖
    var base = require('base');
    var cookie = require('cookie'),
        shareInit = require('share-init'),
        hybridProtocol = require('native-calls'),
        CheckAddress = require('check_address_moudle'),
        pageUrl = require('url-map');

    // fastclick代替zepto的tap,防止点透bug
    window.addEventListener('load', function () {
        FastClick.attach(document.body);
    }, false);
//--------------------------------------------------【变量】
    var isLogin,
        sysTime,startTime,endTime,
        activityData,
        inviteCode,phone;

    var activityCode = '1120';
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
    }

    var invitePageUrl = base.switchUrl('register', 'inviteCode='+inviteCode+'&phone='+phone+'&activityCode='+activityCode);
    var shareImg = location.protocol + '//' + location.host + $('#sharePic').val();
    var shareCurPage = {
            title: '逆天的15%年化收益！此生仅此一次的机会',
            desc: '7天新手标，年化收益从7.5%翻倍至15%！邀请新朋友双方均得红酒一瓶，这等好事怎能少了你',
            url: base.switchUrl('m1120/index')
        },
        shareTempOne = {
            title: '逆天的15%年化收益！此生仅此一次的机会',
            desc: '7天新手标，年化收益从7.5%翻倍至15%！邀请新朋友双方均得红酒一瓶，这等好事怎能少了你',
            url: invitePageUrl
        },
        bbs = {
            title: '新手我最大，福利翻翻翻！',
            url: 'http://bbs.qian360.com/app/index.html#&pageBbsDetailed?topicId=1847'
        },
        share = {};

    if(sysTime < startTime || sysTime > endTime){
        share = shareCurPage;
    }else{
        share = isLogin ? shareTempOne : shareCurPage;
    }

//--------------------------------------------------【selecter】
    var inviteBtn = $('#inviteBtn'),
        myPrizeBtn = $('#myPrizeBtn'),
        regBtn = $('#regBtn'),
        shareMask = $('#shareMask'),
        footer = $('.foot-bar'),
        dailog = $('#dailog');

//--------------------------------------------------【event】
    function render(){
        if(sysTime > endTime){
            regBtn.hide();
            inviteBtn.hide();
        }
        if(isLogin){
            regBtn.html('立即投资');
            userPrize();
        }
    }
    render();
    function userPrize(){
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
                if(data.resultCode == 1){
                    var _prizeList = data.resultData.giftList;
                    var len = _prizeList.length;
                    var i = 0,num=0;
                    for(; i<len; i++){
                        num += _prizeList[i]['amount'];
                    }
                    renderFooter(num);
                    footer.css('display', 'block')
                }
            }
        });
    }
    function renderFooter(num){
        if(num > 0){
            footer.find('.user-prize').text('获得'+num+'瓶葡萄酒').show();
            myPrizeBtn.show();
            footer.find('.empty').hide();
        }else{
            footer.find('.user-prize,#myPrizeBtn').hide();
            footer.find('.empty').show();
        }
    }
    // 通用弹窗方法
    function openDailog(str){
        dailog.find('.dailog-cont').html(str);
        dailog.css('display', 'block');
        $('.viewport').css('overflow-y', 'hidden')
    }
    function closeDailog(){
        dailog.css('display', 'none');
        $('.viewport').css('overflow-y', 'scroll')
    }
    dailog.find('.btn').on('click', function(){
        closeDailog();
    });
    // 判断活动是否开始
    function checkTimeEvent(ischeckstart,ischeckend){
        if(sysTime >= startTime && sysTime < endTime){
            return true;
        }else if(sysTime < startTime){
            if(ischeckstart){
                return true;
            }
            openDailog('<p class="dialog-cp">本活动11月11日启动，<br>客官不要心急哦～</p>');
        }else if(sysTime >= endTime){
            if(ischeckend){
                return true;
            }
            openDailog('<p class="dialog-cp">活动已结束，<br>下次再来哦～</p>');
        }
        return false;
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
//--------------------------------------------------【hander】
    // 我的奖品
    var checkAddress;
    myPrizeBtn.on('click', function(){
        checkLoginEvent(function(){
            checkAddress = checkAddress || new CheckAddress({
                    token: base.token,
                    activityCode: activityCode
                });
            checkAddress.showCont();
        });
    });
    $('.bbsbtn').on('click', function(){
        base.checkAppEvent(bbs.url, bbs.title);
    });
    regBtn.on('click', function(){
        checkLoginEvent(base.gotoProductList)
    });
    inviteBtn.on('click', function(){
        checkLoginEvent(inviteEvent)
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
    // 加载完关闭 loding
    $('#loadpage').css('display','none');
    // 点击关闭分享遮罩
    shareMask.on('click',function(){
        shareMask.css('display','none');
    });
});