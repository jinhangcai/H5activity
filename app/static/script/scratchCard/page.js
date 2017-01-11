define(function (require) {
//--------------------------------------------------【require】
    require('zepto.min');
    require('fastclick');
    //引入依赖
    var base = require('base');
    var cookie = require('cookie'),
        hybridProtocol = require('native-calls'),
        shareInit = require('share-init'),
        pageUrl = require('url-map'),
        scratchCard = require('scratch-card'),
        hrefParameter = require('href-parameter');

    // fastclick代替zepto的tap,防止点透bug
    window.addEventListener('load', function () {
        FastClick.attach(document.body);
    }, false);

//--------------------------------------------------【变量】
    // 活动代码
    var activityCode = hrefParameter.get('activityCode');
    var tokenStr = '';
    var sharebrand = '';
    var userShareBrand = hrefParameter.get('shareBrand');
    // 获取cookie中的电话号码
    var userPhoneKey = 'activityUserPhone',
        userPhone = cookie.getCookie(userPhoneKey);

    // 刮刮卡图片素材
    var scratchPic = $('#scratchPic').val(),
        disScratchPic = $('#disScratchPic').val(),
        endScratchPic = $('#endScratchPic').val(),
        scratchBg = $('#scratchBg').val();

    // 活动主框 DOM
    var contentBox = $('#contentBox'),
        // 状态 contentBox删除className 没有号码 contentBox删除className 反之添加
        stateCls = 'decorate-box';

    // 手机号码 输入
    var phoneText = $('#phoneText'),
        phoneBtn = $('#phoneBtn');
    var bCheckPhone = false;
    var phoneCheckReg = /^((13[0-9]{9})|(14[0-9]{9})|(15[0-35-9][0-9]{8})|(17[0-9]{9})|(18[0-9]{9}))$/;

    // 刮刮卡数据更新 DOM
    var curPhone = $('#curPhone'),
        changePhone = $('#changePhone'),
        userHasNum = $('#userHasNum'),
        prizeListBtn = $('#prizeListBtn'),
        prizeListBox = $('#prizeListBox');

    var scratchNum = 0,
        scratchTotalNum = 0,
        scratchMaxTimes = 2,
        scratch;

    var scratched = true;

    var shareWrap = $('.share-wrap');

    // loading dom
    var loadpage = $('#loadpage'),
        all = $('html,body');

    function showLoading(){
        loadpage.removeClass('ui-hide');
        overHidden();
    }
    function closeLoading(){
        loadpage.addClass('ui-hide');
        overScroll();
    }
    function overHidden(){
        all.css({
            'height': '100%',
            'overflow-y': 'hidden'
        });
    }
    function overScroll(){
        all.css({
            'height': 'auto',
            'overflow-y': 'scroll'
        });
    }
    // 通知弹框 dom
    var commonDialog = $('#commonDialog'),
        cDText = commonDialog.find('.commen-text');

    // 活动时间
    var sysTime,startTime,endTime,activityData={};
    $.ajax({
        url: pageUrl.activityData.url,
        type: "post",
        data: {
            activityCode: activityCode
        },
        xhrFields: {
            withCredentials: true
        },
        dataType: "json",
        async: false,
        beforeSend: function(){
            showLoading();
        },
        success: function (d) {
            if (d.resultCode !== 0) {
                activityData = d.resultData;
            }else{
                alertDailog(data.resultMsg)
            }
        },
        error: function(){
            alertDailog('服务器繁忙，请稍后再试')
        },
        complete: function(){
            closeLoading();
        }
    });

    sysTime = activityData.systemTime;
    startTime = activityData.startDate;
    endTime = activityData.endDate;

    // 判断活动是否开始
    function checkTimeEvent(ischeckstart,ischeckend){
        if(sysTime >= startTime && sysTime < endTime){
            return true;
        }else if(sysTime < startTime){
            if(ischeckstart){
                return true;
            }
            alertDailog('本活动11月28日启动 <br> 客官不要心急哦～');
        }else if(sysTime >= endTime){
            if(ischeckend){
                return true;
            }
            alertDailog('活动已结束 <br> 下次再来哦～');
        }
        return false;
    }

    // 通知弹框
    function alertDailog(str){
        overHidden();
        cDText.html(str);
        commonDialog.removeClass('ui-dialog-hide');
    }
//--------------------------------------------------【刮刮卡数据初始化】
    function scratchUpdata(){
        var _fg = scratchPic;
        var _isAbeld = true;
        curPhone.text(userPhone);
        userHasNum.text(scratchNum);
        if(scratchTotalNum >= scratchMaxTimes){
            shareWrap.addClass('ui-hide');
        }else{
            shareWrap.removeClass('ui-hide');
        }
        if(scratchNum <= 0){
            _fg = disScratchPic;
            _isAbeld = false;
        }
        if(sysTime >= endTime){
            _fg = endScratchPic;
        }
        if(scratch){
            scratch.options.fg = _fg;
            scratch.reset();
        }else{
            scratch = new scratchCard($('#scratchCard'),{
                bg: scratchBg,
                fg: _fg,
                size: 10,
                scratchMove: function(e, percent){
                    if(percent > 20){
                        scratch.enabled = false;
                        if(!checkTimeEvent()){
                            return false;
                        }
                        if(scratchNum == 0){
                            return false;
                        }
                        setTimeout(function(){
                            getScratchData();
                        },10);
                    }
                }
            });
        }
        scratch.enabled = _isAbeld;
    }
    function getPhoneData(){
        if(sysTime >= endTime){
            scratchNum = 0;
            scratchTotalNum = 0;
            scratchUpdata();
            return false;
        }
        $.ajax({
            url: pageUrl.lotteryTimes.url,
            type: "post",
            data: {
                phone: userPhone,
                activityCode: activityCode,
                shareBrand: userShareBrand
            },
            xhrFields: {
                withCredentials: true
            },
            dataType: "json",
            async: false,
            beforeSend: function(){
                showLoading();
                bCheckPhone = false;
            },
            success: function (data) {
                if(data.resultCode == 1){
                    scratchNum = data.resultData.times;
                    scratchTotalNum = data.resultData.gotTimes;
                    tokenStr = data.resultData.tokenStr;
                    scratchUpdata();
                }else{
                    alertDailog(data.resultMsg)
                }
            },
            error: function(){
                alertDailog('服务器繁忙，请稍后再试')
            },
            complete: function(){
                closeLoading();
            }
        })
    }
    function getScratchData(){
        if(!scratched){return false;}
        scratched = false;
        $.ajax({
            url: pageUrl.lottery.url,
            type: "post",
            data: {
                phone: userPhone,
                tokenStr: tokenStr,
                activityCode: activityCode
            },
            xhrFields: {
                withCredentials: true
            },
            dataType: "json",
            beforeSend: function(){
                showLoading();
            },
            success: function (data) {
                if(data.resultCode == 1){
                    scratch.ctx.closePath();
                    scratchNum = data.resultData.times;
                    scratchTotalNum = data.resultData.gotTimes;
                    tokenStr = data.resultData.tokenStr;
                    scratchUpdata();
                    var _prize = data.resultData.code;
                    showPrizeBox(_prize);
                    scratched = true;
                }else if(data.resultCode == 2){
                    scratchNum = 0;
                    scratchUpdata();
                    alertDailog(data.resultMsg)
                }else{
                    scratchUpdata();
                    alertDailog(data.resultMsg)
                }
            },
            error: function(){
                scratchUpdata();
                alertDailog('服务器繁忙，请稍后再试')
            },
            complete: function(){
                closeLoading();
            }
        })
    }
    //修改手机号码
    changePhone.on('click', function(){
        contentBox.removeClass(stateCls)
    });
    //查看中奖记录
    var prizeListDom = prizeListBox.find('tbody');
    prizeListBtn.on('click', function(){
        $.ajax({
            url: pageUrl.lotteryPrice.url,
            type: "post",
            data: {
                phone: userPhone,
                activityCode: activityCode
            },
            xhrFields: {
                withCredentials: true
            },
            dataType: "json",
            success: function (data) {
                if(data.resultCode == 1){
                    var _list = data.resultData.lotteryWinList,
                        len = _list.length;
                    var _html = '';

                    if(len > 0){
                        for(var i= 0; i< len; i++){
                            _html+= '<tr><td>'+dataFormat(_list[i].addTime)+'</td><td><span class="red">'+_list[i].prize+'</span></td></tr>';
                        }
                        prizeListDom.html(_html);
                        prizeListBox.find('.empty').css('display','none');
                        prizeListBox.find('.has-list').css('display','block')
                    }else{
                        prizeListBox.find('.has-list').css('display','none');
                        prizeListBox.find('.empty').css('display','block')
                    }
                    prizeListBox.removeClass('ui-dialog-hide');
                    overHidden();
                }else{
                    prizeListBox.find('.has-list').css('display','none');
                    prizeListBox.find('.empty').css('display','block');
                    prizeListBox.removeClass('ui-dialog-hide');
                    overHidden();
                }
            },
            complete: function(xhr, status){

            }
        });

    });
    function dataFormat(dd){
        var date = new Date(dd);
        return date.getFullYear() + '.' + (date.getMonth() + 1) + '.' + date.getDate();
    }
//--------------------------------------------------【页面渲染】
    function render(){
        if(userPhone){
            contentBox.addClass(stateCls);
            getPhoneData();
        }else{
            contentBox.removeClass(stateCls);
        }
    }
    render();

//--------------------------------------------------【输入手机号码】
    phoneBtn.on('click', function(){
        var phoneNum = phoneText.val();
        if(phoneCheckReg.test(phoneNum)){
            cookie.setCookie(userPhoneKey, phoneNum, 3600);
            userPhone = phoneNum;
            render();
        }else{
            alert('请输入正确的手机号码')
        }
    });
//--------------------------------------------------【弹窗相关】
    // 弹框关闭
    $('.ui-dailog-close, .ui-dialog-footer .btn').on('click', function(){
        overScroll();
        $(this).parents('.ui-dialog-wrap').addClass('ui-dialog-hide');
    });

    var unTitList = [
        '一定是我刮奖的姿势不对',
        '没刮中？请原地绕3圈再来',
        '什么？一块钱都不给我！',
        '猜到了开头，却没猜到这结局'
        ],
        unTitListLen = unTitList.length;
    function randomNum(num){
        return Math.floor(Math.random()*num);
    }
    var prizeBox = $('#prizeBox'),
        prizeBoxTit = prizeBox.find('.dialog-tit'),
        prizeCont = prizeBox.find('.prize-txt'),
        prizeBtn = prizeBox.find('.btn');

    function showPrizeBox(str){
        prizeCont.text(str);
        if(str == '未中奖'){
            prizeBoxTit.html(unTitList[randomNum(unTitListLen)]);
            prizeBtn.addClass('ui-hide');
        }else{
            prizeBoxTit.html('已放到钱庄账号 '+userPhone+'<br>请到“资产-红包及奖励”查看');
            prizeBtn.removeClass('ui-hide');
        }
        prizeBox.removeClass('ui-dialog-hide');
    }
//--------------------------------------------------【基础数据以及活动数据】
    var curPageUrl = base.switchUrl('scratchCard/index');
    curPageUrl = base.urlQuery(curPageUrl, 'activityCode='+activityCode);
    var shareImg = location.protocol + '//' + location.host + $('#shareImg').val();

    var shareCurPage = {
            title: '钱庄召集令！速来“刮”分百万礼包啦',
            desc: '年终福利提前发啦！来钱庄玩刮刮卡，百万礼包等你来“刮”分，先到先得！',
            url:curPageUrl
        };

    var shareMask = $('#shareMask');
    $('#shareBtn').on('click', function(){
        if(!sharebrand){
            // 获取分享码
            $.ajax({
                url: pageUrl.share.url,
                type: "post",
                data: {
                    phone: userPhone,
                    activityCode: activityCode
                },
                xhrFields: {
                    withCredentials: true
                },
                async: false,
                dataType: "json",
                success: function (data) {
                    if (data.resultCode == 1) {
                        sharebrand = data.resultData
                    }
                }
            });
        }
        shareEvent(sharebrand);
    });
    shareMask.on('click', function(){
        shareMask.css('display', 'none')
    });

    function shareEvent(shareBrand){
        if(base.isApp){
            hybridProtocol({
                tagName: 'getShare',
                data: {
                    dataUrl: "",
                    imgUrl: shareImg,
                    link: base.urlQuery(shareCurPage.url, 'shareBrand='+shareBrand),
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
                imgUrl: shareImg,
                shareLink: base.urlQuery(shareCurPage.url, 'shareBrand='+shareBrand),
                curLink: window.location.href,
                title: shareCurPage.title,
                desc: shareCurPage.desc,
                type: ""
            });
            shareMask.css('display','block');
        }
    }
    // 分享成功码确认
    if(userShareBrand){
        $.ajax({
            url: pageUrl.checkShare.url,
            type: "post",
            data: {
                shareBrand: userShareBrand,
                activityCode: activityCode
            },
            xhrFields: {
                withCredentials: true
            },
            dataType: "json",
            success: function (data) {}
        });
    }
    // 如果活动结束 点击报活动结束
    if(sysTime >= endTime){
        $('#scratchCard').on('click', function(){
            checkTimeEvent();
        })
    }
    // 分享初始化
    shareInit({
        isApp: base.isApp,
        dataUrl: "",
        imgUrl: shareImg,
        shareLink: shareCurPage.url,
        curLink: window.location.href,
        title: shareCurPage.title,
        desc: shareCurPage.desc,
        type: ""
    });
});