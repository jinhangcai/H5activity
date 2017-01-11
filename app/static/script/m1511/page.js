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
        CheckAddress = require('check_address_moudle'),
        hrefParameter = require('href-parameter');

    // fastclick代替zepto的tap,防止点透bug
    window.addEventListener('load', function () {
        FastClick.attach(document.body);
    }, false);
//--------------------------------------------------【变量】
    var isLogin,
        sysTime,startTime,endTime,
        activityData,
        inviteCode,phone,userShareBrand;

    var activityCode = '1511';
    var pageTabIndex = 0;
    userShareBrand = hrefParameter.get('shareBrand');
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
    var myPrizeUrl = base.switchUrl('m1511/myPrize');
    var shareImg = base.staticUrl('static/images/m1511/share-pic.png');

    myPrizeUrl = (sysTime > endTime) ? base.urlQuery(myPrizeUrl, 'isend=true') : base.urlQuery(myPrizeUrl, 'isend=false');
    myPrizeUrl = base.isApp ? base.urlQuery(myPrizeUrl, 'native_view=app&oauthToken='+base.token) : myPrizeUrl;
    var shareCurPage = {
            title: '双11理财秘籍，一般人我不告诉他！',
            desc: '挑战超高收益，拿红包、iPad mini2、乐视TV等大礼，钱庄为您备好了！',
            url: base.switchUrl('m1511/index')
        },
        shareTempOne = {
            title: '掐指一算，又到了虐单身狗的时候了，表怕，我们拯救你！',
            desc: '新手投资288元送红酒一瓶，更有iPad mini2、乐视TV等大礼任你拿！',
            url: invitePageUrl
        },
        shareTempTwo = {
            title: '如何能做一枚优雅不失风度的壕单身狗，看这里！',
            desc: '拿iPad mini2、乐视TV等，新手投资收益更高，更有大礼相送！',
            url: invitePageUrl
        },
        shareTempThree = {
            title: '一个月总有这么一天，让你笑的合不拢腿！',
            desc: '钱庄日搭上双11，超高收益加iPad mini2、乐视TV大礼全带走！',
            url: invitePageUrl
        },
        bbs = {
            title: '双11理财大餐，吃喝玩乐全带走！',
            url: 'http://bbs.qian360.com/app/index.html#&pageBbsDetailed?topicId=1776'
        },
        myPrize = {
            title: '我的奖品',
            url: myPrizeUrl+'&activityCode='+activityCode
        },
        share = {};

    if(sysTime < startTime || sysTime > endTime){
        share = shareCurPage;
    }else{
        if(sysTime < (86400000 + startTime)){
            share = shareTempOne;
        }else if(sysTime > (endTime - 86400000)){
            share = shareTempThree;
            pageTabIndex = 2;
        }else{
            share = shareTempTwo;
            pageTabIndex = 1;
        }
    }


//--------------------------------------------------【selecter】
    var inviteBtn = $('#inviteBtn'),
        investBtn = $('.investBtn'),
        myPrizeBtn = $('#myPrizeBtn'),
        pokerRuleBtn = $('#pokerRuleBtn'),
        shareMask = $('#shareMask'),
        dailog = $('#dailog');

