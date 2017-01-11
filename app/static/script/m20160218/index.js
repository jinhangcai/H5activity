define(function (require) {

    require('zepto.min');
    require('fastclick');
    //依赖
    var shareInit = require('share-init'),
        base = require('base'),
        CheckAddress = require('check_address_moudle');


    // fastclick代替zepto的tap,防止点透bug
    window.addEventListener('load', function () {
        FastClick.attach(document.body);
    }, false);

    //登入状态
    var isLogin,
        sysTime,startTime,
        activityData,
        activityCode='20160218';

    var shareImg = location.protocol + '//' + location.host + $('#sharePic').val();
    isLogin = base.checkLogin();
    activityData = base.activityData(activityCode);
    sysTime = activityData.systemTime;      //系统时间
    startTime = activityData.startDate;     //开始时间
    //endTime = activityData.endDate;         //结束时间

    // 收货地址按钮展示以及事件
    function checkAddressEvent(){
        if(sysTime < startTime){
            return;
        }
        var $body = $('body'),
            hasFootCls = 'has-foot',
            addressBtn = $('.foot-bar a');

        //显示浮动地址栏
        $body.addClass(hasFootCls);

        //点击收货地址
        addressBtn.on('click',function(){
            checkLoginEvent(addressEvent)
        });
    }
    checkAddressEvent();

    // 弹出收货地址
    var checkAddress;
    function addressEvent(){
        checkAddress = checkAddress || new CheckAddress({
                token: base.token,
                activityCode: activityCode
            });
        checkAddress.showCont();
    }
    // 检查是否登陆
    function checkLoginEvent(callback){
        if(!isLogin){
            base.gotoLogin();
            return false;
        }
        callback && callback()
    }

    // 跳转活动帖子
    $('.bbs').on('click', function(){
        base.checkAppEvent('https://bbs.qian360.com/app/index.html#&pageBbsDetailed?topicId=2316', '赏灯品酒拿红包，钱庄邀您一起闹元宵');
    });

    // ios app里活动无关声明
    if(base.isApp && base.isIOS()){
        $('body').addClass('isIOSApp')
    }

    var shareCurPage = {
            title: '您的元宵团圆宴已备好，快来钱庄品酒赏月吧！',
            desc: '三星Note3、Ipad mini2、精品红酒等元宵免费好礼，请点击领取！',
            url: base.switchUrl('m20160218/index')
        };
    //初始化分享组件
    var curPageUrl = window.location.href;
    shareInit({
        isApp: base.isApp,
        dataUrl: "",
        imgUrl: shareImg,             //分享图片
        shareLink: shareCurPage.url,  //分享链接
        curLink: curPageUrl,          //本地链接
        title: shareCurPage.title,    //分享标题
        desc: shareCurPage.desc,      //分享文案
        type: ""
    });
    function loadImg(url,callback){
        var img = new Image();
        img.onload = function(){
            callback && callback();
        };
        img.src = url;
    }
    function lazyImgs(){
        var imgs = $('.gift-list img');
        imgs.each(function(i, item){
            var self = $(item),
                dataSrc = self.attr('data-src');
            if(dataSrc){
                loadImg(dataSrc, function(){
                    self.attr('src', dataSrc).removeAttr('data-src');
                })
            }
        })
    }
    lazyImgs();
});
