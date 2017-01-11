/**
 * 手机活动页
 * @name 根据网页的媒介做不同的分享调用
 * @description 单页js
 * @date 2015-06-08
 */
(function (root, factory) {
    if (typeof define === 'function' && (define.amd || define.cmd)) {
        define(function (require, exports, module) {
            var hybridProtocol = require('native-calls');
            var wx = require('jweixin-1.0.0');
            return factory(root, hybridProtocol, wx);
        });
    } else {
        root.qianShare = factory(root,hybridProtocol);
    }
})(this, function (root, hybridProtocol, wx) {
    var qianShare=function(shareConfig){
        if (shareConfig.isApp) {
            hybridProtocol({
                tagName: 'switch',
                data: {
                    type: 'share',
                    state: 1
                }
            });
            hybridProtocol({
                tagName: 'getParam',
                data: {
                    type: 'share',
                    data: {
                        title: shareConfig.title,
                        desc: shareConfig.desc,
                        link: shareConfig.shareLink,
                        imgUrl: shareConfig.imgUrl
                    }
                }
            });
        } else {

            $.ajax({
                type: 'post',
                url: "/api/wx/getConfig.html",
                dataType: 'json',
                data: {
                    shareurl: shareConfig.curLink
                },
                success: function (data) {
                    wx.config({
                        //debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                        appId: data.resultData.jsconfig.appid, // 必填，公众号的唯一标识
                        timestamp: data.resultData.jsconfig.timestamp, // 必填，生成签名的时间戳
                        nonceStr: data.resultData.jsconfig.nonceStr, // 必填，生成签名的随机串
                        signature: data.resultData.jsconfig.signature,// 必填，签名，见附录1
                        jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
                    });
				
                    wx.ready(function () {
                        //===>分享到朋友圈
                        wx.onMenuShareTimeline({
                            title: shareConfig.title,
                            link: shareConfig.shareLink,
                            imgUrl: shareConfig.imgUrl,
                            success: shareConfig.success,
                            cancel: shareConfig.cancel
                        });
                        //===>分享给朋友
                        wx.onMenuShareAppMessage({
                            title: shareConfig.title,
                            desc: shareConfig.desc,
                            link: shareConfig.shareLink,
                            imgUrl: shareConfig.imgUrl,
                            type: shareConfig.type,
                            dataUrl: shareConfig.dataUrl,
                            success: shareConfig.success,
                            cancel: shareConfig.cancel
                        });
                        //===>分享给QQ
                        wx.onMenuShareQQ({
                            title: shareConfig.title,
                            desc: shareConfig.desc,
                            link: shareConfig.shareLink,
                            imgUrl: shareConfig.imgUrl,
                            success: shareConfig.success,
                            cancel: shareConfig.cancel
                        });
                        //===>分享到腾讯微博
                        wx.onMenuShareWeibo({
                            title: shareConfig.title,
                            desc: shareConfig.desc,
                            link: shareConfig.shareLink,
                            imgUrl: shareConfig.imgUrl,
                            success: shareConfig.success,
                            cancel: shareConfig.cancel
                        });
                    });
                },
                timeout: 50000,
                error: function () {
                    //alert('请求超时');
                }
            });
        }
    };
    return qianShare;
});
