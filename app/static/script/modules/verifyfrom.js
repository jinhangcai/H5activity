/* 表单验证    1.1.2*/

(function (root, factory) {
    if (typeof define === 'function' && (define.amd || define.cmd)) {
        define(function () {
            return factory(root);
        });
    } else {
        root.verifyfrom = factory(root, {});
    }
})(this, function (root) {
    var verifyfrom = function (formId, opts) {
        if (typeof opts === 'undefined') {
            this.formBox = document;
            this._opts = formId;
        } else {
            this.formBox = document.getElementById(formId);
            this._opts = opts;
        }
        this._setting();
        this._bindHandler();
    };
    verifyfrom.prototype._setting = function () {
        var self = this,
            opts = self._opts || {};

        /*初始化user data*/
        var configObj = {
            isVerify: 'required', 	    // 需要校验的表单项
            correctStyle: 'correct',    // 正确添加的样式
            errorStyle: 'error',	    // 错误添加的样式
            isErrorOnParent: false,     // 是否作用到父级
            isOnblurVerify: true,       // 是否移出表单元素进行验证
            errorAfter: '',			    // 校验错误以后触发的行为
            correctAfter: '',		    // 校验正确以后触发的行为
            before: '',			        // 表单校验之前，一般用做插件拓展
            rule: null                  // 校验规则
        };

        for (var key in configObj) {
            this[key] = opts[key] || configObj[key];
        }

        /*替换校验规则*/
        self._rule = self._extend(self._rule, opts.rule);

        /*表单校验之前，一般用做插件拓展*/
        this.before && this.before(this);
    };
    verifyfrom.prototype.verifyInput = function (obj) {
        var self = this,
            reg = obj.getAttribute('pattern'),  // 表单元素上的正则
            ajaxState = false,                  // ajax的请求结果
            verifyType = obj.getAttribute('data-type') || obj.getAttribute('type'); // input元素的类别
        reg = reg && new RegExp('^' + reg + '$');
        //根据type校验相应的格式
        switch (verifyType) {
            case 'mail':
                if (!obj.value) {
                    self._error(obj, '请输入邮箱');
                    return false;
                }
                //格式
                reg = reg || self._rule.mail.reg;
                if (!reg.test(obj.value)) {
                    self._error(obj, '邮箱格式错误');
                    return false;
                }
                //是否存在
                if (self._rule.mail.isAjax) {
                    $.ajax({
                        type: 'POST',
                        url: self._rule.mail.ajaxUrl,
                        data: 'mail=' + obj.value,
                        dataType: 'json',
                        async: false,
                        success: function (state) {
                            ajaxState = self._rule.mail.ajaxCallback(state);
                        }
                    });
                    return ajaxState;
                } else {
                    self._correct(obj);
                    return true;
                }
                break;
            case 'phone':
                if (!obj.value) {
                    self._error(obj, '请输入手机号');
                    return false;
                }
                //格式
                reg = reg || self._rule.phone.reg;
                if (!reg.test(obj.value)) {
                    self._error(obj, '请输入正确的手机号码');
                    return false;
                }
                //是否存在
                if (self._rule.phone.isAjax) {
                    $.ajax({
                        type: 'POST',
                        url: self._rule.phone.ajaxUrl,
                        data: 'phone=' + obj.value,
                        dataType: 'json',
                        async: false,
                        success: function (state) {
                            ajaxState = self._rule.phone.ajaxCallback(state);
                        }
                    });
                    return ajaxState;
                } else {
                    self._correct(obj);
                    return true;
                }
                break;
            case 'mailPhone':
                if (!obj.value) {
                    self._error(obj, '请输入手机或邮箱');
                    return false;
                }
                //格式
                var regMail = self._rule.mail.reg;
                var regTel = self._rule.phone.reg;
                if (!regTel.test(obj.value) && !regMail.test(obj.value)) {
                    self._error(obj, '请输入正确的手机或邮箱号');
                    return false;
                }
                //是否存在
                if (regMail.test(obj.value)) {
                    if (self._rule.mail.isAjax) {
                        $.ajax({
                            type: 'POST',
                            url: self._rule.mail.ajaxUrl,
                            data: 'mail=' + obj.value,
                            dataType: 'json',
                            async: false,
                            success: function (state) {
                                ajaxState = self._rule.phone.ajaxCallback(state);
                            }
                        });
                        return ajaxState;
                    } else {
                        self._correct(obj);
                        return true;
                    }
                } else {
                    if (self._rule.phone.isAjax) {
                        $.ajax({
                            type: 'POST',
                            url: self._rule.phone.ajaxUrl,
                            data: 'phone=' + obj.value,
                            dataType: 'json',
                            async: false,
                            success: function (state) {
                                ajaxState = self._rule.phone.ajaxCallback(state);
                            }
                        });
                        return ajaxState;
                    } else {
                        self._correct(obj);
                        return true;
                    }
                }
                break;
            case 'userName':
                if (!obj.value) {
                    self._error(obj, '用户名不能为空');
                    return false;
                }
                //长度
                var userNameMinLen = obj.getAttribute('min') || self._rule.userName.minLength,
                    userNameMaxLen = obj.getAttribute('max') || self._rule.userName.maxLength,
                    userNameLen = self._strLength(obj.value);
                if (userNameLen < userNameMinLen || userNameLen > userNameMaxLen) {
                    self._error(obj, '用户名长度只能在' + userNameMinLen + '-' + userNameMaxLen + '位字符之间，中文算两个字符');
                    return false;
                }
                //格式
                reg = reg || self._rule.userName.reg;
                if (!reg.test(obj.value)) {
                    self._error(obj, '用户名由中文、英文字母、数字、下划线组成,且不能为纯数字');
                    return false;
                }
                //是否存在
                if (self._rule.userName.isAjax) {
                    $.ajax({
                        type: 'POST',
                        url: self._rule.userName.ajaxUrl,
                        data: 'userName=' + obj.value,
                        dataType: 'json',
                        async: false,
                        success: function (state) {
                            ajaxState = self._rule.phone.ajaxCallback(state);
                        }
                    });
                    return ajaxState;
                } else {
                    self._correct(obj);
                    return true;
                }
                break;
            case 'password':
                if (!obj.value) {
                    self._error(obj, '密码不能为空');
                    return false;
                }
                //长度
                var passwordMinLen = obj.getAttribute('min') || self._rule.password.minLength,
                    passwordMaxLen = obj.getAttribute('max') || self._rule.password.maxLength;
                if (!self._eval(obj.getAttribute('data-affirm'))) {
                    if (self._strLength(obj.value) < passwordMinLen || self._strLength(obj.value) > passwordMaxLen) {
                        self._error(obj, '请输入' + passwordMinLen + '-' + passwordMaxLen + '个字符密码，区分大小写');
                        return false;
                    }
                } else {
                    var contrastObj = obj.id.replace(/\d/g, '');
                    if (document.getElementById(contrastObj).value !== obj.value) {
                        self._error(obj, '密码输入不一致');
                        return false;
                    }
                }
                self._correct(obj);
                return true;
                break;
            case 'verify':
                if (!obj.value) {
                    self._error(obj, '请输入验证码');
                    return false;
                }
                self._correct(obj);
                return true;
            case 'realName':
                var reg = /^[\u4e00-\u9fa5]*$/;
                if (!obj.value) {
                    self._error(obj, '请输入姓名');
                    return false;
                }
                if (!reg.test(obj.value)) {
                    self._error(obj, '姓名格式不正确');
                    return false;
                }
                self._correct(obj);
                return true;
            case 'idCard':
                var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
                if (!obj.value) {
                    self._error(obj, '请输入身份证');
                    return false;
                }
                if (!reg.test(obj.value)) {
                    self._error(obj, '身份证号码有误');
                    return false;
                }
                return true;
            default:
                self._correct(obj);
                return true;
        }
    };
    verifyfrom.prototype.run = function () {
        var self = this,
            input = this.formBox.getElementsByTagName('input');
        for (var i = 0, iLength = input.length; i < iLength; i++) {
            if (self._eval(input[i].getAttribute('data-required'))) {
                if (!self.verifyInput(input[i])) {
                    return false;
                }
            }
        }
        return true;
    };
    verifyfrom.prototype._rule = {
        mail: {
            'isAjax': false,
            'ajaxUrl': 'ajax/boole_true.txt',
            'ajaxCallback': '',
            'reg': /^(\w+(?:[\.|\-]\w+)*)\@([A-Za-z0-9]+(?:[\.|\-][A-Za-z0-9]+)*)\.([A-Za-z0-9]+)$/
        },
        phone: {
            'isAjax': false,
            'ajaxUrl': 'ajax/boole_true.txt',
            'ajaxCallback': '',
            'reg': /^((13[0-9]{9})|(14[0-9]{9})|(15[0-35-9][0-9]{8})|(17[0-9]{9})|(18[0-9]{9}))$/
        },
        userName: {
            'minLength': 7,
            'maxLength': 12,
            'isAjax': false,
            'ajaxUrl': 'ajax/boole_true.txt',
            'ajaxCallback': '',
            'reg': /^([a-zA-Z_\u4e00-\u9fa5]+)(\d+)([a-zA-Z_\u4e00-\u9fa5]+)*|(\d+)([a-zA-Z_\u4e00-\u9fa5]+)(\d+)*$/
        },
        password: {
            'minLength': 8,
            'maxLength': 20
        }
    };
    verifyfrom.prototype._bindHandler = function () {
        var self = this,
            input = self.formBox.getElementsByTagName('input');  //input表单列表
        if (self.isOnblurVerify) {
            for (var i = 0, iLength = input.length; i < iLength; i++) {
                input[i].onblur = function () {
                    if (self._eval(this.getAttribute('data-required'))) {
                        self.verifyInput(this);
                    }
                }
            }
        }
    };
    verifyfrom.prototype._eval = function (val) {
        return !!(new Function("return " + val))();
    };
    verifyfrom.prototype._correct = function (obj) {
        this._removeClass(obj, this.errorStyle);
        this._addClass(obj, this.correctStyle);
        this.correctAfter && this.correctAfter(obj);
    };
    verifyfrom.prototype._error = function (obj, str) {
        this._removeClass(obj, this.correctStyle);
        this._addClass(obj, this.errorStyle);
        this.errorAfter && this.errorAfter(obj, str);
    };
    verifyfrom.prototype._addClass = function (obj, cls) {
        var targetObj = this.isErrorOnParent ? obj.parentElement : obj;
        if (typeof cls == 'string' && targetObj.nodeType === 1) {
            if (!targetObj.className) {
                targetObj.className = cls;
            } else {
                var a = (targetObj.className + ' ' + cls).match(/\S+/g);
                a.sort();
                for (var i = a.length - 1; i > 0; --i)
                    if (a[i] == a[i - 1]) a.splice(i, 1);
                targetObj.className = a.join(' ');
            }
        }
    };
    verifyfrom.prototype._removeClass = function (obj, cls) {
        var targetObj = this.isErrorOnParent ? obj.parentElement : obj;
        if (targetObj.className && typeof cls === 'string' && targetObj.nodeType === 1) {
            var classArr = targetObj.className.split(' ');
            for (var i = 0, iLength = classArr.length; i < iLength; i++) {
                if (classArr[i] === cls) {
                    classArr.splice(i, 1);
                }
            }
            targetObj.className = classArr.join(' ');
        }
    };
    verifyfrom.prototype._strLength = function (str) {
        var len = 0,
            a = str.split('');
        for (var i = 0; i < a.length; i++) {
            if (a[i].charCodeAt(0) < 299) {
                len++;
            } else {
                len += 2;
            }
        }
        return len;
    };
    verifyfrom.prototype._extend = function () {
        if (arguments.length > 1) {
            var resultObj = [].shift.call(arguments);
            [].forEach.call(arguments, function (obj) {
                for (var key in obj) {
                    resultObj[key] = obj[key];
                }
            });
            return resultObj;
        }
    };
    verifyfrom.prototype.destroy = function () {
        //释放内存
    };
    return function (formId, opts) {
        //确保该函数作为构造函数被调用
        if (!(this instanceof verifyfrom)) {
            return new verifyfrom(formId, opts);
        } else {
            return verifyfrom;
        }
    };


});