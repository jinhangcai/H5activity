define(function (require) {

    require('zepto.min');
    require('fastclick');
    //依赖
    var shareInit = require('share-init'),
        base = require('base'),
        pageUrl = require('url-map'),
        CheckAddress = require('check_address_moudle');


    // fastclick代替zepto的tap,防止点透bug
    window.addEventListener('load', function () {
        FastClick.attach(document.body);
    }, false);

    //分辨当天钱币是否领取,如领取则Gold-species标签下的p元素class为on,否则为go
    //分辨当天钱币是否领取,如领取则award标签下的div元素为guess,否则为guess-one
    var isLogin,
        sysTime,startTime,endTime,
        activityData,
        activityCode='20160205';

    var shareImg = location.protocol + '//' + location.host + $('#sharePic').val();
    isLogin = base.checkLogin();
    activityData = base.activityData(activityCode);
    sysTime = activityData.systemTime;      //系统时间
    startTime = activityData.startDate + 172800000;     //开始时间 0205 + 2day = 2007
    endTime = activityData.startDate + 518400000;
    // 20160205活动
    //   接口列表
    var ajaxUrl = {
        // 送钱接口
        sendMoney:{
            url: pageUrl.apiUrl.url + '/activity/monthlyActivity/hello2016/sendMoney.html'
        },
        // 历史记录
        sendMoneyHistory:{
            url: pageUrl.apiUrl.url + '/activity/monthlyActivity/hello2016/sendMoneyHistory.html'
        }
    };

    //判断活动是否开始
    //?native_view=app&oauthToken=8a8080125281e18e015281e18e8f0000
    function checkTimeEvent(){
        if(sysTime >= startTime && sysTime <= endTime){
            if(isLogin){
                winning();
            }else{
                $('.poker').css("display",'block');
            }
        }
    }
    checkTimeEvent();

     //金币中奖金币接口
    function winning(){
        $.ajax({
            url: ajaxUrl.sendMoney.url,
            type: "post",
            xhrFields: {
                withCredentials: true
            },
            data: {
                oauthToken: base.token,
                native_view: (base.isApp ? 'app' : ''),
                activityCode: activityCode
            },
            async: false,
            dataType: "json",
            success: function (data) {
               if(data.resultCode == 1){
                   var resultData = data.resultData;
                   //弹窗显示
                   $('.logged').css('display','block');
                   //页面停止滑动
                   $('.viewport').css('overflow-y',"hidden");
                   //动画效果调用
                   package(".cartoon",'.logged');
                   //数字跑马灯效果+金币
                   incremental($('.logged .int-money'),resultData,100,100);
                   //随机文案展示
                   $('.streamer span').html(random());
                   //动画效果结束操作
                   setTimeout(function(){
                       $('.logged').css({'display':'none',"opacity":1});
                       $('.viewport').css('overflow-y',"scroll");
                   },4000)
               }
            },
            error: function(){
                $('.logged img,.logged .out-money').css('visibility',"hidden");
                $('.logged .streamer').css('display',"none");
                $('.logged .int-money').html('服务器繁忙，请重试');
            }
        })
     }

    //历史中奖记录
    function history(){
        $.ajax({
            url: ajaxUrl.sendMoneyHistory.url,
            type: "post",
            xhrFields: {
                withCredentials: true
            },
            data: {
                oauthToken: base.token,
                native_view: (base.isApp ? 'app' : ''),
                activityCode: activityCode
            },
            dataType: "json",
            success: function (data) {
                var formatData = data.resultData;
                formatData.sort(function(a, b){
                   return a.addTime - b.addTime;
                });
                for(var i=0;i<formatData.length;i++){
                    if(formatData[i].number !== 0){
                        $('.Gold-species').eq(i).css('display','block').append("<p class='go'><span>"+formatData[i].number+"</span><br>钱币</p>");
                        $('.small-head .award').eq(i).find('.guess-one').removeClass('guess-one').addClass('guess').html('');
                    }else{
                        $('.Gold-species').eq(i).css({'display':'block','background':'#b3b3b3'}).append("<p class='on'>已错过</p>").find('.trigon').removeClass('trigon').addClass('trigon-one');
                    }
                }
            },
            error: function(){
                $('.logged img,.logged .out-money').css('visibility',"hidden");
                $('.logged .streamer').css('display',"none");
                $('.logged .int-money').html('服务器繁忙，请重试');
            }
        })
    }
    if(isLogin){
        history();
    }

    //动画效果
    function package(animations,Capacity){
       setTimeout(function(){
           $(animations).css({
               "-webkit-transition":"all .5s ease ",
               "-webkit-transform":"scale(1)",
               "transition":"all .5s ease ",
               "transform":"scale(1)"
           });
           $(Capacity).css({
               "-webkit-transition":"all 1s ease 5s",
               "transition":"all 1s ease 5s",
               "opacity":"0"
           });
       },1)
    }

    //弹窗生成随机文案和动画效果
    var rmd;
    function random(){
        rmd=['金猴送福吉祥到，新年快乐！','福到运到钱币到，请笑纳！','运气不错，恭喜发财！','猴年大吉，万事如意！','金猴来拜年，祝心想事成！','有钱币更要有家人，祝阖家欢乐！'];
        return rmd[Math.floor(Math.random()*5 + 1)];
    }

    //弹窗登入领金币
    $('.enter').on('click',function(){
        checkLoginEvent(base.gotoProductList);   //跳转登入地址
    });

    // 去桃子活动入口
    $('#gotoPeach').on('click', function(){
        base.checkAppEvent(base.switchUrl('m20160205/entry'), '金猴献桃闹新春 钱庄送礼过大年')
    });

    // 去积分商城
    $('.shop-sort a').on('click', function(){
        if(!isLogin){
            base.gotoLogin();
            return false;
        }
        var _href = $(this).attr('data-href');
        base.checkAppEvent(_href, '详情');
    });

    // 跳转论坛
    $('#bbsBtn').on('click', function(){
        base.checkAppEvent('https://bbs.qian360.com/app/index.html#&pageBbsDetailed?topicId=2279', '金猴献桃闹新春 钱庄送礼过大年')
    });

    //跳转收货地址
    var checkAddress;
    $('.address').on('click',function(){
        if(isLogin){
            //跳转收货地址
            checkAddress = checkAddress || new CheckAddress({
                    token: base.token,
                    activityCode: activityCode
                });
            checkAddress.showCont();
        }else{
            base.gotoLogin();   //去登陆
        }
    });
    function checkLoginEvent(callback){
        if(!isLogin){
            base.gotoLogin();
            return false;
        }
        callback && callback()
    }

    //跑马灯数字
    function incremental($scope, number, time, duration) {
        var time = time || 500,
            duration = duration || 100;
        var value = 0,
            radix =number/12;
        var timer = setInterval(function() {
            value += radix;
            $scope.text(value.toFixed(0));
            if (value > number) {
                $scope.text(number.toFixed(0));
                clearInterval(timer);
                $('.logged .out-money span').html(number.toFixed(0));
                $('.logged .out-money').css('visibility','visible');
            }
        }, duration);
    }

    //图片懒加载
    function loadImg(url,callback){
        var img = new Image();
        img.onload = function(){

            callback && callback();
        };
        img.src = url;
    }
    function lazyImgs(){
        var imgs = $('.shop-sort img');
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

    //分享文案
    var shareCurPage = {
        title: '小猴子给你送来了新年大礼包，这么丰厚，俺都不好意思了！',
        desc: '游戏嗨到爆，加息加不停，福利大放送，钱币兑豪礼1折起，错过再等500年！',
        url: base.switchUrl('m20160205/index')
    };
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
});
