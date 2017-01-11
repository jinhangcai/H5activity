(function(root, factory){
    if(typeof define == 'function'){
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
        root.Sketch = factory(root, root.jQuery || root.Zepto || root.$)
    }
})(this, function(root, $){

    /*
     ** opts:
     **	color:#333
     **
     **
     **
     */
    function Sketch(el, opts){
        this.el = el;
        this.options = $.extend({
            color: '#333',
            size: 7,
            penStyle: 'source-over'
        },opts);
        this.init();
    }

    Sketch.prototype = {
        init: function(){
            this.canvas = this.el[0];
            this.width = this.el.width();
            this.height = this.el.height();
            this.ctx = this.canvas.getContext('2d');
            this.drawing = false;
            this.drawEvent();
        },
        reset: function(){
            this.drawLength = 0;
            this.ctx.clearRect(0, 0, this.width, this.height);
        },
        drawEvent: function(){

            var that = this;
            this.touchsX = 0;
            this.touchsY = 0;
            this.drawLength = 0;
            this.posX = this.el.offset().left;
            this.posY = this.el.offset().top;

            this.el.on('touchstart touchmove touchend', function(event){
                event.preventDefault();
                event.stopPropagation();
                var touches = (event.changedTouches || event.originalEvent.targetTouches),
                    first = touches[0],
                    type = '';
                switch (event.type) {
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
                that['draw'+type](first);
            })
        },
        drawstart: function(e){
            if(this.drawing){return;}
            this.drawing = true;
            this.ctx.globalCompositeOperation = this.options.penStyle;  //画画的位置
            this.ctx.lineJoin = 'round';        //线相交拐点的类型
            this.ctx.lineCap = 'round';         //线尾端的样式
            this.ctx.strokeStyle = this.options.color;  //笔触颜色
            this.ctx.fillStyle = this.options.color; //线条颜色
            this.ctx.lineWidth = this.options.size;  //线条宽度

            this.touchsX = Math.floor(e.pageX - this.posX);
            this.touchsY = Math.floor(e.pageY - this.posY);

            this.ctx.beginPath();       //开始或者结束一段路径
            this.ctx.arc(this.touchsX,this.touchsY,this.options.size/2,0,2*Math.PI);    //创建圆形
            this.ctx.fill();   //填充

        },
        drawmove: function(e){
            if(!this.drawing){return;}
            this.ctx.beginPath();  //开始或者结束一段路径
            this.ctx.moveTo(this.touchsX, this.touchsY);        //把路径移动到画布的指定点
            this.ctx.lineTo(this.touchsX = e.pageX - this.posX, this.touchsY = e.pageY - this.posY);    //添加一个新点
            this.ctx.stroke();      //绘制已经定义的路径

        },
        drawend: function(){
            if(!this.drawing){return;}
            this.drawing = false;
            if(this.options.penStyle == 'source-over'){
                this.drawLength++
            }
        },
        setLineWidth: function(width){
            this.options.size = width;
        },
        setColor: function(color){
            this.options.color = color;
        },
        switchPen: function(pen){
            if(pen == 'pen'){
                this.options.penStyle = 'source-over'
            }else if(pen == 'eraser'){
                this.options.penStyle = 'destination-out'
            }
        },
        getDrawLenght: function(){
            return this.drawLength;
        },
        setBg: function(){
            var that = this;
            var _bg = this.options.bg;
            if(_bg){
                if (_bg.charAt(0) === '#') {
                    this.canvas.backgroundColor = _bg;
                }else{
                    var _img = document.createElement("img");
                    _img.onload = function(){
                        that.ctx.drawImage(this, 0, 0)
                    };
                    _img.setAttribute('crossOrigin','anonymous');
                    _img.src=_bg;
                }
            }
        },
        getImg: function(){
            return this.canvas.toDataURL('image/png');
        }
    };

    return Sketch;
});