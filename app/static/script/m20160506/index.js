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
        // 画册列表
        //orderType 1:时间排序 2:好评排序
        //currentPage		页码
        //pernum		每页数量
        //activityCode
        userPicList: pageUrl.apiUrl.url + '/activity/monthlyActivity/userPicList.html',
        //好友点赞
        //likeStatus 0 未点赞 1已点赞
        clickLike: pageUrl.apiUrl.url + '/activity/monthlyActivity/clickLike.html'
    };
//--------------------------------------------------【变量】
    var activityCode='20160506',
        activityData = base.activityData(activityCode),
        sysTime = activityData.systemTime,      //系统时间
        startTime = activityData.startDate,     //开始时间
        endTime = activityData.endDate;         //结束时间

    var isLogin = activityData.phone ? 'app' : '';
    var checkShare = hrefParameter.get('shareBrand'),
        userId = hrefParameter.get('shareId');
    var shareBrand='';

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
    // 检查分享
    if(checkShare){
        $.ajax({
            url: pageUrl.checkUserShare.url,
            type: "post",
            data: {
                shareBrand: checkShare,
                oauthToken: base.token,
                activityCode: activityCode,
                native_view: base.isApp
            },
            xhrFields: {
                withCredentials: true
            },
            dataType: "json",
            success: function (data) {}
        });
    }
    // 影藏元素 classname
    var hideCls = 'hide';
    //分享文案
    var shareCurPage = {
        title: '母亲节礼物出新招，99%的妈妈看了都笑了，不信你来试试！',
        desc: '什么样的礼物最能代表你的心，这里有最真诚最美丽的母亲节礼物，也有送你的礼物哦！',
        url: base.switchUrl('m20160506/index','shareBrand='+shareBrand),
        img: location.protocol + '//' + location.host + $('#sharePic').val()
    };
    var curPageUrl = window.location.href;
    // loding 图层
    var body = $('body'),
        loading = $('#loadpage'),
        shareMask = $('#shareMask');

    // tab
    function Tab(param){
        var that = this;
        this.opt = {
            ctrl: $('.tab-ctrl a'),
            item: $('.tab-item'),
            beforefn: function(){},
            afterfn: function(){}
        };
        if(param){
            this.opt = $.extend(that.opt, param);
        }
        this.init();
    }
    Tab.prototype = {
        init: function(){
            this.ctrls = this.opt.ctrl;
            this.items = this.opt.item;
            this.index = this.opt.index || 0;
            this.switchItem();
            this.event();
        },
        event: function(){
            var that = this;
            this.ctrls.on('click', function(){
                that.index = $(this).index();
                that.opt.beforefn(that.index);
                that.switchItem();
            });
        },
        switchItem: function(){
            this.ctrls.removeClass('on');
            this.ctrls.eq(this.index).addClass('on');
            this.items.css('display', 'none');
            this.items.eq(this.index).css('display', 'block');
            this.opt.afterfn(this.index);
        }
    };
//--------------------------------------------------【时间控制】
    if(sysTime < startTime){
        showUnStart();
    }else{
        showStart();
    }
