define(function (require) {
    //引入依赖
    require('zepto.min');
    require('fastclick');
    var Dialog = require('dialog');
    var Verifyfrom = require('verifyfrom'),
        rsaEncrypt = require('rsaEncrypt'),
        base = require('base'),
        cookie = require('cookie'),
        pageUrl = require('url-map'),
        hrefParameter = require('href-parameter');

    // fastclick代替zepto的tap,防止点透bug
    window.addEventListener('load', function () {
        FastClick.attach(document.body);
    }, false);

    var encryptedData = rsaEncrypt('10001', '9d183e5918a188d09ead235a4c2dc54e5216281d4a72fa57d21cf736d445d60591ba794c201efcf3f98bb3553a314f84d6b4af92dd400da34c2d9ad65baca2e7b329bf5320fa2e5790f91ab79a492d0b75ce1a6fa60dc8ab5399dd7e61632284e42aee9b33596b06ee2c256d0ef819e6f64378d33d0d9cfd5fa4462880e1ebd9'),
        cookieName = 'srrVerifyTime',
        phoneNumber = 'phoneNumber';

    var activityCode = hrefParameter.get('activityCode'),
        inviteCode = hrefParameter.get('inviteCode'),
        inviterPhone = hrefParameter.get('phone'),
        channelsCode = hrefParameter.get('channelsCode');

    var verifyfrom = new Verifyfrom({
        isErrorOnParent: true,
        errorAfter: function (obj, str) {
            verifyError(obj, str);
        },
        correctAfter: function (obj) {
            verifyCorrect(obj);
        },
        rule: {
            password: {
                'minLength': 8,
                'maxLength': 20
            }
        },
        before: function () {
            //勾选注册协议
            $('#agreement').on('change', function () {
                if (this.checked) {
                    $('#submitBtn').prop('disabled', false);
                } else {
                    $('#submitBtn').prop('disabled', true);
                }
            });
            $('#verifyBtn').on('click',function () {
                if (!$(this).attr('disabled')) {
                    if (verifyfrom.verifyInput($('#phone')[0])) {
                        /*cy150807 点击按钮之后立马显示请求发送中*/
                        $('#verifyBtn').css('background','#aaa').val('请求发送中');
                        $.ajax({
                            type: "post",
                            url: pageUrl.sendRegisterCode.url,
                            data: {
                                phone: encryptedData($('#phone').val()),
                                type: 'register'
                            },
                            dataType: "json",
                            beforeSend: function () {
                                // 禁用按钮防止重复提交
                                $('#verifyBtn').prop('disabled',true);
                            },
                            success: function (data) {
                                if(!data.resultCode){
                                    $('#verifyBtn').prop('disabled',false);
                                    $('#verifyBtn').css('background','#f35c3f').val('立即获取');
                                    verifyError($('#phone'), data.resultMsg);
                                    return false;
                                }
                                cookie.setCookie(cookieName, 60, {
                                    path: '/',
                                    expires: 1
                                });
                                cookie.setCookie(phoneNumber, null, -1);
                                cookie.setCookie(phoneNumber, $('#phone').val(), {
                                    path: '/',
                                    expires: 1
                                });
                                cookieCountdown();
                            },
                            timeOut:10000,
                            error: function () {
                                $('#verifyBtn').css('background','#f35c3f').val('立即获取');
                                $('#verifyBtn').prop('disabled',false);
                                var dialog=new Dialog('wait');
                                dialog.run('当前系统繁忙 请稍后再试');
                            }
                        });
                    }
                }
            });

            var inputs = $('#registerForm input');
            //任意输入框输入文本移除submit的错误提示
            inputs.on('input',function () {
                $('#submitError').remove();
                verifyCorrect(this);
            });

            //提交表单
            $('#submitBtn').on('click', function () {
                if ($(this).attr('disabled')) {
                    return false;
                }
                if (verifyfrom.run()) {
                    var text = $('#submitBtn').text();
                    $('#submitBtn').html('注册中...').attr('disabled',true);
                    $.ajax({
                        type: "post",
                        url: pageUrl.dealRegister.url,         //发送请求的地址
                        data: {                      //发送到服务器的数据
                            phone:encryptedData($('#phone').val()),
                            pwd:encryptedData($('#password').val()),
                            verifyCode:$('#verify').val(),
                            code:channelsCode,
                            inviteCode:inviteCode
                        },
                        dataType: "json",
                        cache: false,
                        success: function (data) {
                            $('#submitBtn').html(text).removeAttr('disabled');
                            if (data.resultCode) {
                                if(activityCode){
                                    location.href= base.switchUrl('m'+activityCode+'/index');
                                }else{
                                    location.href='/activity/valentinesActivity/downApp.html';
                                }
                            } else {
                                submitError(data.resultMsg);
                                $('#submitBtn').html(text).removeAttr('disabled');
                                return false;
                            }

                        },
                        timeOut:10,
                        error: function () {
                            var dialog=new Dialog('wait');
                            dialog.run('当前系统繁忙 请稍后再试');
                        }
                    });
                }
            });
        }
    });

    cookieCountdown();  // 进页面就判断验证码cookie是否存在,进行倒计时
    $('#phone').val(cookie.getCookie(phoneNumber));
    //验证码的cookie倒计时
    function cookieCountdown() {
        var tmpWait = Number(cookie.getCookie(cookieName)),
            verifyBtn = $("#verifyBtn"),
            waitTime = '';
        if (tmpWait === 0) {
            cookie.setCookie(cookieName, null, -1);
            verifyBtn.prop("disabled", false);
            verifyBtn.val("立即获取").css('background','#f35c3f');
        } else {
            verifyBtn.prop("disabled", true);
            verifyBtn.val(tmpWait + "秒后重新获取").css('background','#aaa');
            tmpWait = tmpWait - 1;
            cookie.setCookie(cookieName, tmpWait, {
                path: '/',
                expires: 10
            });
            setTimeout(function() {
                cookieCountdown();
            }, 1000);
        }
    }

    //input验证错误
    function verifyError(obj, str) {
        $('.input-error').remove();
        $(obj).parent().addClass('error').append('<div class="input-error">' + str + '</div>')
    }

    //input验证成功
    function verifyCorrect(obj) {
        $('.input-error').remove();
        $(obj).parent().removeClass('error');
    }

    //表单提交失败提示
    function submitError(str) {
        $('#submitError').remove();
        $('#submitBtn').before('<div class="submit-error" id="submitError">' + str + '</div>')
    }


    // 页面渲染
    $('#inviterPhone').html(inviterPhone);
    var banner = $('#banner'),
        imgDom = $('<img>');

    // 插入banner 图片
    imgDom.attr('src', base.staticUrl('static/images/register/' + activityCode +'.jpg?20170106'));
    banner.append(imgDom);

    // banner 点击跳转活动页面
    banner.on('click', function(){
        location.href = base.switchUrl('m'+activityCode+'/index');
    })
});