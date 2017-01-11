define(function (require) {
//--------------------------------------------------【require】
    require('zepto.min');
    require('fastclick');
    //引入依赖
    var base = require('base');
    var hybridProtocol = require('native-calls'),
        shareInit = require('share-init'),
        Dialog = require('activity-dialog'),
        pageUrl = require('url-map'),
        hrefParameter = require('href-parameter'),
        CheckAddress = require('check_address_moudle');

    // fastclick代替zepto的tap,防止点透bug
    window.addEventListener('load', function () {
        FastClick.attach(document.body);
    }, false);
//--------------------------------------------------【变量】
    var isLogin,
        sysTime,startTime,endTime,
        activityData,
        phone;

    var activityCode = '20151225';
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
        //inviteCode = activityData.inviteCode;
        phone = activityData.phone;
    }
    var myPrizeUrl = base.switchUrl('m'+activityCode+'/myPrize');
    var shareImg = location.protocol + '//' + location.host + $('#sharePic').val();

    myPrizeUrl = (sysTime > endTime) ? base.urlQuery(myPrizeUrl, 'isend=true') : base.urlQuery(myPrizeUrl, 'isend=false');
    myPrizeUrl = base.isApp ? base.urlQuery(myPrizeUrl, 'native_view=app&oauthToken='+base.token) : myPrizeUrl;
    var shareCurPage = {
            url: base.switchUrl('m'+activityCode+'/index')
        },
        bbs = {
            title: '双“蛋”狂欢趴，新年惊喜天天拿！',
            url: 'http://bbs.qian360.com/app/index.html#&pageBbsDetailed?topicId=2076'
        },
        myPrize = {
            title: '我的奖品',
            url: myPrizeUrl+'&activityCode='+activityCode
        },
        share = {
            title: 'OMG！今年最大礼包还未领取！',
            desc: '双“蛋“理财趴已备好，Apple MacBook、50寸乐视TV大礼等你来拿！'
        };

    share.url = shareCurPage.url;

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
            text: '妥妥的',
            callback: function(self){
                self.close();
            }
        }]
    });
    function openDailog(contentstr){
        commonDialog.setcontent(contentstr).open();
    }

    // 需要登录的走这
    function checkLoginEvent(callback){
        if(!isLogin){
            base.gotoLogin();
            return false;
        }
        callback && callback();
    }
    // 跳转我的奖品
    function myPrizeEvent(){
        if(!checkTimeEvent(false,true)){
            return;
        }
        base.checkAppEvent(myPrize.url, myPrize.title)
    }
    // 跳转我的资产
    function userAccountEvent(){
        if(!checkTimeEvent(false,true)){
            return;
        }
        base.gotoUserAccount()
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
//--------------------------------------------------【砸蛋】
    function eggFrenzy(){
        var wrap = $('.activity-eggs'),
            hammer = $('#hammer'),
            eggs = $('.egg'),
            ableNum = $('#ableNum');
        var wrapX = wrap.offset().left,
            wrapY = wrap.offset().top;
        console.log(wrapX,wrapY)
        var _x = 0,_y = 0,isdown = false,isup = false;
        var isSmash = false,eggsNum = 0;

        var hasNum = 0,totalNum = 0,tokenStr= '';
        // 彩蛋初始化
        function eggsInit(){
            eggs.removeClass('smash-egg').removeClass('gift-smash-egg');
            isSmash = false;
        }
        // 客服弹出框
        var serviceDialog = new Dialog({
            btns: [{
                cls: 'btn',
                text: '点个赞，继续砸',
                callback: function(self){
                    eggsInit();
                    self.close();
                }
            }]
        });
        function openserviceDialog(contentstr){
            serviceDialog.setcontent(contentstr).open();
        }
        // 弹出奖品去填地址弹出框
        var checkAddress;
        var addressDialog = new Dialog({
            btns: [{
                cls: 'again',
                text: '继续砸',
                callback: function(self){
                    eggsInit();
                    self.close();
                }},
                {
                cls: 'address',
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
        // 去领取奖品弹出框
        var prizeDialog = new Dialog({
            btns: [{
                cls: 'again',
                text: '继续砸',
                callback: function(self){
                    eggsInit();
                    self.close();
                }},
                {
                    cls: 'address',
                    text: '查看我的红包',
                    callback: function(){
                        userAccountEvent();
                    }
                }]
        });
        function openprizeDialog(contentstr){
            prizeDialog.setcontent(contentstr).open();
        }
        // 随机客服
        var cusSer = [
            {
                'cont': '<div class="prize thumb01"></div><p class="cont">客服小莉：运气这事，主要看气质！</p>'
            },
            {
                'cont': '<div class="prize thumb02"></div><p class="cont">客服小晨：最爱不是剪刀手，<br/>是那些年和你一起剁的手！</p>'
            },
            {
                'cont': '<div class="prize thumb03"></div><p class="cont">客服梦梦：砸一砸提升颜值，oh yeah！</p>'
            },
            {
                'cont': '<div class="prize thumb04"></div><p class="cont">客服妙妙：姐的深情看起来很贵！</p>'
            }
        ],cusSerLen = cusSer.length;
        function randomNum(num){
            return Math.floor(Math.random()*num);
        }
        // 砸蛋结果弹框
        function frenzyResult(code){
            var _type = 1,_html = '';
            switch (code)
            {
                case '1元红包':
                    _type = 3;
                    _html = '<div class="prize"><div class="inner-red-packet"><div class="num">1</div><div class="sub">红包</div></div></div><p class="cont">恭喜您，获得1元红包</p>';
                    break;
                case '5元红包':
                    _type = 3;
                    _html = '<div class="prize"><div class="inner-red-packet"><div class="num">5</div><div class="sub">红包</div></div></div><p class="cont">恭喜您，获得5元红包</p>';
                    break;
                case '10元红包':
                    _type = 3;
                    _html = '<div class="prize"><div class="inner-red-packet"><div class="num">10</div><div class="sub">红包</div></div></div><p class="cont">恭喜您，获得10元红包</p>';
                    break;
                case '钱小二':
                    _html = '<div class="prize dolls"></div><p class="cont">恭喜您，获得钱小二1个</p>';
                    break;
                case '红酒一瓶':
                    _html = '<div class="prize red-wine"></div><p class="cont">恭喜您，获得红酒1瓶</p>';
                    break;
                case '保温杯':
                    _html = '<div class="prize cup"></div><p class="cont">恭喜您，获得保温杯1个</p>';
                    break;
                case '未中奖':
                    _type = 2;
                    _html = cusSer[randomNum(cusSerLen)]['cont'];
                    break;
                default:
                    _html = '<p class="cont">'+code+'</p>';
            }

            // 蛋碎碎啊
            var smashCls = 'smash-egg';
            if(_type == 1 || _type == 3){
                smashCls = 'gift-smash-egg'
            }
            setTimeout(function(){
                eggs.eq(eggsNum).addClass(smashCls);
            },200);
            // 200毫秒后弹框 并释放砸蛋效果
            setTimeout(function(){
                if(_type == 2){
                    openserviceDialog(_html)
                }else if(_type == 3){
                    openprizeDialog(_html)
                }else{
                    openaddressDialog(_html)
                }
                // 弹出提示框之后释放 砸蛋效果
                isSmash = false;
            },500)
        }
        // 数据显示
        function eggsRender(){
            ableNum.html(hasNum)
        }
        // 砸蛋请求
        function frenzy(){
            if(isSmash){return false;}
            $.ajax({
                url: pageUrl.userLottery.url,
                type: "post",
                data: {
                    oauthToken: base.token,
                    native_view: (base.isApp ? 'app' : ''),
                    activityCode: activityCode,
                    tokenStr: tokenStr,
                    lotteryType: 'lottery'
                },
                xhrFields: {
                    withCredentials: true
                },
                dataType: "json",
                beforeSend: function(){
                    isSmash = true;
                },
                success: function (data) {
                    if (data.resultCode == 1) {
                        hasNum = data.resultData.times;
                        tokenStr = data.resultData.tokenStr;
                        totalNum = data.resultData.gotTimes;
                        eggsRender();
                        frenzyResult(data.resultData.code);
                    }else{
                        frenzyResult(data.resultMsg);
                    }
                },
                error: function(){
                    openDailog('<p class="cont">服务器繁忙，请重试</p>')
                }
            });
        }
        // 砸蛋方法绑定
        function eggsEvent(){
            wrap.on('click', function(e){
                if(isdown || isup){
                    return false;
                }
                isdown = true;
                _x = e.pageX - wrapX;
                _y = e.pageY - wrapY;
                console.log(e.pageX+'----', e.pageY+'----',wrapX+'----',wrapY+'----',_x+'----',_y+'----')
                hammer.css({
                    'top': _y,
                    'left': _x,
                    '-webkit-transform': 'rotate(-60deg) translate(-0%, -70%)',
                    'transform': 'rotate(-60deg) translate(-0%, -70%)'
                });
            });
            eggs.on('click', function(){
                if(!checkTimeEvent()){
                    return true;
                }
                if(!isLogin){
                    base.gotoLogin();
                    return true;
                }
                if(hasNum<=0){
                    if(totalNum<7){
                        openDailog('<p class="cont">投资或分享活动均可获得砸蛋机会</p>')
                    }else{
                        openDailog('<p class="cont">今日机会已用完<br/>明天再来吧~</p>');
                    }
                    return true;
                }
                eggsNum = $(this).parent().index();
                frenzy();
            });
            hammer.on('transitionEnd webkitTransitionEnd', function(){
                if(isdown){
                    hammer.css({
                        'top': _y,
                        'left': _x,
                        '-webkit-transform': 'rotate(30deg) translate(-0%, -70%)',
                        'transform': 'rotate(30deg) translate(-0%, -70%)'
                    });
                    isdown = false;
                    isup = true;
                }
                if(isup){
                    isup = false;
                }
            })
        }
        // 彩蛋数据初始化
        function dataInit(){
            if(sysTime<startTime || sysTime>endTime){
                eggsEvent();
                return;
            }
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
                    if (data.resultCode == 1) {
                        hasNum = data.resultData.times;
                        tokenStr = data.resultData.tokenStr;
                        totalNum = data.resultData.gotTimes;
                        eggsRender();
                    }
                },
                error: function(){
                    openDailog('<p class="cont">服务器繁忙，请重试</p>')
                },
                complete: function(){
                    eggsEvent();
                }
            });
        }
        dataInit();
    }
    eggFrenzy();
//--------------------------------------------------【累计投资】
    function totalInvestment(){
        if(!isLogin){return;}
        var assignDate = 1451059200000; // 2015/12/26 00:00:00
        if(sysTime < assignDate){return;}
        var userInvestment = $('#userInvestment');
        $.ajax({
            url: pageUrl.apiUrl.url+'/activity/monthActivity/totalTender20160101.html',
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
                    var _num = data.resultData;
                    if(_num > 0){
                        userInvestment.html(_num);
                        $('.invest-sum').css('display','block');
                    }
                }
            },
            error: function(){
            }
        });
    }
    totalInvestment();
