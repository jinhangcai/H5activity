/**
 * Created by wyj on 2015/10/30.
 */
define(function (require, exports, module) {
//--------------------------------------------------【require】
    require('zepto.min');
    var hrefParameter = require('href-parameter'),
        hybridProtocol = require('native-calls'),
        Cookie = require('cookie');

    var pageUrl = require('mock-url');
    //var pageUrl = require('url-map');
//--------------------------------------------------【公共参数方法】
    var urlProtocal = location.protocol,
        urlHost = location.host,
        prePageUrl = urlProtocal + '//' + urlHost + '/';

    var curPageUrl = window.location.href;
    // 是否来自 APP
    var isApp = hrefParameter.get('native_view') ? 'app' : '',
    // url 上的 token值，在APP中用来检查是否登陆 有时是 access_token 有时是 oauthToken
        token = hrefParameter.get('access_token') || hrefParameter.get('oauthToken') || Cookie.getCookie('oauthToken');
    var urlQuery = function(url, query){
        if(url.indexOf('?') != -1){
            return url + '&' + query
        }else{
            return url + '?' + query
        }
    };
    // 本地目录结构和线上目录结构不同，url地址有变化，用于地址的切换
    // route: 目标 /m1151/index.html 传入 m1151/index ; query为url参数 inviteCode=1511&phone=188*****
    var switchUrl = function(route, query){
        if(true){
            return query ? (prePageUrl + route +'.html?' + query) : (prePageUrl + route +'.html');
        }else{
            return query ? (pageUrl.pages.url + route + '&' + query) : (pageUrl.pages.url + route);
        }
    };
    // 资源路径转换 route:　"static/images/m1511/share-pic.png"
    var staticUrl = function(route){
        if(true){
            return prePageUrl + route;
        }else{
            return prePageUrl + 'themes/soonmes_qzw_v2/activity/monthlyActivity2/' + route;
        }
    };
    // 是否登陆
    var checkLogin = function(){
        var loged = false;
        if(!isApp){
            if (Cookie.getCookie('qz_h5_phone') && Cookie.getCookie('qz_h5_oauthToken')) {
                $.ajax({
                    url: pageUrl.h5CheckLogin.url,
                    type: "post",
                    data: {
                        oauthToken: Cookie.getCookie('qz_h5_oauthToken'),
                        appId: '20150720145313251618',
                        service: pageUrl.h5CheckLogin.service
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    dataType: "json",
                    async: false,
                    success: function (data) {
                        loged = (data.resultCode === 1)
                    }
                });
            }
        }else{
            $.ajax({
                url: pageUrl.appCheckLogin.url,
                type: "post",
                data: {
                    oauthToken: token,
                    native_view: (isApp ? 'app' : '')
                },
                xhrFields: {
                    withCredentials: true
                },
                dataType: "json",
                async: false,
                success: function (data) {
                    loged = (data.resultCode === 1)
                }
            });
        }
        return loged;
    };
    // 用户数据
    var activityData = function(activitycode){
        var data = {};
        $.ajax({
            url: pageUrl.activityData.url,
            type: "post",
            data: {
                native_view: (isApp ? 'app' : ''),
                oauthToken: token,
                activityCode: activitycode
            },
            xhrFields: {
                withCredentials: true
            },
            dataType: "json",
            async: false,
            success: function (d) {
                if (d.resultCode !== 0) {
                    data = d.resultData;
                }
            }
        });
        return data;
    };

    // 判断设备
    var ua = navigator.userAgent.toLowerCase();
    function isIOS(){
        return /iphone|ipad|ipod/.test(ua)
    }
    function isAndroid(){
        return /android/.test(ua)
    }
//--------------------------------------------------【页面跳转】
    //跳转app原生页面
    var goPage = function(type,url){
        hybridProtocol({
            tagName: 'openNativePage',
            data: {
                type:type,
                url:url
            }
        });
    };
    // app中跳转非原生页面
    var goWebPage = function(title, url){
        hybridProtocol({
            tagName: 'openWebPage',
            data: {
                title: title,
                url: url
            }
        });
    };
    // 跳转页面走这里
    var checkAppEvent = function(url, title){
        if(isApp){
            goWebPage(title, url);
        }else{
            window.location.href = url;
        }
    };
    // 跳转登录页面
    var gotoLogin = function(){
        if(isApp){
            goPage('login', curPageUrl);
        }else{
            window.location.href = pageUrl.h5loginPage.url;
        }
    };
    // 跳转产品列表页
    var gotoProductList = function(){
        if(isApp){
            goPage('productList', curPageUrl);
        }else{
            window.location.href = pageUrl.h5ProductList.url;
        }
    };
    // 跳转我的资产页
    var gotoUserAccount = function(){
        if(isApp){
            goPage('userAccount', curPageUrl);
        }else{
            window.location.href = pageUrl.h5UserAccount.url;
        }
    };
    // 返回上一页
    var goHistory = function(pagenum){
        if(isApp){
            hybridProtocol({
                tagName: 'history',
                data:{
                    go:-(pagenum || 1)
                },
                success: function (data) {},
                error: function (data) {}
            })
        }else{
            window.history.go(-(pagenum||1))
        }
    };
//--------------------------------------------------【工具方法】
    // 图片加载后回调
    function loadImg(url,callback){
        var img = new Image();
        img.onload = function(){
            callback && callback();
        };
        img.src = url;
    }

    module.exports = {
        isApp: isApp,
        isIOS: isIOS,
        isAndroid: isAndroid,
        token: token,
        prePageUrl: prePageUrl,
        hrefParameter: hrefParameter,
        hybridProtocol: hybridProtocol,
        checkLogin: checkLogin,
        activityData: activityData,
        goPage: goPage,
        goWebPage: goWebPage,
        gotoLogin: gotoLogin,
        gotoProductList: gotoProductList,
        gotoUserAccount: gotoUserAccount,
        goHistory: goHistory,
        checkAppEvent: checkAppEvent,
        switchUrl: switchUrl,
        staticUrl: staticUrl,
        urlQuery: urlQuery,
        loadImg: loadImg
    }
});