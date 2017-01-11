/**
 * Created by Administrator on 2017/1/3.
 */
define(function (require) {
    require('zepto.min');
    require('fastclick');
    //依赖

    var Vue = require('vue');
    var shareInit = require('share-init'),

        pageUrl = require('url-map'),
        base = require('base'),
        slotMachine = require('raffle-slotMachine'),
        hybridProtocol = require('native-calls');

    // fastclick代替zepto的tap,防止点透bug
    window.addEventListener('load', function () {
        FastClick.attach(document.body);
    }, false);
    var shareImg = location.protocol + '//' + location.host + $('#sharePic').val(),
        curPageUrl = window.location.href;
    var activityCode = '20160408',
        isLogin = base.checkLogin(),
        activityData = base.activityData(activityCode),
        inviteCode,
        phone;
    if(isLogin){
        inviteCode = activityData.inviteCode;  //邀请人的关系
        phone = activityData.phone;            //邀请人的手机号码
    }
    var shareCurPage = {
        title: '这个188元新手注册礼，我一定要分享给你！',
        desc: '注册30秒，奖励188元，只要想理财，福利你拿走！',
        url: base.switchUrl('m' + 20170106 + '/index'),
        url1: base.switchUrl ('register','activityCode=20170106&phone='+phone+'&inviteCode='+inviteCode)
    };
    shareInit({
        isApp: base.isApp,
        dataUrl: "",
        imgUrl: shareImg,             //分享图片
        shareLink:shareCurPage.url ,   //分享链接
        curLink: curPageUrl,          //本地链接
        title: shareCurPage.title,    //分享标题
        desc: shareCurPage.desc,      //分享文案
        type: ""
    });
    new Vue({
        el: 'body',
        data: {
            poker:false,
            inviteCode:'',
            phone:''
        },
        ready: function () {
            var _this = this;

        },
        methods: {
            gotograb:function(){
                base.checkAppEvent('https://mall.qian360.com/grab.html?id=1', '一元夺宝');
            },
            pokers:function(){
                var _this = this;
                _this.poker = false;
            },
            btn:function(){
                var _this = this;
                if(!isLogin){
                    base.gotoLogin();
                    return;
                }
                if(base.isApp){
                    hybridProtocol({
                        tagName: 'getShare',
                        data: {
                            dataUrl: "",
                            imgUrl: shareImg,             //分享图片
                            link: shareCurPage.url1,       //分享链接
                            title:shareCurPage.title,    //分享标题
                            desc: shareCurPage.desc,      //分享文案
                            type: ""
                        },
                        success: function (data) {},
                        error: function (data) {}
                    });
                }else{
                    _this.poker = true;
                    shareInit({
                        isApp: base.isApp,
                        dataUrl: "",
                        imgUrl: shareImg,             //分享图片
                        shareLink: shareCurPage.url1,  //分享链接
                        curLink: curPageUrl,          //本地链接
                        title: shareCurPage.title,    //分享标题
                        desc: shareCurPage.desc,      //分享文案
                        type: ""
                    });
                }
            }
        }
    });
});
