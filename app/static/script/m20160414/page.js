define(function (require) {
    require('zepto.min');
    require('fastclick');
    //依赖
    var shareInit = require('share-init'),
        base = require('base'),
        CheckAddress = require('check_address_moudle'),
        hybridProtocol = require('native-calls'),
        pageUrl = require('url-map'),
        Format = require('date-format'),
        hrefParameter = require('href-parameter');


    // fastclick代替zepto的tap,防止点透bug
    window.addEventListener('load', function () {
        FastClick.attach(document.body);
    }, false);

    var timeFormat = Format;
    var activityCode='20160414',
        isLogin = base.checkLogin(),
        activityData = base.activityData(activityCode),
        sysTime = activityData.systemTime,      //系统时间
        startTime = activityData.startDate,     //开始时间
        endTime = activityData.endDate;         //结束时间
    var hasNum = 0,totalNum = 0,tokenStr= '';
    var isSmash = false;
    function cativity(){
        //活动未开始
        if(sysTime < startTime){
            $('.btn').css({'background':'#b5b5b5','box-shadow':'0px -8px 1px #959595 inset'});
            $('.btn').html('活动未开始');
        }
        //活动开始 && 登入
        if(isLogin && sysTime > startTime){
            //投资金额文案显示
            $('.theinvest').css('display','block');
            //累计投资接口
            depreciation();
            //中奖记录接口
            $('.number').css('display','block');
            $('.winning').css('display','block');
        }
        if(sysTime >= startTime){
            $('#btnrun').css('display','block');
        }
        //活动开始 &&未结束 && 登入
        if(sysTime >= startTime && sysTime <endTime  && isLogin){
            //抽奖次数接口
            dataInit();
        }
        //活动结束
        if(sysTime > endTime){
            $('.btn').css({'background':'#b5b5b5','box-shadow':'0px -8px 1px #959595 inset'});
            $('.btn').html('活动已结束');
        }
        //活动结束 &&  登入
        if(sysTime > endTime && isLogin){
            $('.number span').html(0);
        }
    }
    cativity();
    if($('.between .investin .theinvest').is(':hidden')){
        $('.bandit').css('margin-top','1.1rem');
    }else{
        $('.bandit').css('margin-top','.72rem');
    }
    var checkAddress;
    function checkTimeEvent(){
        //活动开始或结束 && 未登入   -->跳转登入
        if(sysTime > startTime && !isLogin){
            base.gotoLogin();
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
    $('#btnrun').on('click',function(){
        checkTimeEvent();
    });





    //图片懒加载
    function loadImg(url,callback){
        var img = new Image();
        img.onload = function(){
            callback && callback();
        };
        img.src = url;
    }
    function lazyImgs(){
        var imgs = $('.prize img');
        imgs.each(function(i, item){
            var self = $(item),
                dataSrc = self.attr('data-src');
            if(dataSrc){
                loadImg(dataSrc, function(){
                    self.attr('src', dataSrc).removeAttr('data-src');
                })
            }
        })
    }
    lazyImgs();




    //老虎机
    var isBegin = false;
    var positionY = 0;
    var preNum = 0;
    var domNum = $(".num"),
        domNumHeight = domNum.height(),
        allHeight = domNumHeight*7;
    domNum.css({
        height: domNumHeight,
        'background-size': '100% '+allHeight+'px',
        'backgroundPositionY' :0
    });
    $(function(){

        //easeInOutCirc
        $('.btn').click(function(){
           // 活动未开始
            if(sysTime < startTime || sysTime > endTime){
                return false;
            }

            //未登入
            if(!isLogin){
                base.gotoLogin();
                return;
            }
           // 抽奖次数为0
           // if(parseInt($('.number span').html()) == 0){
           //     $('.nolast').css('display','block');
           //     return false;
           // }
            if(isBegin) return false;

            frenzy();


        });
    });





    // 分享确认
    var userShareBrand = hrefParameter.get('shareBrand');
    if(userShareBrand){
        $.ajax({
            url: pageUrl.checkUserShare.url,
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


    //分享
    var shareImg = location.protocol + '//' + location.host + $('#sharePic').val(),
        curPageUrl = window.location.href;
    var shareCurPage = {
        title: '我本钱不多，这次来钱庄网搜刮4月旅游资金！',
        desc:  '去哪玩都需要钱啊！还好有钱庄！这次的奖品太丰厚了，你挑一样走吧！',
        url: base.switchUrl('m'+activityCode+'/index')
    };
    // 页面分享初始化
    function shareEvent(){
        shareInit({
            isApp: base.isApp,
            dataUrl: "",
            imgUrl: shareImg,
            shareLink: base.urlQuery(shareCurPage.url,"shareBrand="+sharebrand),
            curLink: curPageUrl,
            title: shareCurPage.title,
            desc: shareCurPage.desc,
            type: ""
        });
    }
    // 登录时，获取分享码
    var sharebrand = '';
    if(isLogin){
        $.ajax({
            url: pageUrl.userShare.url,
            type: "post",
            data: {
                oauthToken: base.token,
                native_view: (base.isApp ? 'app' : ''),
                activityCode: activityCode
            },
            xhrFields: {
                withCredentials: true
            },
            dataType: "json",
            success: function (data) {
                if (data.resultCode == 1) {
                    sharebrand = data.resultData;
                    shareEvent();
                }
            }
        });
    }else{
        shareEvent();
    }

    //主动分享
    function userShareEvent(){
        if(base.isApp){
            hybridProtocol({
                tagName: 'getShare',
                data: {
                    dataUrl: "",
                    imgUrl: shareImg,
                    link: base.urlQuery(shareCurPage.url, 'shareBrand='+sharebrand),
                    title: shareCurPage.title,
                    desc: shareCurPage.desc,
                    type: ""
                },
                success: function (data) {},
                error: function (data) {}
            });
        }else{
            $('.poker').css('display','block');
        }
    }

    //抽奖次数请求
    function dataInit(){
        $.ajax({
            url: pageUrl.userLotteryTimes.url,
            type: "post",
            data: {
                oauthToken: base.token,
                native_view: (base.isApp ? 'app' : ''),
                activityCode: activityCode,
                lotteryType: 'lottery'
            },
            xhrFields: {
                withCredentials: true
            },
            dataType: "json",
            success: function (data) {
                if (data.resultCode == 1) {
                    hasNum = data.resultData.times;
                    tokenStr = data.resultData.tokenStr;
                    totalNum = data.resultData.gotTimes;
                    if(data.resultData.gotTimes >= 8 && data.resultData.times == 0){
                        $('.btn').html('机会已用完');
                        $('.btn').css({'background':'#b5b5b5','box-shadow':'0px -8px 1px #959595 inset'});
                    }
                    $('.number span').html(hasNum);
                }
            }
        });
    }
    //抽奖请求
    function frenzy(){
        if(hasNum == 0 && totalNum >= 8){
            $('.btn').html('机会已用完');
            $('.btn').css({'background':'#b5b5b5','box-shadow':'0px -8px 1px #959595 inset'});
            return false;
        }
        if(hasNum == 0 && totalNum < 8){
            $('.nolast').css('display','block');
            return false;
        }
        $.ajax({
            url: pageUrl.userLottery.url,
            type: "post",
            data: {
                oauthToken: base.token,
                native_view: (base.isApp ? 'app' : ''),
                activityCode: activityCode,
                tokenStr: tokenStr,
                lotteryType: 'lottery'
            },
            xhrFields: {
                withCredentials: true
            },
            dataType: "json",
            beforeSend: function(){
                isSmash = true;
            },
            success: function (data) {
                var resultin;
                var num='';
                isBegin = true;
                if(data.resultCode == 0){
                    //$('.btn').html('机会已用完');
                    //$('.btn').css({'background':'#b5b5b5','box-shadow':'0px -8px 1px #959595 inset'});
                    $('.nolast').css('display','block');
                    isBegin = false;
                    return false;
                }
                if (data.resultCode == 1) {
                    //显示剩余抽奖次数
                    $('.number span').html(data.resultData.times);
                    hasNum = data.resultData.times;
                    tokenStr = data.resultData.tokenStr;
                    totalNum = data.resultData.gotTimes;
                    var arr=['108元红包',"1元红包",'5元红包','10元红包','20元红包','30元红包','50元红包'];
                    for(var i=0;i<arr.length;i++){
                        if(data.resultData.code == arr[i]){
                            resultin = i;
                            num = arr[i].split('元')[0];
                        }
                    }
                    if(hasNum ==0 && totalNum >= 8){
                        $('.btn').html('机会已用完');
                        $('.btn').css({'background':'#b5b5b5','box-shadow':'0px -8px 1px #959595 inset'});
                       // $('.nolast').css('display','block');
                        //easeInOutCirc
                    }

                    var u = $('.band-bgright').height();
                    var num_arr = [resultin,resultin,resultin];
                    $(".num").each(function(index){
                        var _this = $(this);
                        positionY = -(u*14 + u*num_arr[index]);
                            _this.css({
                                'transition': 'background-position-y '+ (6+index)+'s ease-out',
                                '-webkit-transition':'background-position-y '+ (6+index)+'s ease-out',
                                'background-position-y':positionY
                            });
                            if(index==2) {
                                _this.one('transitionend webkitTransitionEnd', function(){
                                    $('.redpacket span').html(num);
                                    $('.redpacket').css('display','block');
                                    hasNum = data.resultData.times;
                                    totalNum = data.resultData.gotTimes;
                                    isBegin = false;
                                    $(".num").css({'backgroundPositionY': -u*num_arr[index],'transition':'none','-webkit-transition':'none'});
                                });
                            }
                    });
                }
            }
        });
    }

    //中奖纪录
    function record(){
        $.ajax({
            url: pageUrl.myPrice.url,
            type: "post",
            data: {
                oauthToken: base.token,
                native_view: (base.isApp ? 'app' : ''),
                activityCode: activityCode
            },
            xhrFields: {
                withCredentials: true
            },
            dataType: "json",
            success: function (data) {
                var dataList = data.resultData.lotteryWinList;
               if(dataList.length == 0){
                   $('.draw .nobb').css({'display':'block','padding-top':'.33rem'});
                   $('.draw .btntitle').css('visibility','hidden');
                   $('.draw ol').css('display','none');
                   return false;
               }
                $('.draw ol').css('display','blo' +
                    'ck');
                $('.draw .btntitle').css('visibility','visible');
                $('.draw .nobb').css({'display':'none'});
                $('.draw ol').html('');
               for(var i=0; i<dataList.length; i++){
                   var datain = timeFormat.format(dataList[i].addTime, 'yyyy-MM-dd');
                   var money = dataList[i].prize.split('红')[0];
                   var lis = "<li><span>"+datain+"</span><span>"+money+"</span>";
                   $('.draw ol').append(lis);
               }

            }
        }
      )
    }
    //累计投资
    function depreciation(){
        $.ajax({
                url: pageUrl.totalTender.url,
                type: "post",
                data: {
                    oauthToken: base.token,
                    native_view: (base.isApp ? 'app' : ''),
                    activityCode: activityCode
                },
                xhrFields: {
                    withCredentials: true
                },
                dataType: "json",
                success: function (data) {
                   $('.theinvest span').html(data.resultData);
                }
            }
        )
    }
    //滚动数据显示
    var indexin;
    var num = 0;
    var lotteryWrap = $('.lottery');
    var lotteryheight =lotteryWrap.height();
    lotteryWrap.height(lotteryheight);
    function roll(){
        $.ajax({
                url: pageUrl.lotteryShow.url,
                type: "post",
                data: {
                    oauthToken: base.token,
                    native_view: (base.isApp ? 'app' : ''),
                    activityCode: activityCode
                },
                xhrFields: {
                    withCredentials: true
                },
                dataType: "json",
                success: function (data) {
                   if(data.resultData){
                       var _l = data.resultData.length;
                       for(var i=0;i<_l;i++){
                           var phone = data.resultData[i].phone;
                           var prize = data.resultData[i].prize;
                           var lis = "<li>"+phone+" 中了 "+prize+"</li>";
                           $('.lotteryulin').append(lis);
                       }
                       $('.lottery  li').height(lotteryheight);
                       indexin = _l;
                       setInterval(function(){
                           if(num >= indexin){
                               num = 1;
                               transition(num);
                           }else{
                               num++;
                               transition(num);

                           }

                       },3000);
                   }

                }
            }
        )
    }
    roll();

    function transition(num){
        $('.lottery .lotteryulin').css({
            "-webkit-transition":"all 1s ease 2s",
            "-webkit-transform":'translateY(' +(-lotteryheight*(num))+"px)",
            "transition":"all 1s ease 2s",
            "transform":'translateY(' +(-lotteryheight*(num))+"px)"
        });
        if(num  == indexin){
            $('.lottery .lotteryulin').css({
                "-webkit-transform":"translateY(0rem)",
                "transform":"translateY(0rem)",
                "-webkit-transition":"all 0s ease 0s",
                "transition":"all 0s ease 0s"
            });
            return;
        }
    }


    //开启活动说明蒙板
    $('.activity').on('click',function(){
        $('.tool').css('display','block');
    })
    //关闭活动说明蒙板
    $('.tool .close-in').on('click',function(){
        $('.tool').css('display','none');
    })
    //主动分享
    $('.immediately').on('click',function(){
        userShareEvent();
    });
    //关闭微信分享蒙板
    $('.poker').on('click',function(){
        $('.poker').css('display','none');
    });
    //立即投资
    $('.investment').on('click',function(){
        base.gotoProductList();
    });
    //关闭暂无机会蒙板
    $('.sure').on('click',function(){
        $('.nolast').css('display','none');
    });
    //关闭中奖纪录蒙板
    $('.draw .close-in').on('click',function(){
        $('.draw').css('display','none');
    });
    //关闭获得红包金额蒙板
    $('.redpacket .sure').on('click',function(){
        $('.redpacket').css('display','none');
    });
    //打开中奖记录
    $('.winning').on('click',function(){
        record();
        $('.draw').css('display','block');
    });
    //document.onreadystatechange = subSomething;
    //function subSomething(){
    //    if(document.readyState == "UNINITIALIZED"){
    //        console.log(1)
    //    }
    //    if(document.readyState == "loading"){
    //        console.log(2)
    //    }
    //    if(document.readyState == "loaded"){
    //        console.log(3)
    //    }
    //    if(document.readyState == "INTERACTIVE"){
    //        console.log(4)
    //    }
    //    if(document.readyState == "complete"){
    //        console.log(5)
    //    }
    //}
});