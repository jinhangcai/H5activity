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
        Format = require('date-format'),
        hrefParameter = require('href-parameter'),
        sketch = require('sketch');


    // fastclick代替zepto的tap,防止点透bug
    window.addEventListener('load', function () {
        FastClick.attach(document.body);
    }, false);
//--------------------------------------------------【ajax api】

    var ajaxApi = {
        //我的画作
        myPic: pageUrl.apiUrl.url + '/activity/monthlyActivity/myPic.html',
        //好友点赞
        //likeStatus 0 未点赞 1已点赞
        clickLike: pageUrl.apiUrl.url + '/activity/monthlyActivity/clickLike.html',
        // 上传画作
        uploadPic: pageUrl.apiUrl.url + '/activity/monthlyActivity/uploadPic.html'
    };
//--------------------------------------------------【变量】
    var activityCode='20160506',
        activityData = base.activityData(activityCode),
        sysTime = activityData.systemTime,      //系统时间
        startTime = activityData.startDate,     //开始时间
        endTime = activityData.endDate;         //结束时间

    var isLogin = activityData.phone ? 'app' : '';

    var domWrap = $('.show-paint'),
        shareMask = $('#shareMask');
    //tpl 模板
    var showPaintTpl = $('#showPaintTpl').html(),
        showPaintHtml = Handlebars.compile(showPaintTpl),
        myPaintTpl = $('#myPaintTpl').html(),
        myPaintHtml = Handlebars.compile(myPaintTpl),
        mydata = {};

    Handlebars.registerHelper("endHide",function(){
        //活动结束后 影藏
        return sysTime>=endTime ? ' hide' : '';
    });
    // 弹框
    var dialogTpl = $('#dialogTpl').html(),
        dialogHtml = Handlebars.compile(dialogTpl);

    function dialog(opt){
        $('body').append(dialogHtml({
            content: opt.content,
            btnstatus: opt.status
        }));

        var dialog = $('.dialog-mask');

        dialog.find('.btn').eq(0).on('click', function(){
            dialog.remove();
        });

        dialog.find('.btn-gray').on('click', function(){
            opt.yesFn && opt.yesFn();
            dialog.remove();
        })
    }
//--------------------------------------------------【流程控制】
    if(!isLogin){ // 未登录 去登录
        base.gotoLogin();
        return false;
    }
    var tokenStr = '';
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
                tokenStr = mydata.tokenStr;
                // 有画作
                showMyPaint(mydata)
            }else{
                // 没有画作
                draw();
            }
            $('#loadpage').css('display', 'none')
        }
    });

    function showMyPaint(data){
        domWrap.html(showPaintHtml(data))
    }
    function draw(){

        domWrap.html(myPaintHtml());

        var canvas = $('#canvas'),
            canvasWrap = canvas.parent(),
            _w = canvasWrap.width(),
            _h = canvasWrap.height();

        canvas.attr({
            'width': _w,
            'height': _h
        });
        var sktOpt = mydata.picUrl ? {bg: '/'+mydata.picUrl+'?t='+mydata.updateTime} : {};
        var skt = new Sketch(canvas, sktOpt);

        // 如果有图片 设置背景
        if(mydata.picUrl){
            skt.setBg();
        }

        // 橡皮或铅笔
        var pen = $('.btn-min');
        pen.on('click', function(){
            var _this = $(this),
                index = _this.index();
            pen.removeClass('active');
            _this.addClass('active');
            if(index == 0){
                // 安卓部分机型 在APP中 destination-out 来擦除图片失效
                //skt.switchPen('eraser')
                skt.setColor('#fff')
            }else{
                // 安卓部分机型 在APP中 destination-out 来擦除图片失效
                //skt.switchPen('pen')
                skt.setColor('#333')
            }
        });

        // 笔触大小
        var ctrlBtns = $('.ctrl-value a');
        ctrlBtns.on('click', function(){
            var _this = $(this);
            ctrlBtns.removeClass('on');
            _this.addClass('on');

            skt.setLineWidth(_this.data('val'))
        });

        // 点击上传
        var uploading = false;
        $('#upload').on('click', function(){

            if(sysTime>=endTime){return false;}

            if(uploading) return false;
            uploading = true;

            if(!mydata.id && skt.getDrawLenght() < 4){

                uploading = false;
                dialog({
                    content: '画还未成型哦',
                    status: true
                });
                return false;
            }

            if(mydata.id){
                uploading = false;
                dialog({
                    content: '之前画的很棒了，真的要替换吗？',
                    yesFn: upload
                })
            }else{
                upload();
            }
        });

        function upload(){
            var data = skt.getImg();
            data = data.replace(/^data:image\/(png|jpg);base64,/, "");

            $.ajax({
                url: ajaxApi.uploadPic,
                type: "post",
                data: {
                    img: encodeURIComponent(data),
                    activityCode: activityCode,
                    native_view: base.isApp,
                    oauthToken:  base.token
                },
                xhrFields: {
                    withCredentials: true
                },
                dataType: "json",
                success: function (data) {
                    uploading = false;
                    if(data.resultCode == 1 && data.resultData){
                        mydata = data.resultData;
                        tokenStr = mydata.tokenStr;
                        // 有画作
                        showMyPaint(mydata)
                    }
                }
            });
        }
    }

