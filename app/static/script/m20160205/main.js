define(function (require) {
//--------------------------------------------------【require】
    require('zepto.min');
    require('fastclick');
    //引入依赖
    var base = require('base');
    var hybridProtocol = require('native-calls'),
        shareInit = require('share-init'),
        Dialog = require('activity-dialog'),
        pageUrl = require('url-map');

    // fastclick代替zepto的tap,防止点透bug
    window.addEventListener('load', function () {
        FastClick.attach(document.body);
    }, false);
//--------------------------------------------------【变量】
    var isLogin,
        sysTime,startTime,endTime,
        activityData,
        phone,inviteCode,shareBrand;

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

    // 未登陆强制登陆 活动主场景需要强制登陆
    if(!isLogin){
        base.gotoLogin();
        return;
    }
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
        // 判断桃树
        checkTree:{
            url: pageUrl.apiUrl.url + '/activity/monthlyActivity/hello2016/checkTree.html'
        },
        // 选择桃树
        initIntegral:{
            url: pageUrl.apiUrl.url + '/activity/monthlyActivity/hello2016/initIntegral.html'
        },
        // 摘桃子
        pickPeach:{
            url: pageUrl.apiUrl.url + '/activity/monthlyActivity/hello2016/pickPeach.html'
        },
        // 每日送桃子
        sendPeach:{
            url: pageUrl.apiUrl.url + '/activity/monthlyActivity/hello2016/sendPeach.html'
        },
        // 获取分享标识
        peachShare:{
            url: pageUrl.apiUrl.url + '/activity/monthlyActivity/hello2016/share.html'
        },
        // 桃子记录相关
        showPeach: {
            url: pageUrl.apiUrl.url + '/activity/monthlyActivity/hello2016/showPeach.html'
        }
    };
    // 获取用户分享唯一标识 shareBrand
    $.ajax({
        url: ajaxUrl.peachShare.url,
        type: "post",
        data: {
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
            if(data.resultCode == 1){
                shareBrand = data.resultData
            }
        }
    });

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
    // 特殊节日弹框初始化
    var festivalDialog;
    function openFestivalDailog(titlestr, contentstr){
        festivalDialog = festivalDialog || new Dialog({
                btns: [{
                    cls: 'btn',
                    text: '好的',
                    callback: function(self){
                        self.close();
                        openDailog('<div class="dialog-title-common">登录奖励</div>','<div class="prize-cont"><p class="title">每天进入游戏页面即可获得2个桃子</p><div class="peach-send">x2</div></div>');
                    }
                }]
            });
        festivalDialog.setcontent(contentstr).setheader(titlestr).open();
    }
    // 需要登陆操作的走这
    function checkLoginEvent(callback){
        if(!isLogin){
            base.gotoLogin();
            return false;
        }
        callback && callback();
    }
//--------------------------------------------------【活动入场】

    // 用户数据初始化
    var userData = {
        tree: '',   // 选择的桃树类型
        freeze: 0,  // 未摘的桃子
        integral: 0 // 已经摘的桃子
        },
        tokenStr;
    var body = $('body'),
        choiceBgCls = 'choice-bg',
        stageBgCls = 'stage-bg';

    // 判断用户是否已经选择过桃树
    $.ajax({
        url: ajaxUrl.checkTree.url,
        type: "post",
        data: {
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
            if(data.resultCode == 2){ // 未选择桃树
                if(sysTime > endTime){ // 活动已经结束 直接去主场景
                    userData = {
                        tree: 0,
                        freeze: 0,
                        integral: 0
                    };
                    stage();
                }else{
                    tokenStr = data.resultData;
                    choiceTree();
                }
            }else{
                userData = {
                    tree: data.resultData.showType,
                    freeze: data.resultData.freeze,
                    integral: data.resultData.integral
                };
                stage();
            }
        }
    });

    // 选择桃树
    function choiceTree(){
        // 场景背景色设置
        body.addClass(choiceBgCls);

        var choiceImgs = globalImgs.choice, // 该场景使用的图片
            choiceWrap = $('#choiceTree'),
            imgLength = choiceImgs.length, i,
            loadedNum = 0;
        var _html = '<div class="step-one">' +
            '<h1 class="tit"><img src="'+choiceImgs[0]+'" alt="请挑选1颗桃树"/></h1>' +
            '<div class="trees-list">' +
                '<a href="javascript:;" class="tree-item">' +
                    '<img src="'+choiceImgs[1]+'" alt="福满天下"/>' +
                '</a>' +
                '<a href="javascript:;" class="tree-item">' +
                    '<img src="'+choiceImgs[2]+'" alt="金玉满堂"/>' +
                '</a>' +
                '<a href="javascript:;" class="tree-item">' +
                    '<img src="'+choiceImgs[3]+'" alt="花开富贵"/>' +
                '</a>' +
            '</div>' +
            '<a id="choiceBtn" href="javascript:;" class="btn dis-btn">领取</a>' +
        '</div>' +
        '<div class="step-two">' +
            '<div class="cont">' +
                '<div class="peach-send">x10</div>' +
            '</div>' +
            '<a id="startBtn" href="javascript:;" class="btn">开始</a>' +
        '</div>';

        // 图片素材加载完成后 载入选择界面
        for(i = 0; i < imgLength; i++){
            base.loadImg(choiceImgs[i], function(){
                if(imgLength == ++loadedNum){
                    _init();
                }
            })
        }
        function _init(){
            choiceWrap.html(_html);
            $('#loadpage').css('display', 'none'); // 加载动画关闭
            var treeItems = choiceWrap.find('.tree-item'),
                stepOne = choiceWrap.find('.step-one'),
                stepTwo = choiceWrap.find('.step-two'),
                choiceBtn = $('#choiceBtn'),
                startBtn = $('#startBtn');

            var choiceTreeNum = null,
                selectedCls = 'tree-checked';
            treeItems.on('click', function(){
                var $this = $(this);
                choiceTreeNum = $this.index() + 1;
                treeItems.removeClass(selectedCls);
                $this.addClass(selectedCls);
                choiceBtn.removeClass('dis-btn');
            });
            choiceBtn.on('click', function(){
                $.ajax({
                    url: ajaxUrl.initIntegral.url,
                    type: "post",
                    data: {
                        tokenStr: tokenStr,
                        oauthToken: base.token,
                        activityCode: activityCode,
                        native_view: isApp,
                        showType: choiceTreeNum
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    dataType: "json",
                    async: false,
                    success: function (data) {
                        if(data.resultCode == 1){
                            userData = {
                                tree: data.resultData.showType,
                                freeze: data.resultData.freeze,
                                integral: data.resultData.integral
                            };
                            stepOne.css('display', 'none');
                            stepTwo.css('display', 'block');
                        }
                    }
                });
            });

            startBtn.on('click', function(){
            // 跳转主场景
                choiceWrap.css('display', 'none');
                stage();
            })
        }
    }

    // 主场景
    function stage(){

        $('#loadpage').css('display', 'block'); // 加载动画打开

        // 场景背景色切换
        body.removeClass(choiceBgCls).addClass(stageBgCls);
        var choiceNum = userData.tree,
            peachNum = userData.freeze,
            hasPeach = userData.integral,
            peachCache = 0, maxLimit = 10;

        var stageImgs = globalImgs.stage,
            treeImg = globalImgs.trees[choiceNum-1],
            hangImg = globalImgs.hang[choiceNum-1],
            i, loadedNum = 0;

        if(treeImg && hangImg){
            stageImgs.push(treeImg);
            stageImgs.push(hangImg);
        }
        var imgsLength = stageImgs.length;

        var _html = '<div class="top-bar">' +
                '<div id="peachNum" class="peach-num">'+peachNum+'</div>' +
                '<div class="top-nav">' +
                    '<a id="rewardBtn" class="nav-btn" href="javascript:;">商店</a>' +
                    '<a id="ruleBtn" class="nav-btn" href="javascript:;">规则</a>' +
                '</div>' +
            '</div>';
        if(sysTime > endTime){
            _html += '<div class="stage end-time">' +
                '<div class="sky"></div>' +
                '<div class="greensward"></div>' +
                '<div class="end-cont">' +
                '<p>本猴王回花果山了<br>五百年后再会</p>';
            if(!base.isApp){
                _html += '<a class="cont-download" href="http://a.app.qq.com/o/simple.jsp?pkgname=com.qz.qian&ckey=CK1304356609522">去钱庄网App参加更多活动</a>'
            }
            _html += '</div>' +
                '<div class="bottom-monkey2">' +
                '<div class="has-peach-num">'+hasPeach+'</div>'+
                '</div>' +
                '</div>';
        }else{
            _html += '<div class="stage">' +
                '<div class="sky"></div>' +
                '<div class="greensward"></div>' +
                '<div class="tree tree'+choiceNum+'">' +
                '<div class="hang"></div>' +
                '</div>' +
                '<div class="monkey">' +
                '<div class="monkey-head">' +
                '<div class="eye left-eye"></div>' +
                '<div class="eye right-eye"></div>' +
                '</div>' +
                '</div>' +
                '<div class="basket">' +
                '<div class="has-peach-num">'+hasPeach+'</div>'+
                '</div>' +
                '<div class="peach p01"><i></i></div>' +
                '<div class="peach p02"><i></i></div>' +
                '<div class="peach p03"><i></i></div>' +
                '<div class="peach p04"><i></i></div>' +
                '<div class="peach p05"><i></i></div>' +
                '<div class="peach p06"><i></i></div>' +
                '<div class="peach p07"><i></i></div>' +
                '<div class="peach p08"><i></i></div>' +
                '<div class="peach p09"><i></i></div>' +
                '<div class="peach p10"><i></i></div>' +
                '</div>';

            if(!hasPeach){ // 如果是新手
                _html += '<div class="novice"><div class="pop-wrap">点击桃子即可摘取，快试试~</div><div class="novice-done"></div></div>'
            }
        }

        var stageFootHtml = '<div class="stage-footer">' +
            '<a href="javascript:;" class="footer-btn shovel"></a>' +
            '<a href="javascript:;" class="footer-btn water"></a>' +
            '<a href="javascript:;" class="footer-btn friend"></a>';
        if(!base.isApp){
            stageFootHtml += '<a href="http://a.app.qq.com/o/simple.jsp?pkgname=com.qz.qian&ckey=CK1304356609522" class="download-app">下载<br>App</a>'
        }
        stageFootHtml += '<div class="pop-wrap ui-dialog-hide">没有桃子了？试试浇水、施肥~</div></div>';

        for(i = 0; i < imgsLength; i++){
            base.loadImg(stageImgs[i], function(){
                if(imgsLength == ++loadedNum){
                    _init();
                }
            })
        }

        function _init(){

            var stageWrap = $('#stageWrap');
            //dom填充
            stageWrap.html(_html);

            // 摘桃音乐
            var monkeySound = new buzz.sound(globalMusic[1], {
                preload: 'metadata',
                autoplay: false,
                volume: 100,
                loop: false
            });

            $('#loadpage').css('display', 'none'); // 加载动画关闭

            if(sysTime > endTime){
                assistantPeach();
                return;
            }

            var peachNumWrap = $('#peachNum'),
                rewardBtn = $('#rewardBtn'),
                ruleBtn = $('#ruleBtn'),
                peachs = stageWrap.find('.peach'),
                hasPeachWrap = stageWrap.find('.has-peach-num'),
                novice = $('.novice'),
                monkey = $('.monkey'),
                hasPeachCls = 'has-peach';
            peachNumWrap.html(peachNum);

            // 每日登陆奖励
            everyDaySend();

            if(peachNum >= maxLimit){
                peachCache = maxLimit;
                peachs.addClass(hasPeachCls);
            }else{
                for(var i = 0; i<peachNum; i++){
                    peachCache++;
                    peachs.eq(i).addClass(hasPeachCls);
                }
            }
            if(!hasPeach){ // 新手引导打开
                setTimeout(function(){
                    novice.css({
                        opacity: 1
                    })
                }, 2000)
            }
            // 点击摘桃子
            peachs.on('click', function(){
                var _this = $(this);
                if(!_this.hasClass(hasPeachCls)){
                    return;
                }
                if(!hasPeach){ // 新手引导关闭
                    novice.addClass('done');
                    setTimeout(function(){
                        novice.addClass('ui-dialog-hide');
                    }, 1500)
                }
                _this.addClass('movepeach');
                peachCache--; // 树上的桃子更新
                peachNum--; // 未摘的桃子更新
                hasPeach++; // 已摘的桃子更新
                changePeachNum(); // dom 数据更新
                plusOne(); // +1效果
                monkeySound.play();
                // 摘桃子请求
                $.ajax({
                    url: ajaxUrl.pickPeach.url,
                    type: "post",
                    data: {
                        oauthToken: base.token,
                        activityCode: activityCode,
                        native_view: isApp,
                        integral: 1
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    dataType: "json",
                    success: function (data) {
                        if(data.resultCode == 1){

                        }
                    }
                });

                setTimeout(function(){
                    _this.removeClass(hasPeachCls).removeClass('movepeach');

                    setTimeout(function(){
                        if(peachNum-peachCache > 0){
                            peachCache++;
                            _this.addClass(hasPeachCls);
                        }
                    },30)
                },300)
            });

            // 底栏相关
            stageFoot();
            var footPop = $('.stage-footer .pop-wrap');
            if(peachNum <=0 ){
                footPop.removeClass('ui-dialog-hide')
            }
            // 其他事件
            assistantPeach();

            // dom 数据更新
            function changePeachNum(){
                peachNumWrap.html(peachNum);
                hasPeachWrap.html(hasPeach);
                if(peachNum <=0 ){
                    footPop.removeClass('ui-dialog-hide')
                }
            }
            // +1动画
            function plusOne(){
                var mix = $('.monkey, .basket');
                mix.addClass('jump');
                setTimeout(function(){
                    mix.removeClass('jump');

                    var dom = $('<div class="plus-one"></div>');
                    monkey.append(dom);
                    setTimeout(function(){
                        dom.addClass('movepeach')
                    }, 500)

                }, 1000);
            }
            // 每日登陆奖励
            function everyDaySend(){
                $.ajax({
                    url: ajaxUrl.sendPeach.url,
                    type: "post",
                    data: {
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
                        var code = data.resultCode;
                        if(code == 1){ // 只送1次
                            userData = {
                                tree: data.resultData.showType,
                                freeze: data.resultData.freeze,
                                integral: data.resultData.integral
                            };
                            if(isFebSeven()){ //如果是除夕送只送8 个
                                openDailog('<div class="dialog-title-common">新春福利</div>','<div class="prize-cont"><p class="title">除夕和大年初一送桃子</p><div class="peach-send festival-peach">x8</div></div>');
                            }else if(isFebEight()){// 如果是初一
                                openDailog('<div class="dialog-title-common">新春福利</div>','<div class="prize-cont"><p class="title">除夕和大年初一送桃子</p><div class="peach-send festival-peach">x6</div></div>');
                            }else{
                                openDailog('<div class="dialog-title-common">登录奖励</div>','<div class="prize-cont"><p class="title">每天进入游戏页面即可获得2个桃子</p><div class="peach-send">x2</div></div>');
                            }

                            choiceNum = userData.tree;
                            peachNum = userData.freeze;
                            hasPeach = userData.integral;
                            changePeachNum();

                        }else if(code == 2){ // 节假日送 和 每日送

                            userData = {
                                tree: data.resultData.showType,
                                freeze: data.resultData.freeze,
                                integral: data.resultData.integral
                            };
                            if(isFebSeven()){ //如果是除夕送只送8 个
                                openFestivalDailog('<div class="dialog-title-common">新春福利</div>','<div class="prize-cont"><p class="title">除夕和大年初一送桃子</p><div class="peach-send festival-peach">x8</div></div>');
                            }else if(isFebEight()){// 如果是初一
                                openFestivalDailog('<div class="dialog-title-common">新春福利</div>','<div class="prize-cont"><p class="title">除夕和大年初一送桃子</p><div class="peach-send festival-peach">x6</div></div>');
                            }

                            choiceNum = userData.tree;
                            peachNum = userData.freeze;
                            hasPeach = userData.integral;
                            changePeachNum();
                        }
                    }
                });
            }
        }

        // 底栏事件
        function stageFoot(){
            // 底栏dom 填充
            body.append($(stageFootHtml));
            var stageFootBar = $('.stage-footer'),
                footPop = stageFootBar.find('.pop-wrap'),
                footBtns = stageFootBar.find('.footer-btn'),
                stageFootWrap = $('.stage-footer-cont'),
                footCloseBtns = stageFootWrap.find('.cont-close'),
                stageFootItem = stageFootWrap.find('.cont-item'),
                shovelBtn = $('.shovel-btn'),
                waterBtn = $('.water-btn'),
                friendBtn = $('.friend-btn'),
                hideCls = 'ui-dialog-hide';

            footBtns.on('click', function(){
                var $this = $(this),
                    index = $this.index();
                stageFootItem.addClass(hideCls).eq(index).removeClass(hideCls);
                stageFootWrap.removeClass(hideCls);
                footPop.addClass(hideCls);
            });
            footCloseBtns.on('click', function(){
                stageFootWrap.addClass(hideCls)
            });
            shovelBtn.on('click', base.gotoProductList);
            waterBtn.on('click', function(){
                // 分享 浇水
                shareWater();
            });
            friendBtn.on('click', function(){
                // 邀请注册
                checkLoginEvent(shareInvite)
            })
        }

    }
//--------------------------------------------------【event】
    // 时间控制
    function isFebSeven(){
        // 2016 02 07 -> 1454774400000
        return (sysTime >= 1454774400000 && sysTime <= 1454774400000+86400000);
    }
    function isFebEight(){
        // 2016 02 08 ->  1454860800000
        return (sysTime >= 1454860800000 && sysTime <= 1454860800000+86400000);
    }
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

    // 获取桃子记录列表变量
    var peachListWrap = $('#peachList'),
        unPick = $('#unPick'),
        picked = $('#Picked'),
        peachList = $('.spec-list'),
        ruleBox = $('#ruleBox');

    // 展开桃记录列表
    function showPeachList(unpicknum, pickednum, peachlistdata){
        unPick.html(unpicknum||0);
        picked.html(pickednum||0);
        peachList.html(peachlistdata||'');
        peachListWrap.removeClass(peachListHide);
    }
    // 格式化桃记录数据
    function formatPeachData(data){
        var listData = data.ailjList,
            dataLength = listData.length,
            unpicknum = data.aij.freeze,
            pickednum = data.aij.integral,
            peachlistdata = '', i;

        for(i = 0; i<dataLength; i++){
            peachlistdata += format(listData[i].type, listData[i].freeze)
        }
        return {
            unpicknum: unpicknum,
            pickednum: pickednum,
            peachlistdata: peachlistdata
        };
        function format(type, num){
            var _html = '';
            switch(type){
                case 'init':
                    _html = '<li>参与奖励 <span>+'+num+'</span></li>';
                    break;
                case 'invite':
                    _html = '<li>邀请好友投资 <span>+'+num+'</span></li>';
                    break;
                case 'invite_register':
                    _html = '<li>邀请好友注册 <span>+'+num+'</span></li>';
                    break;
                case 'tender':
                    _html = '<li>施肥 <span>+'+num+'</span></li>';
                    break;
                case 'newyear':
                    _html = '<li>新春福利 <span>+'+num+'</span></li>';
                    break;
                case 'sendPeach':
                    _html = '<li>登录 <span>+'+num+'</span></li>';
                    break;
                case 'water':
                    _html = '<li>浇水 <span>+'+num+'</span></li>';
                    break;
                case 'help':
                    _html = '<li>好友帮忙 <span>+'+num+'</span></li>';
                    break;
                default :
                    _html = ''
            }
            return _html;
        }
    }
    // 展开活动说明
    function showRule(){
        ruleBox.removeClass(peachListHide);
    }

    // 副场景功能
    function assistantPeach(){
        var peachNumWrap = $('#peachNum'),
            basket = $('.basket'),
            rewardBtn = $('#rewardBtn'),
            ruleBtn = $('#ruleBtn');

        $('#peachNum, .has-peach-num').on('click', function(){
            $.ajax({
                url: ajaxUrl.showPeach.url,
                type: "post",
                data: {
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
                    if(data.resultCode == 1){
                        var peachdata = formatPeachData(data.resultData);
                        showPeachList(peachdata.unpicknum, peachdata.pickednum, peachdata.peachlistdata)
                    }
                }
            });
        });

        ruleBtn.on('click', showRule);

        rewardBtn.on('click', function(){
            base.checkAppEvent(base.switchUrl('m20160205/convertList'), '金猴献桃闹新春 钱庄送礼过大年')
        })
    }
//--------------------------------------------------【分享相关】
    var shareAboutWater = {
            url: base.switchUrl('m20160205/helpWater'),
            title: '猴子摘桃可换钱，眼看500元就要到手了，快来助我一臂之力！',
            desc: '浇浇水，施施肥，就可以长出好多好多桃子，拿给小猴子去换压岁钱吧，最多可换500元哦！'
        },
        share = {
            url: base.switchUrl('m20160205/entry'),
            title: '我家养了一只猴子，每天给我偷来十几个桃子，超给力的！',
            desc: '养猴摘桃，最多可换500元压岁钱，何乐而不为？桃子越多，福利越大！'
        },
        shareImg = location.protocol + '//' + location.host + $('#sharePic').val(),
        invitePageUrl = base.switchUrl('register', 'inviteCode='+inviteCode+'&phone='+phone+'&activityCode='+activityCode),
        shareMask = $('#shareMask');
    // 浇水分享
    function shareWater(){
        if(base.isApp){
            hybridProtocol({
                tagName: 'getShare',
                data: {
                    dataUrl: "",
                    imgUrl: shareImg,
                    link: base.urlQuery(shareAboutWater.url, 'shareBrand='+shareBrand+'&treeType='+userData.tree),
                    title: shareAboutWater.title,
                    desc: shareAboutWater.desc,
                    type: ""
                },
                success: function (data) {},
                error: function (data) {}
            });
        }else{
            shareInit({
                isApp: base.isApp,
                dataUrl: "",
                imgUrl: shareImg,
                shareLink: base.urlQuery(shareAboutWater.url, 'shareBrand='+shareBrand+'&treeType='+userData.tree),
                curLink: curPageUrl,
                title: shareAboutWater.title,
                desc: shareAboutWater.desc,
                type: ""
            });
            shareMask.css('display','block');
        }
    }
    // 邀请好友分享
    function shareInvite(){
        if(base.isApp){
            hybridProtocol({
                tagName: 'getShare',
                data: {
                    dataUrl: "",
                    imgUrl: shareImg,
                    link: invitePageUrl,
                    title: share.title,
                    desc: share.desc,
                    type: ""
                },
                success: function (data) {},
                error: function (data) {}
            });
        }else{
            shareInit({
                isApp: base.isApp,
                dataUrl: "",
                imgUrl: shareImg,
                shareLink: invitePageUrl,
                curLink: curPageUrl,
                title: share.title,
                desc: share.desc,
                type: ""
            });
            shareMask.css('display','block');
        }
    }
    // 点击关闭 分享蒙层
    shareMask.on('click', function(){
        shareMask.css('display', 'none')
    });
    // 页面分享初始化
    shareInit({
        isApp: base.isApp,
        dataUrl: "",
        imgUrl: shareImg,
        shareLink: share.url,
        curLink: curPageUrl,
        title: share.title,
        desc: share.desc,
        type: ""
    });
});