define(function (require, exports, module) {
    //--------------------------------------------------【require】
    require('jquery.fullpage.js');

    //引入依赖
    var base = require('base'),

        shareInit = require('share-init'),
        hybridProtocol = require('native-calls'),
        pageUrl = require('url-map'),
        hrefParameter = require('href-parameter');


    //--------------------------------------------------【滚屏】
    if (navigator.userAgent.toLowerCase().match(/android/i) != "android") {
        $('.section').find('[data-class]').addClass('opacity0');

        $('#fullpage').fullpage({
            anchors: ['page1', 'page2', 'page3', 'page4', 'page5', 'page6', 'page7', 'page8', 'page9'],
            navigation: true,
            resize: true,
            afterLoad: function (anchorLink, index) {
                if(index==1){
                    $('#fp-nav').hide();
                }else{
                    $('#fp-nav').show();
                }

                var elm = $('.section').eq(index - 1).find('[data-class]'),
                    $this = '',
                    delay = 0;

                elm.each(function () {
                    $this = $(this);

                    delay = $this.data('delay');

                    (function ($this) {
                        setTimeout(function () {
                            $this.removeClass('opacity0').removeClass($this.data('class').replace('In', 'Out')).addClass('animated ' + $this.data('class'));
                        }, delay * 1000);
                    }($this));
                });
            },
            onLeave: function (index, nextIndex, direction) {
                var elm = $('.section').eq(index - 1).find('[data-class]'),
                    $this = '';

                elm.each(function () {
                    $this = $(this);
                    $this.removeClass($this.data('class')).addClass($this.data('class').replace('In', 'Out'));
                });
            }
        });
    } else {
        var height = $(document).height();

        $('.section').addClass('fp-section fp-table').css('height', height).each(function () {
            var $this = $(this);
            $this.html("<div class='fp-tableCell' style='height:" + height + "px'>" + $this.html() + "</div>")
        });
        $('body').css('overflow', 'auto');
    }


    //--------------------------------------------------【页面渲染】

    var $section9 = $('.section').eq(8),
        isWeiXin = window.navigator.userAgent.toLowerCase().match(/MicroMessenger/i) == 'micromessenger',
        QRCodeShare = decodeURIComponent(hrefParameter.get('QRCodeShare')), // URL上的二维码地址
        defaultQrCode = $('#defaultQrCode').val();    // 默认二维码地址

    var strSection9a = '<div class="fp-tableCell">' +
        '<div class="tit"><img src="' + $('#page9aTitleImgPath').val() + '" style="width: 6.40rem;" alt=""/></div> ' +
        '<div class="cont"> ' +
        '<a id="shareBtn" class="btn" href="javascript:;">立即分享</a> ' +
        '</div>' +
        '</div>';

    var strSection9b = '<div class="fp-tableCell">' +
        '<div class="tit"><img src="' + $('#page9bTitleImgPath').val() + '" style="width: 4.13rem;" alt=""/></div> ' +
        '<div class="cont"> ' +
        '<div class="qr-code"><img src="' + (QRCodeShare ? QRCodeShare : defaultQrCode) + '" alt=""/></div> ' +
        (isWeiXin ? '<p>微信请长按指纹<br />识别二维码</p> ' : '') +
        '</div>' +
        '</div>';

    if (base.isApp) {
        $section9.html(strSection9a).addClass('page9a');
    } else {
        $section9.html(strSection9b).addClass('page9b');
    }

    //--------------------------------------------------【分享】

    var shareImg = location.protocol + '//' + location.host + $('#sharePic').val(),
        curPageUrl = window.location.href,
        shareUrl = '',                       // 分享链接
        QRCodeUrl = '',                      // 请求得到的二维码地址
        share = {
            title: '钱庄网2015年年度数据报告',
            desc: '带你重温钱庄网2015年走过的路，未来让我们一起携手共赢！'
        };

    if (base.isApp) {

        $.ajax({
            type: 'post',
            url: pageUrl.apiUrl.url + '/activity/springThunder/createQRCode.html',
            dataType: 'json',
            data: {
                native_view: hrefParameter.get('native_view'),
                oauthToken: hrefParameter.get('oauthToken')
            },
            async: false,
            success: function (data) {

                //  错误则用默认二维码
                if (!data.resultCode) {
                    QRCodeUrl = defaultQrCode;
                } else {
                    QRCodeUrl = data.resultData;
                }
            }
        });

        shareUrl = location.href.split('#')[0].split('?')[0] + '?returnUrl=annals2015/index&QRCodeShare=' + encodeURIComponent(QRCodeUrl);

        // 给分享按钮挂载事件
        $('#shareBtn').on('click', function () {
            hybridProtocol({
                tagName: 'getShare',
                data: {
                    dataUrl: "",
                    imgUrl: shareImg,
                    link: shareUrl,
                    title: share.title,
                    desc: share.desc,
                    type: ""
                }
            });
        });
    } else {
        shareUrl = location.href.split('#')[0].split('?')[0] + '?returnUrl=annals2015/index&QRCodeShare=' + QRCodeShare;
    }

    shareInit({
        isApp: base.isApp,
        dataUrl: "",
        imgUrl: shareImg,
        shareLink: shareUrl,
        curLink: curPageUrl,
        title: share.title,
        desc: share.desc,
        type: ""
    });

    // 隐藏加载动画
    window.onload = function () {
        $('#pageLoading').hide();
    }
});