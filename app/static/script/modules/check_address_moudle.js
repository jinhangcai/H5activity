/**
 * 活动跳转 收货地址 判断模块
 * Created by wyj on 2015/10/22.
 */
define(function (require, exports, module) {
//--------------------------------------------------【引入依赖函数】
    require('zepto.min');

    var base = require('base'),
        pageUrl = require('url-map');

//--------------------------------------------------【unit】
    var isApp = base.isApp;
    // 跳转页面走这里
    var checkAppEvent = base.checkAppEvent;

    var $body = $('body');

    function CheckAddress(pram){
        var that = this;
        this.option = {
            title: '是否使用上次收货地址？',
            changeBtnTxt: '我要修改',
            comfirmBtnTxt: '确认使用',
            hideCls: 'ca-hide',
            gotoAddressUrl: base.switchUrl('activityAddressM'),
            fillAddressUrl: base.switchUrl('activityGetM'),
            native_view: isApp? 'app' : '',
            token: '',
            activityCode: '',
            goback: 'true',
            changeFn: function(){
                that.hideDom();
                checkAppEvent(base.urlQuery(that.option.fillAddressUrl, 'activityCode='+that.option.activityCode+'&oauthToken='+that.option.token+'&native_view='+that.option.native_view+'&goback='+that.option.goback), '收货地址');
            },
            comfirmFn: function(){
                $.ajax({
                    type:'post',
                    url:pageUrl.ajaxActivityAddressM.url,
                    data:{
                        name: that.userData.name,
                        tel: that.userData.tel,
                        provinceStr: that.userData.province,
                        cityStr: that.userData.city,
                        address: that.userData.address,
                        activityCode: that.option.activityCode,
                        access_token: that.option.token,
                        native_view: that.option.native_view,
                        pageType: 'only'
                    },
                    async:false,
                    success: function(data) {
                        if(data.resultCode==1){
                            that.hideDom();
                            checkAppEvent(base.urlQuery(that.option.gotoAddressUrl, 'activityCode='+that.option.activityCode+'&oauthToken='+that.option.token+'&native_view='+that.option.native_view+'&goback='+that.option.goback), '收货地址');
                        }else{
                            that.showEmpty(data.resultMsg);
                        }
                    }
                })
            }
        };
        if(pram){
            this.option = $.extend(that.option, pram);
        }
        this.init();
    }
    CheckAddress.prototype = {
        init: function(){
            this.createDom();
            this.event();
        },
        createDom: function(){
            var opt = this.option;
            var sHtml = '<div class="ca-pop '+opt.hideCls+'">' +
                    '<div class="ca-header">'+opt.title+'</div>' +
                    '<div class="ca-content"></div>' +
                    '<div class="ca-footer">' +
                        '<a class="ca-btn changeBtn" href="javascript:;">'+opt.changeBtnTxt+'</a>' +
                        '<a class="ca-btn comfirmBtn" href="javascript:;">'+opt.comfirmBtnTxt+'</a>' +
                    '</div>'+
                '</div>';
            var empty = '<div class="empty '+opt.hideCls+'"><div class="empty-cont"></div><a href="javascript:;" class="empty-btn">我知道了</a></div>';
            this.wrap = $('<div class="ca-wrap '+opt.hideCls+'">');

            var wrap = this.wrap;
            sHtml += empty;
            this.wrap.html(sHtml);
            $body.append(wrap);
            this.pop = wrap.find('.ca-pop');
            this.content = wrap.find('.ca-content');
            this.changeBtn = wrap.find('.changeBtn');
            this.comfirmBtn = wrap.find('.comfirmBtn');
            this.empty = wrap.find('.empty');
            this.emptyCont = this.empty.find('.empty-cont');
            this.emptyBtn = this.empty.find('.empty-btn');
        },
        showCont: function(){
            var opt = this.option;
            var that = this;
            this.wrap.removeClass(opt.hideCls);
            $.ajax({
                type:'post',
                url: pageUrl.checkAddress.url,
                data: {
                    native_view: opt.native_view,
                    oauthToken: opt.token,
                    activityCode: opt.activityCode
                },
                xhrFields: {
                    withCredentials: true
                },
                dataType: "json",
                success: function(data) {
                    if(data.resultCode==0){ // 没有默认地址的
                        that.hideDom();
                        checkAppEvent(base.urlQuery(opt.fillAddressUrl, 'activityCode='+opt.activityCode+'&oauthToken='+opt.token+'&native_view='+opt.native_view+'&goback='+that.option.goback), '收货地址');
                    }else if(data.resultCode==1){ // 有默认地址
                        var userData = data.resultData;
                        var sContHtml = '<p><span class="label">收货人姓名： </span>'+userData.name+'</p>'+
                            '<p><span class="label">手机号码： </span>'+userData.tel+'</p>'+
                            '<p><span class="label">收货地址： </span>'+userData.province+userData.city+userData.address+'</p>';
                        that.userData = data.resultData;
                        that.content.html(sContHtml);
                        that.pop.removeClass(opt.hideCls);
                    }else if(data.resultCode==2){ // 这次活动已经填写过地址的
                        that.hideDom();
                        checkAppEvent(base.urlQuery(opt.gotoAddressUrl, 'activityCode='+opt.activityCode+'&oauthToken='+opt.token+'&native_view='+opt.native_view+'&goback='+that.option.goback), '收货地址');
                    }else if(data.resultCode==3){ // 未登陆
                        that.showEmpty('请先登陆');
                    }else{
                        that.showEmpty(data.resultMsg);
                    }
                }
            })
        },
        hideDom: function(){
            var opt = this.option;
            this.wrap.addClass(opt.hideCls);
            this.pop.addClass(opt.hideCls);
            this.empty.addClass(opt.hideCls);
        },
        showEmpty: function(str){
            var opt = this.option;
            this.emptyCont.html(str);
            this.empty.removeClass(opt.hideCls);
            this.wrap.removeClass(opt.hideCls);
        },
        event: function(){
            var opt = this.option;
            var that = this;
            this.changeBtn.on('click', function(){
                opt.changeFn && opt.changeFn();
            });
            this.comfirmBtn.on('click', function(){
                opt.comfirmFn && opt.comfirmFn();
            });
            this.emptyBtn.on('click', function(){
                that.hideDom();
            });
        }
    };
    return CheckAddress;
});