//--------------------------------------------------【侧边浮动】
    function asideBar(){
        var body = $('body'),
            floor = $('.activity-item'),
            aside = $('.aside'),
            sideBtns = aside.find('a'),
            floorData = [];
        floor.each(function(i,item){
            if(i == 2){
                return;
            }
            floorData.push($(item).offset().top);
        });
        // 最后一个的下边界
        floorData.push(floorData[floorData.length-1]+floor.eq(floor.length-1).height());
        var floorLength = floorData.length;
        var winHeight = $(window).height(),
            halfHeight = winHeight/2,
            thirdHeight = winHeight/3;
        function scrollEvent(){
            var top = body.scrollTop(),
                i = 0;
            for(; i<floorLength; i++){
                if((top + thirdHeight)<=floorData[i]){
                    break;
                }
            }
            var cont = i-1<0 ? 0 : i-1;
            sideBtns.removeClass('active').eq(cont).addClass('active');
            // 超过一屏的时候显示侧边浮动栏目
            if(top >= halfHeight){
                aside.css('display','block')
            }else{
                aside.css('display','none')
            }
        }
        scrollEvent();
        sideBtns.on('click', function(){
            var index = $(this).index();
            body.scrollTop(floorData[index]-thirdHeight+10)
        });
        var timer = null;
        $(window).on('scroll', function(){
            clearTimeout(timer);
            timer = setTimeout(scrollEvent,100);
        })
    }
    asideBar();
