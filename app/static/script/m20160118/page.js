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
        activityCode='20160118';

    var shareImg = location.protocol + '//' + location.host + $('#sharePic').val();
    isLogin = base.checkLogin();
    activityData = base.activityData(activityCode);
    sysTime = activityData.systemTime;      //系统时间
    startTime = activityData.startDate;     //开始时间
    //endTime = activityData.endDate;         //结束时间

    // 收货地址按钮展示以及事件
    var footerButton = $('.button');
    function checkTimeEvent(){
        if(sysTime >= startTime){
            footerButton.css('display','block');
            return true;
        }else{
            return false;
        }
    }
    checkTimeEvent();
     //点击收货地址
    var checkAddress;
    footerButton.on('click',function(){
        if(isLogin){
             //跳转收货地址
            checkAddress = checkAddress || new CheckAddress({
                    token: base.token,
                    activityCode: activityCode
                });
            checkAddress.showCont();
        }else{
            base.gotoLogin();   //跳转登入地址
        }
    });

    // 跳转活动bbs
    $('.bbs').on('click', function(){
        base.checkAppEvent('http://bbs.qian360.com/app/index.html#&pageBbsDetailed?topicId=2183', '钱庄派大礼,年货囤起来')
    });

    var shareCurPage = {
            title: '你妈喊你回家过年了！',
            desc: '带上年货大礼包，送给全家冬日的温暖……',
            url: base.switchUrl('m20160118/index')
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
        var imgs = $('.prize img');
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
