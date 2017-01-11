/**
 * Created by wyj on 2015/10/13.
 */
define(function (require) {
    //--------------------------------------------------【require】
    require('zepto.min');
    require('fastclick');

    var base = require('base');

    var hrefParameter = require('href-parameter'),
        CheckAddress = require('check_address_moudle'),
        pageUrl = require('url-map');

    // fastclick代替zepto的tap,防止点透bug
    window.addEventListener('load', function () {
        FastClick.attach(document.body);
    }, false);

    //--------------------------------------------------【判断状态】

    var isLogin = base.checkLogin();
    // 未登录跳转登录
    if(!isLogin){
        base.gotoLogin();
    }

    // 页面来自 app or h5
    var token = base.token;
    var isend = hrefParameter.get('isend');
    var activityCode = hrefParameter.get('activityCode');
    var isEnd = (hrefParameter.get('isend') == 'true');

    //--------------------------------------------------【selecter】
    var addressBtn = $('.address-btn');
    var checkAddress;
    addressBtn.on('click', function(){
        checkAddress = checkAddress || new CheckAddress({
                token: token,
                activityCode: activityCode
            });
        checkAddress.showCont();
    });
    //--------------------------------------------------【event】
    var giftList,lotteryWinList,totalPoints;
    function prizeRender(){
        // 中奖记录
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
                if (data.resultCode == 1) {
                    giftList = data.resultData.giftList;
                    lotteryWinList = data.resultData.lotteryWinList;
                    totalPoints = data.resultData.integral;
                    render();
                }
            }
        });
        function giftFomat(name, mount){
            var _html = '';
            switch (name)
            {
                case '抽奖扣除':
                    _html = '-'+mount+'积分';
                    break;
                case '积分':
                case '邀请投资送积分':
                case '邀请注册送积分':
                case '邀请实名送积分':
                case '新手礼200积分':
                    _html = '+'+mount+'积分';
                    break;
                case '双12送酒':
                    _html = '红酒1瓶';
                    break;
                case '双12送杯':
                    _html = '保温杯1个';
                    break;
                default :
                    _html += name;
            }
            return _html;
        }
        function giftNameFomat(name){
            var _html = '';
            switch (name)
            {
                case '抽奖扣除积分':
                    _html = '福利转盘high翻天';
                    break;
                case '钱小二':
                    _html = '钱小二1个';
                    break;
                default :
                    _html = name;
            }
            return _html;
        }
        function totalPrizeFomat(points){
            var _html = '没有可兑换的礼物';
            if(points>=5600000){
                _html = 'Apple iPad Pro 128G'
            }else if(points>=4900000){
                _html = 'iPhone6S Plus 64G'
            }else if(points>=4100000){
                _html = 'iPhone6S Plus 16G'
            }else if(points>=3600000){
                _html = '周生生黄金手镯'
            }else if(points>=3200000){
                _html = '小米电视3 55寸'
            }else if(points>=2500000){
                _html = 'Apple iPad Air2 64G'
            }else if(points>=2000000){
                _html = 'Apple Watch Sport<br>智能手表'
            }else if(points>=1600000){
                _html = '小米电动平衡车+红米2'
            }else if(points>=1200000){
                _html = '卡西欧美颜数码相机'
            }else if(points>=700000){
                _html = '京东卡1000元'
            }else if(points>=350000){
                _html = '多功能料理搅拌机'
            }else if(points>=100000){
                _html = '一箱红酒'
            }else if(points>=50000){
                _html = '80元红包'
            }
            return _html;
        }
        function render(){
            var giftLen = giftList.length,
                lotteryLen = lotteryWinList.length;
            var listHtml = '';
            if(giftLen + lotteryLen){
                listHtml = '<div class="prize-list"><div class="prize-hd"><div class="label">所获奖品</div><div class="cont">参与环节</div></div><div class="row-cont">';
                if(isEnd && totalPoints>=50000){
                    listHtml += '<div class="row"><div class="label">'+totalPrizeFomat(totalPoints)+'</div><div class="cont">积分兑豪礼</div></div>'
                }
                if(giftLen > 0){
                    for(var i=0; i<giftLen; i++){
                        listHtml += '<div class="row"><div class="label">'+giftFomat(giftList[i]['gift'], giftList[i]['amount'])+'</div><div class="cont">'+giftNameFomat(giftList[i]['acitvityLink'])+'</div></div>'
                    }
                }
                var winPoints = 0;
                if(lotteryLen > 0){
                    for(var j=0; j<lotteryLen; j++){
                        if(/积分/g.test(lotteryWinList[j]['prize'])){
                            winPoints += parseInt(lotteryWinList[j]['prize']);
                            continue;
                        }
                        listHtml += '<div class="row"><div class="label">'+giftNameFomat(lotteryWinList[j]['prize'])+'</div><div class="cont">福利转盘high翻天</div></div>'
                    }
                    if(winPoints > 0){
                        listHtml += '<div class="row"><div class="label">+'+winPoints+'积分</div><div class="cont">福利转盘high翻天</div></div>'
                    }
                }
                listHtml += '</div></div>';
                addressBtn.css('display','block');
            }else{
                listHtml = '<div class="empty"><p>一份耕耘，一份收获~</p><a id="goProList" href="javascript:;" class="btn">去投资</a></div>';
            }
            $('.content').html(listHtml);
            $('#goProList').on('click',base.gotoProductList);
        }
    }
    prizeRender();

});