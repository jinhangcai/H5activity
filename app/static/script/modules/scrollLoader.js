(function (factory) {
    if (typeof define === 'function' && (define.amd || define.cmd)) {
        define(factory);
    } else if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = factory();
    } else {
        window.ScrollLoader = factory();
    }
})(function(){
    var global = window;
    var scrollLoader = function(opt){
        opt = opt || {};
        this.opt = {
            wrap: opt.wrap || global,
            threshold: opt.threshold || 200,
            autoLoad: opt.autoLoad || false,
            loadUpFn: opt.loadUpFn || null,
            loadDownFn: opt.loadDownFn || null
        };
        this.init();
    };

    var _prototype = scrollLoader.prototype;

    _prototype.init = function(){
        this.loading = false;
        this.contentBox = this.opt.wrap === global ? document.body : this.opt.wrap;
        this.resizeHeight();
        this.events();
    };

    _prototype.resizeHeight = function(){
        this.wrapHeight = this.opt.wrap === global ? document.documentElement.clientHeight : this.opt.wrap.clientHeight;
        this.conntentHeight = this.contentBox.scrollHeight;
    };

    _prototype.autoLoad = function(){
        this.handler(this);
    };

    _prototype.handler = function(that){
        if(that.loading){
            return;
        }
        var scrollTop = that.contentBox == document.body ? (that.contentBox.scrollTop || document.documentElement.scrollTop) : that.contentBox.scrollTop;

        if(that.opt.loadUpFn && scrollTop <= that.opt.threshold){
            that.loading = true;
            that.opt.loadUpFn(that);
        } else if(that.opt.loadDownFn && that.conntentHeight - scrollTop - that.wrapHeight <= that.opt.threshold){
            that.loading = true;
            that.opt.loadDownFn(that)
        }

    };
    _prototype.events = function(){
        var that = this;
        if(this.opt.autoLoad){
            this.autoLoad();
        }
        this.opt.wrap.addEventListener('scroll', function(){
            that.handler(that)
        }, false);
    };
    return scrollLoader;
});
