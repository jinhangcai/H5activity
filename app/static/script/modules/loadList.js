/**
 * 钱庄网
 * @name 基础js
 * @description 整站基础js模块
 * @date 2015-07-16
 * @version $V1.0$
 */
define(function (require, exports, module) {
    require('zepto.min');
    var scrollLoader = require('scrollLoader');

    var loadList = function(opt){

        this.eventType = opt.eventType || 'down';
        this.ajax = opt.ajax;
        this.currentPage = opt.currentPage || 1;
        this.pernum = opt.pernum || 10;
        this.opt = {
            wrap: opt.wrap || window,
            threshold: opt.threshold || 200,
            autoLoad: opt.autoLoad || true,
            loadStart: opt.loadStart || null,
            loadEnd: opt.loadEnd || null
        };
        this.init();
    };

    var _prototype = loadList.prototype;

    _prototype.init = function(){
        var that = this;
        var loadEvent = function(loaderObj){
            if(loaderObj.loading){
                that.opt.loadStart && that.opt.loadStart();
            }
            $.ajax({
                url: that.ajax.url,
                type: that.ajax.type || "get",
                data: $.extend({
                    currentPage: that.currentPage,
                    pernum: that.pernum
                }, that.ajax.data),
                dataType: "json",
                xhrFields: {
                    withCredentials: true
                },
                success: function (data) {
                    //that.pageNumber = data.resultData.pageNumber;
                    that.currentPage++;

                    that.ajax.success && that.ajax.success(data, next);

                    function next(){
                        that.opt.loadEnd && that.opt.loadEnd();
                        if(that.currentPage <= data.resultData.page.pages){

                            loaderObj.loading = false;
                            loaderObj.resizeHeight();
                            if(loaderObj.opt.autoLoad){
                                loaderObj.autoLoad()
                            }
                        }
                    }
                }
            })
        };
        if(this.eventType == 'down'){
            this.opt.loadDownFn = loadEvent;
        }else{
            this.opt.loadUpFn = loadEvent;
        }
        this.scrollEvent = new scrollLoader(this.opt)
    };

    //--------------------------------------------------【暴露公共方法】
    return loadList;
});