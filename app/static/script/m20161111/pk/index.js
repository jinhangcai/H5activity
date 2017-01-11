define(function (require) {
    require('zepto.min');
    require('fastclick');
    //依赖
    var shareInit = require('share-init'),
        pageUrl = require('url-map'),
        base = require('base'),
        Vue = require('vue');

    // fastclick代替zepto的tap,防止点透bug
    window.addEventListener('load', function () {
        FastClick.attach(document.body);
    }, false);


    var activityCode = '20161111',
        activityData = base.activityData(activityCode),
        userPhone = activityData.phone,         //用户手机号 非登录状态没有该字段，可用作判断是否登录
        sysTime = activityData.systemTime,      //系统时间
        startTime = activityData.allLinkTime[1].startTime,     //开始时间
        endTime = activityData.allLinkTime[1].endTime;     //结束时间

    var shareImg = location.protocol + '//' + location.host + $('#sharePic').val(),
        curPageUrl = window.location.href;
    var shareCurPage = {
        title: '双11多存一点，少花一点，钱庄这次优惠玩大了！',
        desc: '老朋友，钱庄11.11理财盛宴来袭，啥也别说，赶快来抢！',
        url: base.switchUrl('m' + activityCode + '/pk')
    };

    var firstNameArr = ['赵','钱','孙','李','周','吴','郑','王','冯','陈','楮','卫','蒋','沈','韩','杨','朱','秦','尤','许','何','吕','施','张','孔','曹','严','华','金','魏','陶','姜'],
        lastNameArr = ['*杭','*俊','*','*','*','*科','*昌','*萍','*焰','*武','*','*宏','*洁','*','*豪','*川','*','*','*涛','*鸿','*','*震','*梅','*','*','*刚','宏','*洁','*','*豪','*川','*'];

    var WINDOC = '赢了，获得1元红包',
        LOSEDOC = '输了，继续加油';

    var pkLoadArr = global.playerImgs.concat(global.pkImgs);
//------------------------------------------------------------[页面逻辑]
    //队列事件
    function QueueEvent(){
        this.queue = [];
        this.queueLength = 0;
        this.currentQueue = 0;
    }
    QueueEvent.prototype = {
        add: function(fn){
            this.queue.push(fn);
            this.queueLength++;
            return this;
        },
        emit: function(index){
            this.currentQueue = index || 0;
            this.queue[this.currentQueue]();
        },
        next: function(){
            this.currentQueue++;
            this.queue[this.currentQueue] && this.queue[this.currentQueue]();
        }
    };

    // 攻击动画队列对象
    var attack1 = new QueueEvent();
    var attack2 = new QueueEvent();

    function twoNum(num){
        return num >= 10 ? num : '0'+num
    }
    Vue.filter('date', function (value) {
        var dateObj = new Date(value),
            year = dateObj.getFullYear(),
            month = dateObj.getMonth() + 1,
            date = dateObj.getDate(),
            hours = twoNum(dateObj.getHours()),
            minutes = twoNum(dateObj.getMinutes()),
            seconds = twoNum(dateObj.getSeconds());
        return year+'.'+month+'.'+date+' '+hours+':'+minutes+':'+seconds;
    });
    new Vue({
        el: 'body',
        data: {
            pageLoading: true,
            isLogin: !!userPhone,
            isStart: sysTime >= startTime,
            isEnd: sysTime >= endTime,
            step: 1,
            isLoaded: false,
            lotteryNumber: 0,
            choicePlayer: [],
            playerNum: 6,
            pkPlayer:{
                firstName: '',
                lastName: '',
                thumb: ''
            },
            pkResult: false,
            resultReady: false,
            resultStatus: 'lose',
            resultDoc: '',
            startTime: startTime,
            showAwardMask: false,
            awardList: [],
            shareMask: false,
            showAlertMask: false,
            alertMsg: '',
            isApp: base.isApp,
            isIOSApp: base.isApp && base.isIOS()
        },
        ready: function () {
            var that = this;

            if(that.isStart && !that.isEnd && that.isLogin){
                $.ajax({
                    url: pageUrl.apiUrl.url + '/activity/doubleEleven/queryRemainTimes.html',
                    type: "post",
                    data: {
                        oauthToken: base.token,
                        native_view: (base.isApp ? 'app' : ''),
                        type: 2
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    async: false,
                    dataType: "json",
                    success: function (data) {
                        if(data.resultCode === 1){
                            that.lotteryNumber = data.resultData.remainTimes
                        }else{
                            console.log(data.resultMsg)
                        }
                    }
                });
                // 攻击动画队列1
                attack1.add(function(){
                    var a1 = $('.animate1');
                    a1.addClass('animate1left animated move1');
                    a1.one('webkitAnimationEnd animationEnd', function(){
                        a1.removeClass('animate1left animated move1');
                        attack1.next()
                    })
                }).add(function(){
                    var a2 = $('.animate2');
                    a2.addClass('animate2left animated move2');
                    a2.one('webkitAnimationEnd animationEnd', function(){
                        a2.removeClass('animate2left animated move2');
                        attack1.next()
                    })
                }).add(function(){
                    var a3 = $('.animate3');
                    var num = 0;
                    a3.addClass('animate3right animated move3');
                    a3.one('webkitAnimationEnd animationEnd', function(){
                        a3.removeClass('animate3right animated move3');
                        num++;
                        if(num === 2){
                            attack1.next()
                        }
                    });
                    var player = $('.pk-pic').eq(1);
                    player.addClass('tada');
                    player.one('webkitAnimationEnd animationEnd', function(){
                        player.removeClass('tada');
                        num++;
                        if(num === 2){
                            attack1.next()
                        }
                    })
                }).add(function(){
                    attack2.emit();
                });

                // 攻击动画队列2
                attack2.add(function(){
                    var a1 = $('.animate1');
                    a1.addClass('animate1right animated move1');
                    a1.one('webkitAnimationEnd animationEnd', function(){
                        a1.removeClass('animate1right animated move1');
                        attack2.next()
                    })
                }).add(function(){
                    var a2 = $('.animate2');
                    a2.addClass('animate2right animated move2');
                    a2.one('webkitAnimationEnd animationEnd', function(){
                        a2.removeClass('animate2right animated move2');
                        attack2.next()
                    })
                }).add(function(){
                    var a3 = $('.animate3');
                    var num = 0;
                    a3.addClass('animate3left animated move3');
                    a3.one('webkitAnimationEnd animationEnd', function(){
                        a3.removeClass('animate3left animated move3');
                        num++;
                        if(num === 2){
                            attack2.next()
                        }
                    });
                    var player = $('.pk-pic').eq(0);
                    player.addClass('tada');
                    player.one('webkitAnimationEnd animationEnd', function(){
                        player.removeClass('tada');
                        num++;
                        if(num === 2){
                            attack2.next()
                        }
                    })
                }).add(function(){
                    if(that.resultReady){
                        that.pkResult = true;
                    }else{
                        attack1.emit()
                    }
                });
            }

            this.pageLoading = false;

        },
        methods: {
            random: function(min, max){
                return parseInt(Math.random() * (max -min));
            },
            goLogin: function(){
                base.gotoLogin();
            },
            exchangePlayer: function(){
                var that = this;
                var firstNameLen = firstNameArr.length,
                    lastNameLen = lastNameArr.length,
                    playerThumbLen = global.playerImgs.length;
                this.choicePlayer = [];
                for(var i = 0; i < this.playerNum; i++){
                    this.choicePlayer[i] ={
                        firstName: firstNameArr[that.random(0,firstNameLen)],
                        lastName: lastNameArr[that.random(0,lastNameLen)],
                        thumb: global.playerImgs[that.random(0,playerThumbLen)]
                    }
                }
            },
            switchStage: function(num){
                this.step = num;
            },
            goStep1: function(){
                this.pkResult = false;
                this.switchStage(1);
            },
            goStep2: function(){
                var that = this;
                if(!this.isStart){
                    this.showAlert('亲，时间还没到哦~')
                }else if(this.isEnd){
                    this.showAlert('亲，活动结束了哦~')
                }else if(!this.isLogin){
                    this.goLogin();
                }else if(this.lotteryNumber == 0){
                    if(sysTime>= (endTime - 86400000)){
                        this.showAlert('次数已用完！')
                    }else{
                        this.showAlert('次数已用完，明天再战吧！')
                    }
                }else{
                    this.exchangePlayer();
                    if(!this.isLoaded){
                        this.pageLoading = true;
                        this.loadImg(pkLoadArr, function(index, total){
                            if(index == total){
                                that.switchStage(2);
                                that.pageLoading = false;
                                that.isLoaded = true;
                            }
                        });
                    }else{
                        this.switchStage(2);
                    }
                }
            },
            rival: function(index){
                this.pkSend();
                this.pkPlayer.firstName = this.choicePlayer[index].firstName;
                this.pkPlayer.lastName = this.choicePlayer[index].lastName;
                this.pkPlayer.thumb = this.choicePlayer[index].thumb;
                this.switchStage(3);
                setTimeout(function(){
                    attack1.emit();
                }, 50);
            },
            pkSend: function(){
                var that = this;
                $.ajax({
                    url: pageUrl.apiUrl.url + '/activity/doubleEleven/pk.html',
                    type: "post",
                    data: {
                        oauthToken: base.token,
                        native_view: (base.isApp ? 'app' : ''),
                        activityCode: activityCode,
                        linkCode: 'draw_pic'
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    dataType: "json",
                    success: function (data) {
                        if(data.resultCode === 1){
                            that.lotteryNumber = data.resultData.remainTimes;
                            that.resultStatus = data.resultData.pkResult;
                            that.resultDoc = data.resultData.pkResult === 'win' ? WINDOC : LOSEDOC;
                            that.resultReady = true;
                        }else{
                            console.log(data.resultMsg)
                        }
                    }
                });
            },
            loadImg: function(arr,cb){
                var imgLen = arr.length,
                    num = 0;
                for(var i = 0; i< imgLen; i++){
                    var img = new Image();
                    if(img.complete){
                        check()
                    }else{
                        img.onload = img.error = function(){
                            check()
                        }
                    }
                    img.src = arr[i];
                }
                function check(){
                    num++;
                    cb && cb(num, imgLen);
                }
            },
            share: function(){// 在app下直接调出分享控件
                if (base.isApp) {
                    base.hybridProtocol({
                        tagName: 'getShare',
                        data: {
                            dataUrl: "",
                            imgUrl: shareImg,             //分享图片
                            link: shareCurPage.url,       //分享链接
                            title: shareCurPage.title,    //分享标题
                            desc: shareCurPage.desc,      //分享文案
                            type: ""
                        },
                        success: function (data) {
                        },
                        error: function (data) {
                        }
                    });
                }else{
                    this.shareMask = true
                }
            },
            hideShareMask: function () {
                this.shareMask = false;
            },
            showLotteryList: function(){
                if(!this.isStart){
                    this.showAlert('亲，时间还没到哦~');
                    return false;
                }
                if(!this.isLogin){
                    this.goLogin();
                    return false;
                }
                var that = this;
                $.ajax({
                    url: pageUrl.apiUrl.url + '/activity/doubleEleven/myRed.html',
                    type: "post",
                    data: {
                        oauthToken: base.token,
                        native_view: (base.isApp ? 'app' : ''),
                        activityCode: activityCode,
                        linkCode: 'draw_pic'
                    },
                    xhrFields: {
                        withCredentials: true
                    },
                    async: false,
                    dataType: "json",
                    success: function (data) {
                        if(data.resultCode === 1){
                            that.awardList = data.resultData.list;
                            that.showAwardMask = true;
                        }else{
                            console.log(data.resultMsg)
                        }
                    }
                });
            },
            hideAwardMask: function(){
                this.showAwardMask = false;
            },
            showAlert: function(msg){
                this.showAlertMask = true;
                this.alertMsg = msg;
            },
            hideAlert: function(){
                this.showAlertMask = false;
                this.alertMsg = '';
            },
            goIndex: function(){
                base.checkAppEvent(base.switchUrl('m' + activityCode + '/index'), '双11理财盛宴 多重惊喜嗨不停')
            }
        }
    });

//------------------------------------------------------------[分享]

    function shareEvent() {
        shareInit({
            isApp: base.isApp,
            dataUrl: "",
            imgUrl: shareImg,
            shareLink: shareCurPage.url,
            curLink: curPageUrl,
            title: shareCurPage.title,
            desc: shareCurPage.desc,
            type: ""
        });
    }

    shareEvent();
});