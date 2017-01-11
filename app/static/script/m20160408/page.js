define(function (require) {

    require('zepto.min');
    require('fastclick');
    //依赖
    var shareInit = require('share-init'),
        base = require('base'),
        hybridProtocol = require('native-calls'),
        Dialog = require('activity-dialog');


    // fastclick代替zepto的tap,防止点透bug
    window.addEventListener('load', function () {
        FastClick.attach(document.body);
    }, false);
    var activityCode='20160408',
        isLogin = base.checkLogin(),
        activityData = base.activityData(activityCode),
        inviteCode,
        phone,
        sysTime = activityData.systemTime,      //系统时间
        startTime = activityData.startDate,     //开始时间
        endTime = activityData.endDate;         //结束时间
        if(isLogin){
            inviteCode = activityData.inviteCode;  //邀请人的关系
            phone = activityData.phone;            //邀请人的手机号码
        }
    function loadin(img,name){
        var commonDialog = new Dialog({
            btns: [{
                cls: 'btn',
                text: '我知道了',
                callback: function(self){
                    self.close();  //关闭弹窗
                }
            }]
        });
        function openDailog(contentstr){
            commonDialog.setcontent("<div class=boy><div class="+img+"></div><span>"+name+"</span></div>").open();
        }
        openDailog()
    }
    function Timestart(){
        //活动未开始已登入    //活动已开始已登入    //活动已结束已登入
       // ((sysTime < startTime)  || (sysTime >= startTime)  || (sysTime >= endTime)) &&
         if(!isLogin){
            $('#green').css('display','block');
            $('.envelopeson').css('padding-bottom','0');
            $('.titlerun').css('padding-top','.9rem');
            //$('.award .title').css({'margin-top':'0','padding-top':'0'});
           // $('.main .award .titleon').css({'padding-top':'.65rem'});

        }
    }
    Timestart();
    function checkTimeEvent(logged){
        // 活动未开始未登入   //活动已开始未登入  //活动已结束未登入
        //((sysTime < startTime) || ( sysTime >= startTime) || (sysTime > endTime)) &&
        if(!isLogin){
            base.gotoLogin();
            return false;
        }
        if(logged){
            //活动未开始已登入
           // userShareEvent();
            if(sysTime < startTime && isLogin){
                loadin('boyonin','活动未开始');
                return false;
            }
            // 活动已结束已登入
            if(sysTime > endTime && isLogin){
                loadin('gral','活动已结束');
                return false;
            }
            //活动已开始已登入
            if((sysTime >= startTime && sysTime < endTime) && isLogin){
                userShareEvent();
                return false;
            }
        }
    }
    //点击关闭弹窗分享蒙板
    $('.poker').on('click',function(){
        $('.poker').hide();
    });
    //新手奖励立即注册按钮
    $('#green').on('click',function(){
        var logged = false;
        checkTimeEvent(logged)
    });
    //邀请奖励立即注册按钮
    $('#invite').on('click',function(){
        var logged = true;
        checkTimeEvent(logged)
    });
    //微信端点击过立即邀请  -->右上角分享出去的是注册页
    //微信端没有点击过立即邀请  -->右上角分享出去的是活动页
    //APP端点击立即邀请 -->注册页
    //APP端口右上角邀请 -->活动页

    //分享
    var shareImg = location.protocol + '//' + location.host + $('#sharePic').val();
    var shareCurPage = {
        title: '这个188元新手注册礼，我一定要分享给你！',
        desc:  '注册30秒，奖励188元，只要想理财，福利你拿走！',
        url: base.switchUrl ('register','activityCode=20160408&phone='+phone+'&inviteCode='+inviteCode)
    };
    var curPageUrl = window.location.href,
        curPageUrllocal = curPageUrl.split("?")[0]+'?returnUrl=m20160408/index';
    shareInit({
        isApp: base.isApp,
        dataUrl: "",
        imgUrl: shareImg,             //分享图片
        shareLink:curPageUrllocal ,   //分享链接
        curLink: curPageUrl,          //本地链接
        title: shareCurPage.title,    //分享标题
        desc: shareCurPage.desc,      //分享文案
        type: ""
    });
    // 主动分享
    function userShareEvent(){
        if(base.isApp){
            hybridProtocol({
                tagName: 'getShare',
                data: {
                    dataUrl: "",
                    imgUrl: shareImg,             //分享图片
                    link: shareCurPage.url,       //分享链接
                    title:shareCurPage.title,    //分享标题
                    desc: shareCurPage.desc,      //分享文案
                    type: ""
                },
                success: function (data) {},
                error: function (data) {}
            });
        }else{
            $('.poker').show();
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
        }
    }
    //跳转到论坛地址
  $('.gobbs').on('click',function(){
      base.checkAppEvent('https://bbs.qian360.com/app/index.html?topicId=2451#&pageBbsDetailed', '钱庄社区')
  })
});