//--------------------------------------------------【event】
    //返回画榜
    domWrap.on('click', '.btn-back', function(){
        base.goHistory();
    });
    //点赞操作
    var likeing = false;
    domWrap.on('click', '.praise-btn', function(){

        if(sysTime>=endTime){return false;}

        if(likeing){return;}
        likeing = true;
        var _this = $(this),
            isPraised = _this.hasClass('praised'),
            metas = $('.meta span');
        if(isPraised){
            dialog({
                content: '一天只能给自己赞一次哦~',
                status: true
            });
            likeing = false;
            return false;
        }
        $.ajax({
            url: ajaxApi.clickLike,
            type: "post",
            data: {
                picId: mydata.id,
                actionType: 'clickLike',
                activityCode: activityCode,
                native_view: base.isApp,
                oauthToken:  base.token,
                tokenStr: tokenStr
            },
            xhrFields: {
                withCredentials: true
            },
            dataType: "json",
            success: function (data) {
                likeing = false;
                if(data.resultCode == 1 && data.resultData){
                    _this.addClass('praised');
                    metas.eq(0).html('赞：'+data.resultData.integral);
                    metas.eq(1).html('排名：'+data.resultData.rankId);
                }
            }
        });
    });

    //我要重画
    domWrap.on('click', '.paint-reset', function(){
        draw();
    });

    // 去集赞
    domWrap.on('click', '.btn-collect', function(){
        base.checkAppEvent(base.switchUrl('m20160506/praiseList'), '')
    });

    //分享文案
    var shareCurPage = {
        title: '母亲节礼物出新招，99%的妈妈看了都笑了，不信你来试试！',
        desc: '什么样的礼物最能代表你的心，这里有最真诚最美丽的母亲节礼物，也有送你的礼物哦！'
    };

    var curPageUrl = window.location.href;
    // 分享画作
    domWrap.on('click', '.share-btn', function(){
        var _url = base.switchUrl('m20160506/index','shareId='+mydata.id),
            img = 'http://file.qian360.com/'+mydata.picUrl+'@200w_1wh.jpg?t='+mydata.updateTime;
        if(base.isApp){
            hybridProtocol({
                tagName: 'getShare',
                data: {
                    dataUrl: "",
                    imgUrl: img,
                    link: _url,
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
                imgUrl: img,     //分享图片
                shareLink: _url,  //分享链接
                curLink: curPageUrl,      //本地链接
                title: shareCurPage.title,    //分享标题
                desc: shareCurPage.desc,      //分享文案
                type: ""
            });
            shareMask.css('display','block')
        }
    });

    // 点击关闭分享遮罩
    shareMask.on('click', function(){
        shareMask.css('display','none')
    })
});