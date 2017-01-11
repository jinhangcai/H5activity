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
    var giftList,lotteryWinList;
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
        function giftNameFomat(name, num){
            var _html = '';
            switch (name)
            {
                case 'qxe':
                    _html = '钱小二';
                    break;
                case 'hj':
                    _html = '红酒';
                    break;
                case 'wyhb':
                    _html = '5元红包';
                    break;
                case 'syhb':
                    _html = '10元红包';
                    break;
                case 'yyhb':
                    _html = '1元红包';
                    break;
                case 'bwb':
                    _html = '保温杯';
                    break;
                default :
                    _html = name;
            }
            if(name == 'hj'){
                _html += '（'+num+'瓶）'
            }else{
                _html += '（'+num+'个）'
            }
            return _html;
        }
        function render(){
            var giftLen = giftList.length,
                lotteryLen = lotteryWinList.length;
            var listHtml = '',data = {};
            if(giftLen + lotteryLen){
                if(giftLen > 0 && isEnd){
                    for(var i=0; i<giftLen; i++){
                        listHtml += '<div class="list">'+giftList[i]['gift']+'</div>'
                    }
                }
                if(lotteryLen > 0){
                    for(var j=0; j<lotteryLen; j++){
                        var _key = lotteryWinList[j]['type'],
                            cont = data[_key];
                        if(_key == 'no'){
                            continue;
                        }
                        cont ? data[_key] = ++cont : data[_key] = 1;
                    }
                }
                for (var name in data){
                    listHtml += '<div class="list">'+giftNameFomat(name,data[name])+'</div>'
                }
                addressBtn.css('display','block');
            }else{
                listHtml = '<div class="empty"><p>一份耕耘，一份收获~</p><a id="goProList" href="javascript:;" class="btn">去投资</a></div>';
            }
            $('.content').html(listHtml);
            $('#goProList').on('click',base.gotoProductList);
        }
    }
    prizeRender();

    // 加载完关闭 loading
    $('#loadpage').css('display','none');
});