//--------------------------------------------------【事件绑定】
    // 邀请好友
    $('#shareBtn').on('click', function(){
        checkLoginEvent(userShareEvent);
    });
    // 立即投资
    investBtn.on('click', function(){
        base.gotoProductList();
    });
    // 我的奖品
    $('#winRecord').on('click', function(){
        checkLoginEvent(myPrizeEvent);
    });
    myPrizeBtn.on('click', function(){
        checkLoginEvent(myPrizeEvent);
    });
    $('.bbs').on('click', function(){
        base.checkAppEvent(bbs.url, bbs.title);
    });
    $('#redpacketBtn').on('click', function(){
        base.checkAppEvent(bbs.url, bbs.title);
    });
    $('#mysteryGift').on('click', function(){
        base.checkAppEvent('http://bbs.qian360.com/app/index.html#&pageBbsDetailed?topicId=2077', '奖品，你说了算！ ');
    });

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

    // 登录时，获取分享码
    var sharebrand = '';
    if(isLogin){
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
    }else{
        shareEvent();
    }
    // 页面分享初始化
    function shareEvent(){
        shareInit({
            isApp: base.isApp,
            dataUrl: "",
            imgUrl: shareImg,
            shareLink: base.urlQuery(shareCurPage.url, 'shareBrand='+sharebrand),
            curLink: curPageUrl,
            title: share.title,
            desc: share.desc,
            type: ""
        });
    }
    // 主动分享
    function userShareEvent(){
        if(base.isApp){
            hybridProtocol({
                tagName: 'getShare',
                data: {
                    dataUrl: "",
                    imgUrl: shareImg,
                    link: base.urlQuery(shareCurPage.url, 'shareBrand='+sharebrand),
                    title: share.title,
                    desc: share.desc,
                    type: ""
                },
                success: function (data) {},
                error: function (data) {}
            });
        }else{
            shareMask.css('display','block');
        }
    }
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
        var imgs = $('.total-list img');
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
    // 砸蛋图片预先加载
    var smashEggPic = $('#smashEgg').val();
    loadImg(smashEggPic);
    var giftSmashEggPic = $('#giftSmashEgg').val();
    loadImg(giftSmashEggPic);
});