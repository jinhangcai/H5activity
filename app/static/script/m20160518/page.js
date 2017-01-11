define(function (require) {
    require('zepto.min');
    require('fastclick');
    //依赖
    var shareInit = require('share-init'),
        base = require('base'),
        CheckAddress = require('check_address_moudle');
        // fastclick代替zepto的tap,防止点透bug
        window.addEventListener('load', function () {
            FastClick.attach(document.body);
        }, false);

        var floatfix = $('.floatfix'),  //弹窗按钮
            poker = $('.poker'),       //弹窗
            close = $('.close'),      // 关闭弹窗按钮
            address = $('.address'),    //收货地址
            bbs = $('.bbs');            //帖子
        var activityCode='20160518',
            isLogin = base.checkLogin(),
            activityData = base.activityData(activityCode),
            sysTime = activityData.systemTime,      //系统时间
            startTime = activityData.startDate;     //开始时间
    console.log(sysTime,startTime)
         function timeshowaddress(){
             //活动已开始
             if(sysTime > startTime){
                 address.show();
             }
         }
            timeshowaddress();
        //分享
        var shareImg = location.protocol + '//' + location.host + $('#sharePic').val(),
            curPageUrl = window.location.href;
        var shareCurPage = {
            title: '5月迪士尼嗨翻天， 钱庄邀您开启童话之旅！',
            desc:  '点亮心中奇梦，这个夏天，我和迪士尼有个约会！',
            url: base.switchUrl('m'+activityCode+'/index')
        };
        function shareEvent(){
            shareInit({
                isApp: base.isApp,
                dataUrl: "",
                imgUrl: shareImg,
                shareLink: base.urlQuery(shareCurPage.url),
                curLink: curPageUrl,
                title: shareCurPage.title,
                desc: shareCurPage.desc,
                type: ""
            });
        }
        shareEvent();
        var checkAddress;
        function checkTimeEvent(){
            //判断或者是否开始
            if(!isLogin){
                base.gotoLogin();
                return;
            }
            //跳转收货地址
            if(sysTime > startTime && isLogin){
                checkAddress = checkAddress || new CheckAddress({
                        token: base.token,
                        activityCode: activityCode
                    });
                checkAddress.showCont();
            }
        }
        //跳转登入或收货地址
        address.on('click',function(){
            checkTimeEvent();
        });
        //弹窗显示
        floatfix.on('click',function(){
            poker.show();
        });
        close.on('click',function(){
            poker.hide();
        });
        //活动帖跳转
        bbs.on('click', function(){
            base.checkAppEvent('https://bbs.qian360.com/posts/list/2545.page', '5月迪士尼嗨翻天， 钱庄邀您开启童话之旅！')
        });
    //var canvas = $('#canvas');
    //var sktOpt = false ? {bg: '/'+mydata.picUrl+'?t='+mydata.updateTime} : {a:2};
    //var skt = new obj(canvas, sktOpt);
   // skt.drawEnd();






function clock(){
    var mycanvas = document.getElementById('canvas'),
        headbomonewidth = $('#headbomone').css('width'),
        headbomoneheight = $('#headbomone').css('height'),
        deg=2*Math.PI/12,
        time=new Date(),
        hour = time.getHours()*2*Math.PI/12,
        minute = time.getMinutes()*2*Math.PI/60,
        second=time.getSeconds()*2*Math.PI/60,
        cxt = mycanvas.getContext("2d");
        mycanvas.width = parseInt(headbomonewidth);
        mycanvas.height = parseInt(headbomoneheight);
        //圆
        cxt.beginPath();
        cxt.arc(mycanvas.width/2,mycanvas.height/2,mycanvas.width/2.2,0,Math.PI*2);
        cxt.stroke();
        //1-12
        cxt.beginPath();
        cxt.translate(mycanvas.width/2,mycanvas.height/2);
        for(var i=1;i<13;i++){
            var x1=Math.sin(i*deg);
            var y1=-Math.cos(i*deg);
            cxt.fillStyle="#fff";
            cxt.font="bold 20px Calibri";
            cxt.textAlign='center';
            cxt.textBaseline='middle';
            cxt.fillText(i,x1*120,y1*120);
        }
        cxt.stroke();
        //圆心
        cxt.beginPath();
        cxt.arc(0,0,5,0,Math.PI*2);
        cxt.fillStyle = '#000';
        cxt.fill();
        //秒  红色
        cxt.save();
        cxt.rotate(second);
        cxt.beginPath();
        cxt.strokeStyle  = '#dd2e2e';
        cxt.lineWidth = 3;
        cxt.lineCap = 'round';
        cxt.moveTo(0,0);
        cxt.lineTo(0,-100);
        cxt.stroke();
        cxt.restore();
        //分钟    黄色
        cxt.save();
        cxt.rotate(minute);
        cxt.beginPath();
        cxt.strokeStyle  = '#dcd62f';
        cxt.lineWidth = 4;
        cxt.lineCap = 'round';
        cxt.moveTo(0,0);
        cxt.lineTo(0,-80);
        cxt.stroke();
        cxt.restore();
        //小时    黑色
        cxt.save();
        cxt.rotate(hour);
        cxt.beginPath();
        cxt.strokeStyle  = '#000';
        cxt.lineWidth = 5;
        cxt.lineCap = 'round';
        cxt.moveTo(0,0);
        cxt.lineTo(0,-50);
        cxt.stroke();
        cxt.restore();


}
    clock();
    setInterval(clock,1000);
});