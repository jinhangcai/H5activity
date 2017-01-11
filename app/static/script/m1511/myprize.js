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
    var activityCode = '1511';

    //--------------------------------------------------【selecter】
    var addressBtn = $('#addressBtn'),
        pdListBtn = $('#pdListBtn');
    //活动结束影藏继续投资按钮
    if(isend == 'true'){
        pdListBtn.css('display', 'none');
    }
    //--------------------------------------------------【hander】
    var checkAddress;
    addressBtn.on('click', function(){
        if(addressBtn.hasClass('disabled-btn')){
            return;
        }
        checkAddress = checkAddress || new CheckAddress({
                token: token,
                activityCode: activityCode
            });
        checkAddress.showCont();
    });
    pdListBtn.on('click', base.gotoProductList);
    //--------------------------------------------------【event】
    var prizeData;
    function prizeRender(){
        var lotteryObj = {
                list: [],
                num1: 0,
                num5: 0
            },
            giftObj = {
                list: []
            };
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
                    prizeData = data.resultData;
                    _render();
                }
            }
        });
        function _render(){
            var giftList = prizeData.giftList,
                giftLen = giftList.length,
                lotteryList = prizeData.lotteryWinList,
                lotteryLen = lotteryList.length;
            if(lotteryLen>0){
                var _title = '11.11-11.18天天翻';
                for(var i = 0; i<lotteryLen; i++){
                    var prizestr = lotteryList[i]['prize'];
                    if(prizestr == '1元红包'){
                        lotteryObj.list.push([_title,prizestr]);
                        lotteryObj.num1++
                    }
                    if(prizestr == '5元红包'){
                        lotteryObj.list.push([_title,prizestr]);
                        lotteryObj.num5++
                    }
                }
            }
            if(giftLen>0){
                for(var j = 0; j<giftLen; j++){
                    var _prizestr = giftList[j]['gift'];
                    var _tit = titleFormat(giftList[j]['acitvityLink']);
                    giftObj.list.push([_tit,_prizestr]);
                }
            }
            var strHtml = '<div class="record-list"><div class="tit">中奖记录</div><ul><li class="header"><div class="label">中奖环节</div><div class="cont">中奖内容</div></li>', k = 0,n = 0;
            var klen = lotteryObj.list.length;
            var nlen = giftObj.list.length;

            for(; k < klen; k++){
                strHtml += '<li><div class="label">'+lotteryObj.list[k][0]+'</div><div class="cont">'+lotteryObj.list[k][1]+'</div></li>'
            }
            for(; n < nlen; n++){
                strHtml += '<li><div class="label">'+giftObj.list[n][0]+'</div><div class="cont">'+giftObj.list[n][1]+'</div></li>'
            }
            strHtml +='</ul></div>';

            if((klen+nlen) > 0){
                addressBtn[0].className = 'basis-btn abled-btn';
                pdListBtn[0].className = 'linkcolor underline';
                $('#recordWrap').html(strHtml);
                prizecenter();
                $('.info .empty').css('display','none');
                $('.info .cont').css('display','block');
            }else{
                addressBtn[0].className = 'basis-btn disabled-btn';
                pdListBtn[0].className = 'basis-btn abled-btn';
                $('.info .empty').css('display','block');
                $('.info .cont').css('display','none');
            }
        }
        function titleFormat(tit){
            var title;
            switch(tit){
                case '开胃菜':
                    title = '11.11开胃菜';
                    break;
                case '拼运气':
                    title = '11.11拼运气';
                    break;
                case '土豪君':
                    title = '11.11-11.18土豪君';
                    break;
                case '新手礼':
                    title = '11.11-11.18新手礼';
                    break;
                case '钱庄日':
                    title = '11.18钱庄日';
                    break;
                default :
                    title = tit;
            }
            return title;
        }
        function prizecenter(){
            $.ajax({
                url: pageUrl.pricecenter.url,
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
                    var shtml = '';
                    for(var key in data){
                        if(key == '干红葡萄酒'){
                            shtml += '<li>'+key+data[key]+'瓶</li>';
                        }else if(key == '5元红包' || key == '1元红包'){
                            shtml += '<li>'+key+'x'+data[key]+'(已发到个人账户)</li>';
                        }else{
                            shtml += '<li>'+key+'</li>';
                        }
                    }
                    $('.info .cont').html(shtml);
                }
            });
        }
    }
    prizeRender();

});