//--------------------------------------------------【event】
    // 通用弹框初始化
    var dialog = new Dialog({
        openfn: function(){
            $('.viewport').css('overflow-y', 'hidden')
        },
        closefn: function(){
            $('.viewport').css('overflow-y', 'scroll')
        }
    });
    // 通用弹窗方法
    function openDailog(contentstr){
        dialog.setcontent(contentstr).open();
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
    // 翻牌活动立即分享
    function shareEvent(shareBrand){
        if(!checkTimeEvent()){
            return;
        }
        if(base.isApp){
            hybridProtocol({
                tagName: 'getShare',
                data: {
                    dataUrl: "",
                    imgUrl: shareImg,
                    link: base.urlQuery(shareCurPage.url, 'shareBrand='+shareBrand),
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
                shareLink: base.urlQuery(shareCurPage.url, 'shareBrand='+shareBrand),
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
    // tab表单
    function Tab(param){
        var that = this;
        this.opt = {
            ctrl: $('.tab-ctrl li'),
            item: $('.tab-cont .tab-item'),
            beforefn: function(){},
            afterfn: function(){}
        };
        if(param){
            this.opt = $.extend(that.opt, param);
        }
        this.init();
    }
    Tab.prototype = {
        init: function(){
            this.ctrls = this.opt.ctrl;
            this.items = this.opt.item;
            this.index = this.opt.index || 0;
            this.switchItem();
            this.event();
        },
        event: function(){
            var that = this;
            this.ctrls.on('click', function(){
                that.opt.beforefn();
                that.index = $(this).index();
                that.switchItem();
            });
        },
        switchItem: function(){
            this.ctrls.removeClass('active');
            this.ctrls.eq(this.index).addClass('active');
            this.items.css('display', 'none');
            this.items.eq(this.index).css('display', 'block');
            this.opt.afterfn(this.index);
        }
    };

    var pokerPrizes =[
        '<p class="big">理</p>',
        '<p class="big">财</p>',
        '<p class="big">大</p>',
        '<p class="big">餐</p>',
        '<p class="big">不</p>',
        '<p class="big">二</p>',
        '<p class="big">之</p>',
        '<p class="big">选</p>',
        '<p class="small">1元红包</p>',
        '<p class="small">5元红包</p>'
    ];
    function Drawpoker(param){
        var that = this;
        this.opt = {
            pokerlists: $('.poker-list li'),
            pokerPrizes: pokerPrizes,
            drawendfn: function(){}
        };
        if(param){
            this.opt = $.extend(that.opt, param);
        }
        this.init();
    }
    Drawpoker.prototype = {
        init: function(){
            this.pokers = this.opt.pokerlists;
            this.pokerItems = this.pokers.find('.poker-item');
            this.pokerback = this.pokers.find('.poker-back');
            this.drawing = false;
            this.back = false;
            this.drawnum = 0;
            this.resultnum = null;
            this.event();
        },
        event: function(){
            var that = this;
            this.pokerItems.on('webkitTransitionEnd transitionend', function(){
                if(that.back){
                    that.pokerresult();
                    that.opt.drawendfn && that.opt.drawendfn();
                    that.runCallback && that.runCallback();
                }else{
                    that.pokerback.eq(that.drawnum).html('<div class="empty">?</div>');
                    that.drawing = false;
                    that.drawfacefn && that.drawfacefn();
                }
            })
        },
        run: function(pokernum, result, callback){
            if(this.drawing){return false;}
            this.drawing = true;
            this.drawnum = pokernum;
            this.drawback();
            this.resultnum = result;
            this.runCallback = callback;
        },
        drawback: function(){
            this.pokers.eq(this.drawnum).addClass('back');
            this.back = true;
        },
        drawface: function(callback){
            this.pokers.eq(this.drawnum).removeClass('back');
            this.back = false;
            this.drawfacefn = callback;
        },
        pokerresult: function(){
            if(this.resultnum != null){
                this.pokerback.eq(this.drawnum).html(this.opt.pokerPrizes[this.resultnum]);
            }
        }
    };
    // 翻牌规则弹窗
    var pokerRule = $('#pokerRule');
    function pokerRuleOpen(){
        pokerRule.removeClass('ui-dialog-hide');
        $('.viewport').css('overflow-y', 'hidden');
    }
    function pokerRuleClose(){
        pokerRule.addClass('ui-dialog-hide');
        $('.viewport').css('overflow-y', 'auto');
    }
//--------------------------------------------------【hander】
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
    $('#hnpage').on('click', function(){
        base.checkAppEvent('http://bbs.qian360.com/app/index.html#&pageBbsDetailed?topicId=1777', '“千年南海·梦”生命健康细胞净化之旅');
    });
    // 翻牌规则控制开关
    pokerRule.find('.ui-dialog-btn').on('click', function(){
        pokerRuleClose();
    });
    pokerRuleBtn.on('click', pokerRuleOpen);
    // tab 控制
    var tabone = true;
    var tab = new Tab({
        index: pageTabIndex,
        afterfn:function(num){
                if(num == 1 && tabone){
                    tabone = false;
                    switchPoker();
                }
            }
    });
    // tabctrl 悬浮
    var mainTab = $('#mainTab'),
        subTab = $('#subTab'),
        subTabLi = subTab.find('li');
    var navTop = mainTab.offset().top;
    $('.viewport').on('scroll', function(){
        var _scrollTop = $(this).scrollTop();
        if(_scrollTop >= navTop){
            subTab.css('display','block');
            subTabLi.removeClass('active').eq(tab.index).addClass('active');
            mainTab.css('visibility','hidden');
        }else{
            subTab.css('display','none');
            mainTab.css('visibility','visible');
        }
    });
    subTabLi.on('click', function(){
        var index = $(this).index();
        subTabLi.removeClass('active').eq(index).addClass('active');
        tab.index = index;
        tab.switchItem();
        $('.viewport').scrollTop(navTop);
    });

    // 分享成功码确认
    if(userShareBrand){
        $.ajax({
            url: pageUrl.checkShare.url,
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
//--------------------------------------------------【翻牌活动】
    function switchPoker(){
        var havePokerNum = $('#havePokerNum'),
            pokerLoading = $('#pokerLoading'),
            pokerBox = $('#pokerBox'),
            exchangeBtn = $('#exchangeBtn'),
            userPoker = $('.user-poker'),
            hideCls = 'ui-hide';

        var pokerlist = $('.poker-list li'),
            pokerlistinner = pokerlist.find('.poker-inner'),
            pokerlistbg = pokerlist.find('.poker-face-bg'),
            drawing = false,
            ispoker = true,
            curpokernum,
            pokerNum,
            drawpoker,pokerData;

        var dialogPokerCont = '';
        var pokerRusultDialog = new Dialog({
            btns: [{
                cls: 'btn',
                text: '朕知道了',
                callback: function(){
                    pokerRusultDialog.close();
                    drawpoker.drawface(function(){
                        drawing = false;
                        pokerlistbg.eq(curpokernum).css('display','block');
                        pokerlistinner.eq(curpokernum).css('opacity',0);
                    });
                }
            }],
            openfn: function(){
                $('.viewport').css('overflow-y', 'hidden')
            },
            closefn: function(){
                $('.viewport').css('overflow-y', 'scroll')
            }
        });
        function pokerBoxInit(){
            if(isLogin){
                $.ajax({
                    url: pageUrl.lotteryTimes.url,
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
                            pokerData = data.resultData;
                            initUserPokers();
                        }
                        exchangeState();
                        pokerLoading.addClass(hideCls);
                        pokerBox.removeClass(hideCls);
                    }
                });
            }else{
                pokerLoading.addClass(hideCls);
                pokerBox.removeClass(hideCls);
            }
        }
        function initUserPokers(){
            havePokerNum.html(pokerData.times);
            var history = pokerData.lotteryHistory,
                historyLen = history.length;
            if(historyLen>0){
                for(var i = 0; i < historyLen; i++){
                    userPoker.find('li[data-prize="'+history[i]['prize']+'"]').addClass('user-poker-active');
                }
            }
        }
        function renderUserPokers(){
            havePokerNum.html(pokerData.times);
            if(ispoker) {
                userPoker.find('li[data-prize="' + pokerData.code + '"]').addClass('user-poker-active');
            }
        }
        function dataFomat(){
            ispoker = true;
            switch(pokerData.code){
                case '1元红包':
                    ispoker = false;
                    pokerNum = 8;
                    break;
                case '5元红包':
                    ispoker = false;
                    pokerNum = 9;
                    break;
                case '理':
                    pokerNum = 0;
                    break;
                case '财':
                    pokerNum = 1;
                    break;
                case '大':
                    pokerNum = 2;
                    break;
                case '餐':
                    pokerNum = 3;
                    break;
                case '不':
                    pokerNum = 4;
                    break;
                case '二':
                    pokerNum = 5;
                    break;
                case '之':
                    pokerNum = 6;
                    break;
                case '选':
                    pokerNum = 7;
                    break;
            }
            if(ispoker){
                dialogPokerCont = '<p class="dialog-ch">恭喜您获得幸运文字</p><div class="prize-str">'+pokerData.code+'</div>';
            }else if(pokerNum == 8){
                dialogPokerCont = '<p class="dialog-ch">恭喜您获得红包</p><div class="prize-pic"></div><p class="dialog-ch"><strong>1元</strong><br/>（已发到个人账户）</p>';
            }else if(pokerNum == 9){
                dialogPokerCont = '<p class="dialog-ch">恭喜您获得红包</p><div class="prize-pic"></div><p class="dialog-ch"><strong>5元</strong><br/>（已发到个人账户）</p>';
            }
        }
        function exchangeState(){
            var _num = userPoker.find('.user-poker-active').length;
            if(_num == 8){
                exchangeBtn.removeClass('disabled-btn').addClass('abled-btn');
            }else{
                exchangeBtn.addClass('disabled-btn').removeClass('abled-btn');
            }
        }
        pokerBoxInit();
        pokerlist.on('click', function(){
            if(!isLogin){
                base.gotoLogin();
                return false;
            }
            if(checkTimeEvent()){
                if(drawing){return false;}
                if(pokerData.times && pokerData.times > 0 ){
                    drawing = true;
                    curpokernum = $(this).index();
                    $.ajax({
                        url: pageUrl.lottery.url,
                        type: "post",
                        data: {
                            tokenStr: pokerData.tokenStr,
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
                                pokerData = data.resultData;
                                dataFomat();
                                pokerlistinner.eq(curpokernum).css('opacity',1);
                                pokerlistbg.eq(curpokernum).css('display','none');
                                drawpoker = drawpoker || new Drawpoker();
                                drawpoker.run(curpokernum,pokerNum,function(){
                                    pokerRusultDialog.setcontent(dialogPokerCont).open();
                                    renderUserPokers();
                                });
                                exchangeState();
                            }else{
                                openDailog('<p class="dialog-cp">'+data.resultMsg+'</p>');
                            }
                        }
                    });
                }else if(pokerData.gotTimes < 10){
                    openDailog('<p class="dialog-ch strong">糟糕！翻牌次数已用完！</p><p class="dialog-cp">成功分享活动可再翻2次。<br>单笔每投5000元可再翻1次。</p>')
                }else{
                    openDailog('<p class="dialog-ch strong">今日翻牌机会用完了！<br>明天再来吧~</p>')
                }
            }
        });
        var sharebrand = '';
        $('#shareCurPage').on('click', function(){
            checkLoginEvent(function(){
                if(!sharebrand){
                // 分享码
                    $.ajax({
                        url: pageUrl.share.url,
                        type: "post",
                        data: {
                            oauthToken: base.token,
                            native_view: (base.isApp ? 'app' : ''),
                            activityCode: activityCode
                        },
                        xhrFields: {
                            withCredentials: true
                        },
                        async: false,
                        dataType: "json",
                        success: function (data) {
                            if (data.resultCode == 1) {
                                sharebrand = data.resultData
                            }
                        }
                    });
                }
                shareEvent(sharebrand);
            });
        });

        var checkAdress,exchangeDialog;
        exchangeBtn.on('click', function(){
            if(exchangeBtn.hasClass('disabled-btn')){
                return false;
            }
            checkAdress = checkAdress || new CheckAddress({
                    token: base.token,
                    activityCode: activityCode
                });
            exchangeDialog = exchangeDialog || new Dialog({
                btns: [{
                    cls: 'btn',
                    text: '填地址 领奖品',
                    callback: function(){
                        exchangeDialog.close();
                        checkAdress.showCont();
                    }
                }],
                openfn: function(){
                    $('.viewport').css('overflow-y', 'hidden')
                },
                closefn: function(){
                    $('.viewport').css('overflow-y', 'scroll')
                }
            });
            exchangeDialog.setcontent('<p class="dialog-ch">恭喜您获得神秘大礼</p><div class="prize-pic1"></div><p class="dialog-ch strong">一箱干红</p>').open();

        });
    }
});