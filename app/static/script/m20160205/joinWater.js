define(function (require) {
//--------------------------------------------------【require】
    require('zepto.min');
    require('fastclick');
    //引入依赖
    var base = require('base');
    var shareInit = require('share-init'),
        Dialog = require('activity-dialog'),
        pageUrl = require('url-map'),
        hrefParameter = require('href-parameter');

    // fastclick代替zepto的tap,防止点透bug
    window.addEventListener('load', function () {
        FastClick.attach(document.body);
    }, false);
//--------------------------------------------------【变量】
    var isLogin,
        sysTime,startTime,endTime,
        activityData,
        phone,inviteCode;

    var activityCode = '20160205';
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

    var isApp = base.isApp ? 'app' : '';
    activityData = base.activityData(activityCode);
    sysTime = activityData.systemTime;
    startTime = activityData.startDate;
    endTime = activityData.endDate;
    if(isLogin){
        inviteCode = activityData.inviteCode;
        phone = activityData.phone;
    }

    // 20160205活动
    // 接口列表
    var ajaxUrl = {
        helpGetIntegral:{
            url: pageUrl.apiUrl.url + '/activity/monthlyActivity/hello2016/helpGetIntegral.html'
        }
    };

    // 通用弹框初始化
    var commonDialog;
    function openDailog(titlestr, contentstr){
        commonDialog = commonDialog || new Dialog({
                btns: [{
                    cls: 'btn',
                    text: '好的',
                    callback: function(self){
                        self.close();
                    }
                }]
            });
        commonDialog.setcontent(contentstr).setheader(titlestr).open();
    }

//--------------------------------------------------【活动页面】
    var treeType = hrefParameter.get('treeType'),
        shareBrand = hrefParameter.get('shareBrand');

    var _html = '<div class="sky">';
    if(sysTime <= endTime){
        _html += '<div class="tit">' +
            '<a href="javascript:;" class="rule-btn">规则</a>' +
            '</div>';
    }
    _html += '</div><div class="greensward"></div>';
    if(sysTime <= endTime){
        _html += '<div class="tree tree'+treeType+'">' +
            '<div class="hang"></div>' +
            '</div>';
    }
    if(sysTime > endTime){
        _html += '<div class="end-cont"><p>本猴王回花果山了<br>五百年后再会</p>';
        if(!base.isApp){
            _html += '<a class="cont-download" href="http://a.app.qq.com/o/simple.jsp?pkgname=com.qz.qian&ckey=CK1304356609522">去钱庄网App参加更多活动</a>'
        }
        _html += '</div><div class="bottom-monkey2"></div>';
    }else{
        _html += '<div class="container">' +
            '<p class="cont">浇水献桃，先到先得</p>' +
            '<a href="javascript:;" class="img-btn">帮ta浇水</a>' +
            '<a href="javascript:;" class="btn entry-btn">进入游戏</a>' +
            '<div class="logo"></div>' +
            '</div>' +
            '<div class="peach p02"><i></i></div><div class="peach p03"><i></i></div>';
    }

    $('.stage').html(_html);
    var helpBtn = $('.img-btn'),
        entryBtn = $('.entry-btn'),
        ruleBtn = $('.rule-btn'),
        ruleBox = $('#ruleBox');

    // 特殊弹框说明内容设置上限
    var winH = $(window).height(),
        sepcWrap = $('.spec-dialog-wrap'),
        sepcCont = sepcWrap.find('.ui-dialog-content'),
        peachListHide = 'ui-dialog-hide';
    sepcCont.css({
        'max-height': winH * 0.8
    });
    // 特殊弹框关闭
    sepcWrap.find('.ui-dialog-close').on('click', function(){
        sepcWrap.addClass(peachListHide)
    });

    // 展开活动说明
    function showRule(){
        ruleBox.removeClass(peachListHide);
    }
    ruleBtn.on('click', showRule);
    entryBtn.on('click', function(){
        base.checkAppEvent(base.switchUrl('m20160205/entry'), '金猴献桃闹新春 钱庄送礼过大年')
    });
    var lock = false;
    helpBtn.on('click', function(){
        if(!isLogin){
            base.gotoLogin();
            return;
        }
        if(lock){
            return;
        }
        lock = true;
        $.ajax({
            url: ajaxUrl.helpGetIntegral.url,
            type: "post",
            data: {
                shareBrand: shareBrand,
                oauthToken: base.token,
                activityCode: activityCode,
                native_view: isApp
            },
            xhrFields: {
                withCredentials: true
            },
            dataType: "json",
            async: false,
            success: function (data) {
                lock = false;
                checkWaterFn(data.resultCode);
                if(data.resultCode == 1){
                    $('.peach').addClass('has-peach');
                }
            }
        });
    });
    // event
    function checkWaterFn(code){
        switch (code){
            case 1:
                openDailog('<div class="dialog-title-common">帮忙成功</div>','<div class="prize-cont"><p class="title">ta获得2个桃子，您获得1个桃子</p><div class="peach-send">x1</div></div>');
                break;
            case 2:
                openDailog('','<div class="cont">今日次数已用完，明天再来吧~</div>');
                break;
            case 3:
                openDailog('','<div class="cont">自己不能给自己浇水哦~</div>');
                break;
            case 4:
                openDailog('','<div class="cont">今天您已经帮ta浇过水了呢~</div>');
                break;
            default:
                openDailog('','<div class="cont">网络繁忙，请稍后再试试~</div>');
        }
    }

    $('#loadpage').css('display', 'none'); // 加载动画关闭
});