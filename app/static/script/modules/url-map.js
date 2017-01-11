/**
 * Created by wyj on 2015/11/2.
 */
/**
 * 钱庄网
 * @name 基础js
 * @description url映射表
 * @date 2015-07-28
 */
define(function (require, exports, module) {
    var curPageUrl = window.location.href;
    var apiUrl = 'http://ceshi.qian360.com:8080';
    //var apiUrl = 'http://test.qian360.com';     // 连接test环境对接
    var h5ApiUrl = 'http://h5.test.qian360.com/';
    return {
        apiUrl: {
            url: apiUrl
        },
        appCheckLogin:{
            url: apiUrl + '/activity/monthlyActivity/checkLogin.html'
        },
        activityData: {
            url: apiUrl + '/activity/monthlyActivity/loginParam.html'
        },
        totalTender:{
            url:apiUrl+'/activity/monthlyActivity/totalTender.html'
        },
        newTenderAmount:{
            url:apiUrl+'/activity/monthlyActivity/newTenderAmount.html'
        },
        lotteryShow:{
            url:apiUrl+'/activity/monthlyActivity/lotteryShow.html'
        },
        h5CheckLogin: {
            url: apiUrl + '/wap/user/getUserInfoStatus.html',
            service: 'getUserInfoStatus'
        },
        h5loginPage: {
            url: h5ApiUrl + 'interlayer.html?redirectURL=' + curPageUrl
        },
        h5ProductList: {
            url: h5ApiUrl + '#&pageProList'
        },
        h5UserAccount: {
            url: h5ApiUrl + '#&pageUser'
        },
        lotteryTimes: {
            url: apiUrl + '/activity/monthlyActivity/lotteryTimes.html'
        },
        lottery: {
            url: apiUrl + '/activity/monthlyActivity/lottery.html'
        },
        userLotteryTimes: {
            url: apiUrl + '/activity/monthlyActivity/userLotteryTimes.html'
        },
        userLottery: {
            url: apiUrl + '/activity/monthlyActivity/userLottery.html'
        },
        chanceHistory: {
            url: apiUrl + '/activity/monthlyActivity/chanceHistory.html'
        },
        lotteryPrice: {
            url: apiUrl + '/activity/monthlyActivity/lotteryPrice.html'
        },
        getProvinceList: {
            url: apiUrl + '/activity/monthlyActivity/getProvinceList.html'
        },
        myPrice: {
            url: apiUrl + '/activity/monthlyActivity/myPrice.html'
        },
        pricecenter: {
            url: apiUrl + '/activity/monthlyActivity/m1511/giftCollect.html'
        },
        share: {
            url: apiUrl + '/activity/monthlyActivity/share.html'
        },
        checkShare: {
            url: apiUrl + '/activity/monthlyActivity/checkShare.html'
        },
        userShare: {
            url: apiUrl + '/activity/monthlyActivity/userShare.html'
        },
        checkUserShare: {
            url: apiUrl + '/activity/monthlyActivity/checkUserShare.html'
        },
        checkAddress: {
            url: apiUrl + '/activity/getGift/checkAddress.html'
        },
        ajaxActivityAddressM: {
            url: apiUrl + '/activity/getGift/ajaxActivityAddressM.html'
        },
        showArea: {
            url: apiUrl + '/area/showArea.html'
        },
        pages:{
            url: apiUrl + '/activity/monthlyActivity/index.html?returnUrl='
        },
        phoneDate:{
            url: apiUrl + '/activity/monthlyActivity/phoneData.html'
        },
        scratchDate:{
            url: apiUrl + '/activity/monthlyActivity/scratchDate.html'
        },
        activityParam: {
            url: apiUrl + '/activity/monthlyActivity/activityParam.html'
        },
        sendRegisterCode: {
            url: apiUrl + '/promotion/sendRegisterCode.html'
        },
        dealRegister: {
            url: apiUrl + '/promotion/dealRegister.html'
        },
        tenderHistory: {
            url: apiUrl + '/activity/monthlyActivity/tenderHistory.html'
        },
        clickGetRedpacket: {
            url: apiUrl + '/activity/monthlyActivity/clickGetRedpacket.html'
        },
        countOlympicPerson: {
            url: apiUrl + '/activity/monthlyActivity/countOlympicPerson.html'
        },
        queryAdventureData: {
            url: apiUrl + '/activity/monthlyActivity/queryAdventureData.html'
        },
        createShareCode:{
            url: apiUrl + '/activity/share/createShareCode.html'
        },
        clickShareLink:{
            url: apiUrl + '/activity/share/clickShareLink.html'
        },
        openRed:{
            url: apiUrl + '/activity/doubleEleven/openRed.html'
        },
        myRed:{
            url: apiUrl + '/activity/doubleEleven/myRed.html'
        },
        queryInitParamsOfLinkOne:{
            url: apiUrl + '/activity/doubleEleven/queryInitParamsOfLinkOne.html'
        },
        queryDataOfLink4:{
            url: apiUrl + '/activity/doubleEleven/queryDataOfLink4.html'
        },
        queryDataOf20161118:{
            url: apiUrl + '/activity/monthlyActivity/queryDataOf20161118.html'
        },
        queryInitParamsOf20161118:{
            url: apiUrl + '/activity/monthlyActivity/queryInitParamsOf20161118.html'
        },
        getGiftOf20161118:{
            url: apiUrl + '/activity/monthlyActivity/getGiftOf20161118.html'
        },
        monthlyActivity:{
            url: apiUrl + '/activity/monthlyActivity/queryData.html'
        },
        receiveGift:{
            url: apiUrl + '/activity/share/receiveGift.html'
        },
        //--------------------------------------------------【api密钥】
        appId: '20150720145313251618'
    }
});