//--------------------------------------------------【方法】
    // 活动未开始
    function showUnStart(){
        var unStart = $('#unStart'),
            unStartTpl = $('#unStartTpl').html(),
            unStartHtml = Handlebars.compile(unStartTpl);
        // dom组装渲染
        unStart.html(unStartHtml());
        showDom(unStart);
        hideDom(loading);
        // 倒计时
        var countdownBox = unStart.find('.countdown');
        countDown(countdownBox, startTime - sysTime,function(){
            showDom(loading);
            hideDom(unStart);
            showStart();
        });
        // 跳转手册页面
        var ruleBtn = unStart.find('.btn-top');
        ruleBtn.on('click', gotoRule);
        function countDown(box, time, cb){
            if(time <= 0){return;}
            var _time = Math.floor(time / 1000);
            var timer = setInterval(show, 1000);
            show();
            function show(){
                _time -= 1;
                if(_time <= 0){
                    clearInterval(timer);
                    cb();
                    return false;
                }
                var h = twoNum(Math.floor(_time/3600)),
                    m = twoNum(Math.floor(_time%3600/60)),
                    s = twoNum(Math.floor(_time%3600%60));

                box.html(h + ':' + m + ':' + s);
            }
            function twoNum(num){
                return num >= 10 ? num : '0'+num
            }
        }
    }

    function dataListEvent(opt){
        $.ajax({
            url: ajaxApi.userPicList,
            type: "post",
            data: {
                orderType: opt.orderType,
                activityCode: activityCode,
                currentPage: opt.currentPage || 1,
                pernum: 12
            },
            xhrFields: {
                withCredentials: true
            },
            dataType: "json",
            success: function(data){
                opt.cb && opt.cb(data);
            }
        });
    }
    // 活动开始
    function showStart(){
        $.ajax({
            url: ajaxApi.userPicList,
            type: "post",
            data: {
                orderType: 1,
                activityCode: activityCode,
                currentPage: 1,
                pernum: 12
            },
            xhrFields: {
                withCredentials: true
            },
            dataType: "json",
            success: function(data){
                renderPicList(data);
            }
        });

        // 活动开始页面渲染
        function renderPicList(data){

            var total = data.resultData.totalPic,
                dataList = data.resultData;

            var picList = $('#picList'),
                startTpl = $('#startTpl').html(),
                startHtml = Handlebars.compile(startTpl);

            var picListTpl = $('#picListTpl').html(),
                picListHtml = Handlebars.compile(picListTpl);

            var tabRuleTpl = $('#tabRuleTpl').html(),
                tabRuleHtml = Handlebars.compile(tabRuleTpl);

            var showPaintTpl = $('#showPaintTpl').html(),
                showPaintHtml = Handlebars.compile(showPaintTpl);

            var dialogTpl = $('#dialogTpl').html(),
                dialogHtml = Handlebars.compile(dialogTpl);

            var listIndex = 0;
            Handlebars.registerHelper("addOne",function(index){
                //返回+1之后的结果
                return index+listIndex+1;
            });
            Handlebars.registerHelper("endHide",function(){
                //活动结束后 影藏
                return sysTime>=endTime ? ' hide' : '';
            });
            // 重复点赞弹框
            function praiseDialog(){
                body.append(dialogHtml());
                var dialog = $('.dialog-mask');
                dialog.find('.btn').on('click', function(){
                    dialog.remove();
                })
            }

            var listLoading=false,
                listEnd=false,
                listPage = 2,
                topListLoading=false,
                topListEnd=false,
                topListPage = 2,
                showpage= 0;

            function fetchData(opt){
                var container = opt.container || window,
                    target = opt.obj || document.body;
                var distance = target.getBoundingClientRect().bottom - container.innerHeight;
                if(!listLoading && !listEnd && distance < 200){
                    listLoading = true;
                    setTimeout(function(){
                        opt.cb && opt.cb(listLoading,listEnd,listPage);
                    },100)
                }
            }

            function fetchData2(opt){
                var container = opt.container || window,
                    target = opt.obj || document.body;
                var distance = target.getBoundingClientRect().bottom - container.innerHeight;
                if(!topListLoading && !topListEnd && distance < 200){
                    topListLoading = true;
                    setTimeout(function(){
                        opt.cb && opt.cb(topListLoading,topListEnd,topListPage);
                    },100)
                }
            }
            // dom组装渲染
            picList.html(startHtml({
                total: total
            }));
            var tabContainer = $('.tab-container');
            var tokenStr = '';
            tabContainer.on('click','.paint-list li', function(){
                showPaint($(this).data('id'))
            });

            var newList = $('#newList'),
                topList = $('#topList'),
                tabRule = $('#tabRule'),
                tabRuleRender = false,
                newListRender = false,
                topListRender = false;
            if(dataList.picList){
                newList.removeClass('no-data');
                $('html, body').css('height', 'auto');
            }
            newList.find('ul').html(picListHtml(dataList));
            body.append('<div class="bottom-bar"><a class="btn-my" href="javascript:;"></a></div>');
            function initNewList(){
                newListRender = true;
                $('html, body').css('height', '100%');
                topList.find('ul').html('');
                newList.addClass('no-data');
                listEnd=false;
                dataListEvent({
                    orderType: 1,
                    currentPage: 1,
                    cb: function(data){
                        if(data.resultData.picList){
                            newList.removeClass('no-data');
                            $('html, body').css('height', 'auto');
                        }
                        listPage = 2;
                        newListRender = false;
                        newList.find('ul').html(picListHtml(data.resultData));

                        $('.list-num span').html(data.resultData.totalPic);
                    }
                })
            }
            function initTopList(){
                topListRender = true;
                $('html, body').css('height', '100%');
                topList.find('ul').html('');
                topList.addClass('no-data');
                topListEnd=false;
                dataListEvent({
                    orderType: 0,
                    currentPage: 1,
                    cb: function(data){
                        if(data.resultData.picList){
                            topList.removeClass('no-data');
                            $('html, body').css('height', 'auto');
                        }
                        topListPage = 2;
                        topListRender = false;
                        listIndex = 0;
                        topList.find('ul').html(picListHtml(data.resultData));
                        listIndex = topList.find('li').length;
                        $('.list-num span').html(data.resultData.totalPic);
                    }
                })
            }
            function showMaskInit(){
                if(showpage == 0){
                    initNewList()
                }else if(showpage == 1){
                    initTopList()
                }
            }
            new Tab({
                beforefn: function(i){
                    if(i ==0 && !newListRender && showpage!=i){
                        initNewList();
                    }else if(i ==1 && !topListRender && showpage!=i){
                        initTopList();
                    }
                    if(i == 2 && !tabRuleRender){
                        tabRuleRender = true;
                        tabRule.html(tabRuleHtml());
                        $('.bbs').on('click', function(){
                            base.checkAppEvent('https://bbs.qian360.com/app/index.html?topicId=2527#&pageBbsDetailed','钱庄社区')
                        })
                    }
                    showpage = i;
                },
                afterfn: function(i){

                }
            });
            showDom(picList);
            hideDom(loading);
            $(window).on('scroll', function(){
                if(showpage == 0){

                    fetchData({cb: function(loadstatus,endstatus,pagenum){
                        newList.addClass('loading');
                        dataListEvent({
                            orderType: 1,
                            currentPage: pagenum,
                            cb: function(data){
                                listLoading = false;
                                newList.removeClass('loading');
                                if(data.resultCode == 1){
                                    listPage++;
                                    if(!data.resultData.picList){
                                        listEnd = true;
                                    }else{
                                        $('#newList .paint-list').append(picListHtml(data.resultData))
                                    }
                                }
                            }
                        })
                    }})
                }else if(showpage == 1){
                    fetchData2({cb: function(loadstatus,endstatus,pagenum){
                        topList.addClass('loading');
                        dataListEvent({
                            orderType: 0,
                            currentPage: pagenum,
                            cb: function(data){
                                topListLoading = false;
                                topList.removeClass('loading');
                                if(data.resultCode == 1){
                                    topListPage++;
                                    if(!data.resultData.picList){
                                        topListEnd = true;
                                    }else{
                                        $('#topList .paint-list').append(picListHtml(data.resultData));
                                        listIndex = $('#topList li').length;
                                    }
                                }
                            }
                        })
                    }})
                }
            });
            function showPaint(id){
                $.ajax({
                    url: ajaxApi.clickLike,
                    type: "post",
                    data: {
                        activityCode: activityCode,
                        native_view: base.isApp,
                        oauthToken: base.token,
                        picId: id
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    dataType: "json",
                    success: function(data){
                        var _data = data.resultData;
                        tokenStr = data.resultData.tokenStr;
                        body.append(showPaintHtml(_data));
                        var maskPaint = $('.mask-paint');
                        showDom(maskPaint);
                        showPaintEvent(_data);
                        showMaskInit();
                    }
                });
            }

            function showPaintEvent(data){
                var maskPaint = $('.mask-paint'),
                    closeBtn = maskPaint.find('.close-btn'),
                    btn = maskPaint.find('.btn'),
                    btnBack = maskPaint.find('.btn-back'),
                    praiseBtn = maskPaint.find('.praise-btn'),
                    metas = maskPaint.find('.meta span');

                share(false, {
                    img: 'http://file.qian360.com/'+data.picUrl+'@200w_1wh.jpg?t='+data.updateTime,
                    url: base.switchUrl('m20160506/index','shareId='+data.id)
                });

                closeBtn.on('click', function(){
                    $('.mask-paint').remove();
                    share();
                });

                btn.on('click', function(){
                    share(true, {
                        img: 'http://file.qian360.com/'+data.picUrl+'@200w_1wh.jpg?t='+data.updateTime,
                        url: base.switchUrl('m20160506/index','shareId='+data.id)
                    });
                });

                btnBack.on('click', function(){
                    $('.mask-paint').remove();
                    share();
                });

                var likeing = false;
                praiseBtn.on('click', function(){
                    if(sysTime>=endTime){return false;}
                    if(!isLogin){
                        base.gotoLogin()
                    }
                    if(likeing){return;}
                    likeing = true;
                    var _this = $(this),
                        isPraised = _this.hasClass('praised');
                    if(isPraised){
                        praiseDialog();
                        likeing = false;
                        return false;
                    }
                    $.ajax({
                        url: ajaxApi.clickLike,
                        type: "post",
                        data: {
                            picId: data.id,
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

                                showMaskInit();
                            }
                        }
                    });
                });

            }
            // 跳转手册页面
            var ruleBtn = picList.find('.btn-top');
            ruleBtn.on('click', gotoRule);

            //跳转我的画作
            $('.btn-my').on('click', gotoMyPaint);
            // 分享存在id的弹出画册图层
            if(userId){
                showPaint(userId)
            }
        }
    }
    function showDom(obj){
        obj.removeClass(hideCls)
    }
    function hideDom(obj){
        obj.addClass(hideCls)
    }
    function gotoRule(){
        base.checkAppEvent(base.switchUrl('m20160506/rule'), '')
    }
    function gotoMyPaint(){
        if(!isLogin){ // 未登录 去登录
            base.gotoLogin();
            return false;
        }
        base.checkAppEvent(base.switchUrl('m20160506/userPaint'), '')
    }
    function share(showmask, obj){
        var shareOpt = {
            img: obj ? obj.img : shareCurPage.img,
            url: obj ? obj.url : shareCurPage.url,
            title: obj ? '听说朋友圈的孩子，都送这个给妈妈！请大家帮我瞧瞧，妈妈会喜欢吗？' : shareCurPage.title,
            desc: obj ? '画作虽小，却有一颗承载着亲情的爱心，朋友们请来见证我对妈妈的爱！' : shareCurPage.desc
        };

        shareInit({
            isApp: base.isApp,
            dataUrl: "",
            imgUrl: shareOpt.img,     //分享图片
            shareLink: shareOpt.url,  //分享链接
            curLink: curPageUrl,      //本地链接
            title: shareOpt.title,    //分享标题
            desc: shareOpt.desc,      //分享文案
            type: ""
        });

        if(!base.isApp){
            if(showmask){
                shareMask.css('display','block')
            }
        }else if(base.isApp && showmask){
            hybridProtocol({
                tagName: 'getShare',
                data: {
                    dataUrl: "",
                    imgUrl: shareOpt.img,
                    link: shareOpt.url,
                    title: shareOpt.title,
                    desc: shareOpt.desc,
                    type: ""
                },
                success: function (data) {},
                error: function (data) {}
            });
        }
    }
    share();
    // 点击关闭分享遮罩
    shareMask.on('click', function(){
        shareMask.css('display','none')
    })
});