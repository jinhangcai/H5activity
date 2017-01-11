/**
 * 钱庄网
 * @name 首页js
 * @description 单页js
 * @date 2015-07-17
 * @version $V1.0$
 */
define(function (require) {
//--------------------------------------------------【引入依赖函数】
    require('zepto.min');
    require('fastclick');
    var base = require('base'),
        pageUrl = require('url-map'),
        hybridProtocol = require('native-calls'),
        hrefParameter = require('href-parameter');

    // fastclick代替zepto的tap,防止点透bug
    window.addEventListener('load', function () {
        FastClick.attach(document.body);
    }, false);

//--------------------------------------------------【render】

    var backBtn = $('#backBtn');
    var goback = hrefParameter.get('goback');
    var activeCode = hrefParameter.get('activityCode');

    var username = $('#username'),
        userphone = $('#userphone'),
        useraddress = $('#useraddress');
    $.ajax({
        type:'post',
        url: pageUrl.checkAddress.url,
        data: {
            native_view: (base.isApp ? 'app' : ''),
            oauthToken: base.token,
            activityCode: activeCode
        },
        async:false,
        xhrFields: {
            withCredentials: true
        },
        success: function(data) {
            var resultData;
            if(data.resultCode==0){ // 没有默认地址的
            }else if(data.resultCode==1){ // 有默认地址
                resultData = data.resultData;
                username.html(resultData.name);
                userphone.html(resultData.tel);
                useraddress.html(resultData.province+'-'+resultData.city+'-'+resultData.address);

            }else if(data.resultCode==2){ // 这次活动已经填写过地址的
                resultData = data.resultData;
                username.html(resultData.name);
                userphone.html(resultData.tel);
                useraddress.html(resultData.province+'-'+resultData.city+'-'+resultData.address);
            }else if(data.resultCode==3){ // 未登陆
                base.gotoLogin();
            }else{}
        }
    });

    if(activeCode && (goback == 'true')){
        backBtn.css('opacity', 1);
        btnEvent();
    }

    function btnEvent() {
//--------------------------------------------------【variable】
        var native_view = hrefParameter.get('native_view'),
            access_token = hrefParameter.get('oauthToken');
        var isApp = (native_view != '');

        if(!access_token){
            access_token = hrefParameter.get('access_token');
        }
        //跳转链接
        var jumpUrl = base.switchUrl('m'+activeCode+'/index');
        jumpUrl = isApp ? base.urlQuery(jumpUrl, 'native_view=app&access_token=' + access_token) : jumpUrl;
        jumpUrl = base.urlQuery(jumpUrl, 'activityCode='+activeCode);
        var title = require('active-names');

//--------------------------------------------------【unit】
        // 跳转非原生页面
        var goWebPage = function (title, url) {
            hybridProtocol({
                tagName: 'openWebPage',
                data: {
                    title: title,
                    url: url
                }
            });
        };
        // 跳转页面走这里
        var checkAppEvent = function (url, title) {
            if (isApp) {
                goWebPage(title, url);
            } else {
                window.location.href = url;
            }
        };
//--------------------------------------------------【event】
        backBtn.on('click', function () {
            if (!activeCode) {
                return;
            }
            checkAppEvent(jumpUrl, title['active' + activeCode]||'');
        });
    }
});
