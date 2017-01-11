(function(root,factory){
    if(typeof define == 'function' && define.amd){
        if(define.amd){
            define(['jquery'], function($){
                return factory(root, $)
            })
        }else if(define.cmd){
            define(function(require){
                var $ = require('jquery');
                return factory(root, $)
            })
        }
    } else if (typeof exports !== 'undefined') {
        var jQuery = require('jquery');
        factory(root, jQuery)
    }else{
        root.obj = factory(root, root.jQuery || root.Zepto || root.$)
    }
})(this,function(root,$){
    function obj(el,opts){
        this.el = el;
        this.opts = opts;
        this.options = $.extend({
             color:'#ccc',
             Size:'13px'
        },opts);
        console.log(this.options)
        this.init()
    }
    obj.prototype = {
        init:function(){
           // this.drawEvent()
            this['drawEvent']();
            this['drawEnd']();
            this.drawstart();
        },
        drawEvent:function(){
            var docCookies = {
                getItem: function (sKey) {
                    //decodeURIComponent:解码   encodeURIComponent:编码
                    return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
                },
                setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
                    if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
                    var sExpires = "";
                    if (vEnd) {
                        switch (vEnd.constructor) {
                            case Number:
                                sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
                                break;
                            case String:
                                sExpires = "; expires=" + vEnd;
                                break;
                            case Date:
                                sExpires = "; expires=" + vEnd.toUTCString();
                                break;
                        }
                    }
                    document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
                    return true;
                },
                removeItem: function (sKey, sPath, sDomain) {
                    if (!sKey || !this.hasItem(sKey)) { return false; }
                    document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + ( sDomain ? "; domain=" + sDomain : "") + ( sPath ? "; path=" + sPath : "");
                    return true;
                },
                hasItem: function (sKey) {
                    return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
                },
                keys: /* optional method: you can safely remove it! */ function () {
                    var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
                    for (var nIdx = 0; nIdx < aKeys.length; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
                    return aKeys;
                }
            };
            //docCookies.setItem('wyj1', 'ok', 'Thu, 01 Jan 2017 00:00:00 GMT', '/', '', '');//添加
           // docCookies.removeItem('wyj1', '/', '');//删除
          // var getname =  docCookies.getItem('wyj1');  //获取某个cookie值
          //   if(docCookies.hasItem('wyj1')){    //判断是否存在这个cookie
          //       console.log(docCookies.keys())
          //   }
          //  console.log(document.cookie)
           // this.drawEnd()
        },
        drawstart:function(event){
            console.log(this.el,event)
            this.el.on('touchstart touchmove touchend', function(event){
                event.preventDefault();
                event.stopPropagation();
                var touches = (event.changedTouches || event.originalEvent.targetTouches),
                    first = touches[0],
                    type = '';
                switch (event.type){
                    case 'touchstart':
                        type = 'start';
                        break;
                    case 'touchmove':
                        type = 'move';
                        break;
                    case 'touchend':
                        type = 'end';
                        break;
                    default:
                        return;
                }
                console.log(event,touches)
            })
        },
        drawEnd:function(){
            //去重
            var arr = [1,2,3,4,5,6,7,7,7,8,8,9,10,10,11];
            function unique(arr) {
                var result = [], hash = [];
                for (var i = 0, elem; (elem = arr[i]) != null; i++) {
                    if (!hash[elem]) {
                        result.push(elem);
                        hash[elem] = true;
                    }
                }
                console.log(result)
            }
            unique(arr)
        }

    };
    return obj
});