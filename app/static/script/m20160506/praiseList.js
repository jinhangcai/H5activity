define(function (require) {
    require('zepto.min');
    require('fastclick');
    require('handlebars');
    //依赖
    var shareInit = require('share-init'),
        base = require('base'),
        CheckAddress = require('check_address_moudle'),
        hybridProtocol = require('native-calls'),
        pageUrl = require('url-map'),
        hrefParameter = require('href-parameter');


    // fastclick代替zepto的tap,防止点透bug
    window.addEventListener('load', function () {
        FastClick.attach(document.body);
    }, false);

//--------------------------------------------------【ajax api】

    var ajaxApi = {
        //我的画作
        myPic: pageUrl.apiUrl.url + '/activity/monthlyActivity/myPic.html',
        // 集赞接口
        integralHistory: pageUrl.apiUrl.url + '/activity/monthlyActivity/integralHistory.html'
    };
//--------------------------------------------------【变量】
    var activityCode='20160506',shareBrand='',
        activityData = base.activityData(activityCode),
        sysTime = activityData.systemTime,      //系统时间
        startTime = activityData.startDate,     //开始时间
        endTime = activityData.endDate,         //结束时间

        inviteCode = activityData.inviteCode,
        phone = activityData.phone;

    var isLogin = activityData.phone ? 'app' : '';

    // 邀请好友链接
    var invitePageUrl = base.switchUrl('register', 'inviteCode='+inviteCode+'&phone='+phone+'&activityCode='+activityCode+'&channelsCode=mqjyq');
    // 获取用户分享唯一标识 shareBrand
    if(isLogin){
        $.ajax({
            url: pageUrl.userShare.url,
            type: "post",
            data: {
                oauthToken: base.token,
                activityCode: activityCode,
                native_view: base.isApp
            },
            xhrFields: {
                withCredentials: true
            },
            dataType: "json",
            async: false,
            success: function (data) {
                if(data.resultCode == 1){
                    shareBrand = data.resultData
                }
            }
        });
    }
    var curPageUrl = window.location.href;

    //分享文案
    var shareCurPage = {
        title: '母亲节礼物出新招，99%的妈妈看了都笑了，不信你来试试！',
        desc: '什么样的礼物最能代表你的心，这里有最真诚最美丽的母亲节礼物，也有送你的礼物哦！',
        url: base.switchUrl('m20160506/index','shareBrand='+shareBrand),
        img: location.protocol + '//' + location.host + $('#sharePic').val()
    };

    var shareMask = $('#shareMask');
    function share(){
        if(base.isApp){
            hybridProtocol({
                tagName: 'getShare',
                data: {
                    dataUrl: "",
                    imgUrl: shareCurPage.img,
                    link: shareCurPage.url,
                    title: shareCurPage.title,
                    desc: shareCurPage.desc,
                    type: ""
                },
                success: function (data) {},
                error: function (data) {}
            });
        }else{
            shareInit({
                isApp: base.isApp,
                dataUrl: "",
                imgUrl: shareCurPage.img,     //分享图片
                shareLink: shareCurPage.url,  //分享链接
                curLink: curPageUrl,      //本地链接
                title: shareCurPage.title,    //分享标题
                desc: shareCurPage.desc,      //分享文案
                type: ""
            });
            shareMask.css('display','block')
        }
    }
    // 点击关闭分享遮罩
    shareMask.on('click', function(){
        shareMask.css('display','none')
    });

    // 影藏元素 classname
    var hideCls = 'hide';
    // loding 图层
    var body = $('body'),loading = $('#loadpage'),
        btns = $('.btn');

    if(sysTime >= startTime && sysTime<= endTime){
        btns.removeClass('disabled');
        btns.on('click', function(){
            var _this = $(this),
                thisId = _this.attr('id');
            switch (thisId){
                case 'help':
                    gohelp();
                    break;
                case 'self':
                    goself();
                    break;
                case 'share':
                    goshare();
                    break;
                case 'tender':
                    gotender();
                    break;
                case 'invite':
                    goinvite();
                    break;
            }
        })
    }
    var commonData = {
        helpNum: 0,
        selfNum: 0,
        shareNum: 0,
        tenderNum: 0,
        inviteNum: 0
    };
    $.ajax({
        url: ajaxApi.integralHistory,
        type: "post",
        data: {
            activityCode: activityCode,
            native_view: base.isApp,
            oauthToken:  base.token
        },
        xhrFields: {
            withCredentials: true
        },
        dataType: "json",
        success: function(data){
            if(data.resultCode == 1 && data.resultData){
                var _data = data.resultData,
                    len = _data.length,
                    i;
                for(i = 0; i<len; i++){
                    switch (_data[i].type){
                        case 'help':
                            commonData.helpNum += _data[i].integral;
                            break;
                        case 'self':
                            commonData.selfNum += _data[i].integral;
                            break;
                        case 'share':
                            commonData.shareNum += _data[i].integral;
                            break;
                        case 'tender':
                            commonData.tenderNum += _data[i].integral;
                            break;
                        case 'invite':
                        case 'invite_realname':
                            commonData.inviteNum += _data[i].integral;
                            break;
                    }
                }
                for(var key in commonData){
                    $('#'+key).html(commonData[key])
                }
            }
        }
    });

    var mydata = {};
    //用户的画作数据
    $.ajax({
        url: ajaxApi.myPic,
        type: "post",
        data: {
            activityCode: activityCode,
            native_view: base.isApp,
            oauthToken:  base.token
        },
        xhrFields: {
            withCredentials: true
        },
        dataType: "json",
        success: function (data) {
            if(data.resultCode == 1 && data.resultData){
                mydata = data.resultData;
            }
        }
    });

    // 找朋友帮忙
    function gohelp(){
        var _tit = '听说朋友圈的孩子，都送这个给妈妈！请大家帮我瞧瞧，妈妈会喜欢吗？',
            _desc = '画作虽小，却有一颗承载着亲情的爱心，朋友们请来见证我对妈妈的爱！',
            _img = 'http://file.qian360.com/'+mydata.picUrl+'@200w_1wh.jpg?t='+mydata.updateTime,
            _url = base.switchUrl('m20160506/index','shareId='+mydata.id);

        if(base.isApp){
            hybridProtocol({
                tagName: 'getShare',
                data: {
                    dataUrl: "",
                    imgUrl: _img,
                    link: _url,
                    title: _tit,
                    desc: _desc,
                    type: ""
                },
                success: function (data) {},
                error: function (data) {}
            });
        }else{
            shareInit({
                isApp: base.isApp,
                dataUrl: "",
                imgUrl: _img,
                shareLink: _url,
                curLink: curPageUrl,
                title: _tit,
                desc: _desc,
                type: ""
            });
            shareMask.css('display','block');
        }
    }
    // 去点赞
    function goself(){
        base.goHistory();
    }
    // 去分享
    function goshare(){
        share();
    }
    // 去投资
    function gotender(){
        base.gotoProductList();
    }
    // 去邀请
    function goinvite(){
        if(base.isApp){
            hybridProtocol({
                tagName: 'getShare',
                data: {
                    dataUrl: "",
                    imgUrl: shareCurPage.img,
                    link: invitePageUrl,
                    title: shareCurPage.title,
                    desc: shareCurPage.desc,
                    type: ""
                },
                success: function (data) {},
                error: function (data) {}
            });
        }else{
            shareInit({
                isApp: base.isApp,
                dataUrl: "",
                imgUrl: shareCurPage.img,
                shareLink: invitePageUrl,
                curLink: curPageUrl,
                title: shareCurPage.title,
                desc: shareCurPage.desc,
                type: ""
            });
            shareMask.css('display','block');
        }
    }
});