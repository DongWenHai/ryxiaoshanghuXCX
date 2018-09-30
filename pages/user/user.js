// pages/user/user.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      headerHeight: app.systemInfo.headerHeight,
      storeInfo:app.globalData.storeInfo
    })
  },
  //获取用户信息
  getUserData:function(){
    var that = this;
    app.POST({
      url:app.config.url,
      data:{
        platform:app.config.platform,
        request:'private.weixin.user.info.get',
        token:app.globalData.session_key
      },
      success:function(res){
        // console.log('getUserData',res);
        if(res.data.code == 0){
          that.setData({
            userData:res.data.data
          })
        }else if(res.data.code >= 999){
          app.getSessionKeyCallback = res => {
            that.getUserData();
          }
          app.getSessionKey();
        }else{
          wx.showToast({
            title: res.data.msg,
            icon:'none',
            duration:2000
          })
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getUserData();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})