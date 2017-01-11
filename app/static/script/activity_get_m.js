/**
 * 钱庄网
 * @name 首页js
 * @description 单页js
 * @date 2015-07-17
 * @version $V1.0$
 */
define(function (require) {
//--------------------------------------------------【引入依赖函数】
    require('zepto.min');
    require('fastclick');
    var base = require('base'),
        pageUrl = require('url-map'),
        Verifyfrom = require('verifyfrom-base'),
        hrefParameter = require('href-parameter'),
        Dialog = require('dialog');

    var token = base.token,
        isApp = base.isApp,
        goback = hrefParameter.get('goback'),
        activeCode = hrefParameter.get('activityCode');

    var $userName = $('#userName'),
        $userPhone = $('#userPhone'),
        $province = $('#province'),
        $city = $('#city'),
        $address = $('#address');

    // fastclick代替zepto的tap,防止点透bug
    //window.addEventListener('load', function () {
    //    FastClick.attach(document.body);
    //}, false);

//--------------------------------------------------【省市联动】
    $.ajax({
        url: pageUrl.getProvinceList.url,
        type: "post",
        data: {},
        xhrFields: {
            withCredentials: true
        },
        dataType: "json",
        async:false,
        success: function (data) {
            if (data.resultCode == 1) {
                var resultData = data.resultData,
                    count = 0, optionHtml = "<option value=''>请选择省</option>";
                for(var l = resultData.length; count < l; count++){
                    optionHtml += "<option value='"+resultData[count].id+"'>"+resultData[count].name+"</option>";
                }
                $province.html(optionHtml)
            }
        }
    });
    function getCityList(callbackfn){
        var province = $province.val();
        var count = 0;
        if(!province){
            $city.html("<option value=''>请选择市</option>");
            return false;
        }
        $.ajax({
            url:pageUrl.showArea.url,
            dataType:'json',
            data:"pid="+province,
            async:false,
            xhrFields: {
                withCredentials: true
            },
            success:function(json){
                var optionsHtml = "<option value=''>请选择市</option>";
                $(json).each(function(){
                    optionsHtml += "<option value='"+json[count].id+"'>"+json[count].name+"</option>";
                    count++;
                });
                $city.html(optionsHtml);
                callbackfn && callbackfn();
            }
        });
    }
    $province.change(function(){
        getCityList();
    });
//--------------------------------------------------【表单确认】

    // 提交规则校验

    var verifyfrom = new Verifyfrom({
        isBlurVerify: true,
        succeed: function (obj) {
            verifyCorrect(obj);
        },
        failure: function (obj, errorMsg) {
            verifyError(obj, errorMsg);
        }
    });
    verifyfrom.add($userName[0], [{
        strategy: 'isNonEmpty',
        errorMsg: '收货人姓名不能为空'
    },{
        strategy: 'isReg:^[\u4e00-\u9fa5]*$',
        errorMsg: '请输入正确的姓名'
    }]);
    verifyfrom.add($userPhone[0], [{
        strategy: 'isNonEmpty',
        errorMsg: '请填写手机号'
    }, {
        strategy: 'isReg:^((13[0-9]{9})|(14[0-9]{9})|(15[0-35-9][0-9]{8})|(17[0-9]{9})|(18[0-9]{9}))$',
        errorMsg: '请输入正确的手机号码'
    }]);


//--------------------------------------------------【查看是否存在默认地址】
    var defaultUserDate,i,provinceList,cityList;
    $.ajax({
        type:'post',
        url: pageUrl.checkAddress.url,
        data: {
            native_view: (isApp ? 'app' : ''),
            oauthToken: token,
            activityCode: activeCode
        },
        async:false,
        xhrFields: {
            withCredentials: true
        },
        success: function(data) {
            //if(data.resultCode==0){ // 没有默认地址的
            //}else
            if(data.resultCode==1){ // 有默认地址
                defaultUserDate = data.resultData;
            }
            //else if(data.resultCode==2){ // 这次活动已经填写过地址的
            //}else if(data.resultCode==3){ // 未登陆
            //}else{}
        }
    });
    // 存在默认地址 则填写默认地址
    if(defaultUserDate){
        provinceList = $province.find('option');
        var len;
        for(i=0,len=provinceList.length; i < len; i++){
            if(provinceList.eq(i).text() == defaultUserDate.province){
                $province[0].selectedIndex = i;
                break;
            }
        }
        getCityList(function(){
            cityList = $city.find('option');
            for(var j=0,len=cityList.length; j < len; j++){
                if(cityList.eq(j).text() == defaultUserDate.city){
                    $city[0].selectedIndex = j;
                    break;
                }
            }
        });
        $userName.val(defaultUserDate.name);
        $userPhone.val(defaultUserDate.tel);
        $address.val(defaultUserDate.address);
    }


    $('#getSubmit').on('click', function () {
        var sHtml = '';

        // 表单校验
        if (!verifyfrom.start()) {
            return false;
        }
        if (!($province.val() && $city.val() && $address.val())) {
            submitError('请填写完整的收货地址');
            return false;
        }else{
            $('#submitError').remove();
        }

        // 拼接收件地址的字符串
        var selectFind = function ($obj) {
                var str = '';
                $.each($obj.children('option'), function () {
                    if ($(this).attr('value') == $obj.val()) {
                        str = $(this).html();
                    }
                });
                return str;
            },
            addressStr = selectFind($province) + selectFind($city) + $address.val();

        // 弹出确认浮层
        sHtml += '<div class="float_confirm" id="floatConfirm">';
        sHtml += '<div class="main">';
        sHtml += '<div class="tit">请核对下您填写的信息</div>';
        sHtml += '<div class="cont">';
        sHtml += '<p><span class="label">收货人姓名： </span>' + $userName.val() + '</p>';
        sHtml += '<p><span class="label">手机号码： </span>' + $userPhone.val() + '</p>';
        sHtml += '<p><span class="label">收货地址：</span>' + addressStr + '</p>';
        sHtml += '</div>';
        sHtml += '<div class="operation">';
        sHtml += '<a class="btn btn-back" id="confirmBack" href="javascript:;">取消</a>';
        sHtml += '<a class="btn btn-submit" id="confirmSubmit" href="javascript:;">确定</a>';
        sHtml += '</div>';
        sHtml += '</div>';

        $('body').append(sHtml);

        // 确认信息返回关闭浮层
        $('#confirmBack').on('click', function () {
            $('#floatConfirm').remove();
        });

        // 确定提交表单
        var regParameter = /\?(.+)/ig;
        var parameter = '';

        if (regParameter.test(location.href)) {
            parameter =  RegExp.$1;
        }
        var dialog=new Dialog('wait');
        $('#confirmSubmit').on('click', function () {
            $('#provinceStr').val(selectFind($province));
            $('#cityStr').val(selectFind($city));
            //$('#getForm').submit();
            $.ajax({
                type:'post',
                url:pageUrl.ajaxActivityAddressM.url,
                data:$('#getForm').serialize()+'&'+parameter,
                async:false,
                xhrFields: {
                    withCredentials: true
                },
                success: function(data) {
                    if(data.resultCode==1){
                        location.replace(base.switchUrl('activityAddressM', 'native_view='+(base.isApp ? 'app' : '')+'&oauthToken='+base.token+'&activityCode='+activeCode+'&goback='+goback));
                    }else{
                        dialog.run(data.resultMsg);
                    }
                }
            });
        });
    });

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
        $('#getSubmit').before('<div class="submit-error" id="submitError">' + str + '</div>')
    }

    // 领取返回
    //$('#getBack').on('click', function () {
    //    window.history.go(-1);
    //});

    // 页面body 根据活动 activityCode 改变活动标题
    // 根据活动代码 增加活动名称
    var activename = require('active-names');
    var tit = activename['active'+activeCode];

    //if(activeCode && tit){
    //    document.getElementById('activeName').innerHTML = tit;
    //}

    // 改变标题后 body显示
    $('.content').removeClass('hide');
});