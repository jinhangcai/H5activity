/**
 * Created by Administrator on 2015/11/25.
 */
(function (root, factory) {
    if (typeof define === 'function' && (define.amd || define.cmd)) {
        define(function (require) {
            require('zepto.min');
            return factory(root);
        });
    } else {
        root.Pop = factory(root, {});
    }
})(this, function () {

    function scratchCard(el, options) {
        this.$el = $(el);
        this.options = options;

        this.enabled = true;

        this.init();
    }

    scratchCard.prototype = {
        init: function(){

            this.canvas = document.createElement('canvas');
            if(!this.canvas.getContext){
                this.$el.html('您的浏览器版本太低啦，请升级您的浏览器');
                return true;
            }
            this.ctx = this.canvas.getContext('2d');

            this.$canvas = $(this.canvas);

            this.$el.append(this.$canvas);

            this.reset();
        },
        reset: function(){
            var that = this,
                width = Math.ceil(that.$el.width()),
                height = Math.ceil(that.$el.height());
            this.pixels = width * height;
            this.$canvas.attr('width', width).attr('height', height);
            this.enabled = true;
            this.startting = false;
            // Set fg.
            if (this.options.fg) {
                if (this.options.fg.charAt(0) === '#') {
                    this.ctx.fillStyle = this.options.fg;
                    this.ctx.beginPath();
                    this.ctx.rect(0, 0, width, height);
                    this.ctx.fill();
                    this.setBgImg();
                    this.event();
                }
                else {
                    // Have to load image before we can use it.
                    var _img = $(new Image()).on('load',function(){
                        that.ctx.drawImage(_img[0], 0, 0, width, height);
                        that.setBgImg();
                        that.event();
                    }).attr('src', that.options.fg)
                }
            }
        },
        setBgImg: function(){
            var that = this;
            if (this.options.bg) {
                if (this.options.fg.charAt(0) === '#') {
                    this.canvas.backgroundColor = this.options.bg;
                }else{
                    $(new Image()).on('load',function(){
                        that.$canvas.css({
                            'backgroundImage': 'url('+that.options.bg+')',
                            'background-size': '100% 100%'
                        })
                    }).attr('src', this.options.bg)
                }
            }
        },
        event: function(){
            var that = this;
            this.touchsX = 0;
            this.touchsY = 0;
            this.$canvas.on('touchstart touchmove touchend touchcancel', function(event){
                if(!that.enabled){
                    return true;
                }
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
                        event.preventDefault();
                        break;
                    case 'touchend':
                        type = 'end';
                        break;
                    default:
                        return;
                }
                that.touchsX = Math.floor(first.pageX - that.$canvas.offset().left);
                that.touchsY = Math.floor(first.pageY - that.$canvas.offset().top);
                that['event'+type]();
                if(that.options.scratchMove){
                    that.options.scratchMove(event, that.scratchPercent());
                }
            })
        },
        scratchPercent: function() {
            var hits = 0,
                imageData = this.ctx.getImageData(0,0, this.canvas.width, this.canvas.height);

            for (var i=0, ii=imageData.data.length; i<ii; i=i+4) {
                if (imageData.data[i] === 0 && imageData.data[i+1] === 0 && imageData.data[i+2] === 0 && imageData.data[i+3] === 0) {
                    hits++;
                }
            }

            return (hits / this.pixels) * 100;
        },
        eventstart: function(){
            this.startting = true;
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.lineJoin = 'round';
            this.ctx.lineCap = 'round';
            this.ctx.strokeStyle = this.options.color;
            this.ctx.lineWidth = this.options.size;

            //draw single dot in case of a click without a move
            this.ctx.beginPath();
            this.ctx.arc(this.touchsX, this.touchsY, this.options.size/2, 0, Math.PI*2, true);
            this.ctx.closePath();
            this.ctx.fill();

            //start the path for a drag
            this.ctx.beginPath();
            this.ctx.moveTo(this.touchsX, this.touchsY);

        },
        eventmove: function(){
            if(!this.startting){return true;}
            this.ctx.lineTo(this.touchsX, this.touchsY);
            this.ctx.stroke();
        },
        eventend: function(){
            if(!this.startting){return true;}
            this.ctx.closePath();
            this.startting = false;
        }
    };

    return scratchCard;
});