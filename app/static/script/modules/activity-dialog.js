/**
 * Created by wyj on 2015/11/8.
 * 用于活动弹窗
 */
define(function (require, exports, module) {
//--------------------------------------------------【require】
    require('zepto.min');

    function Dialog(param){
        var that = this;
        this.opt = {
            onlyCls: '',
            uiCls: 'ui-dialog',
            btns: [{
                cls: 'btn',
                text: '朕知道了'
            }],
            openfn: null,
            closefn: null
        };
        if(param){
            this.opt = $.extend(that.opt, param);
        }
        this.init();
    }
    Dialog.prototype = {
        init: function(){
            this.createDom();
            this.event();
        },
        createDom: function(){
            var body = $('body');
            var _dom = '<div class="'+ this.opt.uiCls+'-wrap '+ this.opt.uiCls+'-hide '+ this.opt.onlyCls+'">' +
                    '<div class="'+ this.opt.uiCls+'-box">' +
                        '<a href="javascript:;" class="'+ this.opt.uiCls+'-close"><i class="iconfont icon-close"></i></a>' +
                        '<div class="'+ this.opt.uiCls+'-header"></div>' +
                        '<div class="'+ this.opt.uiCls+'-content"></div>' +
                        '<div class="'+ this.opt.uiCls+'-footer"></div>' +
                    '</div>' +
                '</div>';
            this.dom = $(_dom);
            body.append(this.dom);
            this.box = this.dom.find('.'+this.opt.uiCls+'-box');
            this.closeBtn = this.dom.find('.'+this.opt.uiCls+'-close');
            this.header = this.dom.find('.'+this.opt.uiCls+'-header');
            this.content = this.dom.find('.'+this.opt.uiCls+'-content');
            this.footer = this.dom.find('.'+this.opt.uiCls+'-footer');
            var btns = this.opt.btns,
                btnsHtml = '';
            for(var i = 0,l = btns.length; i < l; i++){
                btnsHtml += '<a href="javascript:;" class="'+this.opt.uiCls+'-'+btns[i]['cls']+'">'+btns[i]['text']+'</a>'
            }
            this.btns = $(btnsHtml);
            this.footer.append(this.btns);
        },
        open: function(){
            this.dom.removeClass(this.opt.uiCls+'-hide');
            this.opt.openfn && this.opt.openfn(this);
        },
        close: function(){
            this.dom.addClass(this.opt.uiCls+'-hide');
            this.opt.closefn && this.opt.closefn(this);
        },
        event: function(){
            var btns = this.opt.btns;
            var that = this;
            this.btns.on('click', function(){
                var index = $(this).index();
                if(btns[index]['callback']){
                    btns[index]['callback'](that);
                }else{
                    that.close();
                }
            });
            this.closeBtn.on('click', function(){
                that.close();
            });
        },
        setcontent: function(htmlstr){
            this.content.html(htmlstr);
            return this;
        },
        setheader: function(htmlstr){
            this.header.html(htmlstr);
            return this;
        }
    };


    return Dialog;
});