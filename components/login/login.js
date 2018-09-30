var app = getApp();
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    msg1: '请授权登录，否则部分功能将无法使用'
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getUserInfo: function (e) {
      var that = this;
      if(e.detail.userInfo){
        app.globalData.userInfo = e.detail.userInfo;
        wx.setStorage({
          key: 'userInfo',
          data: e.detail.userInfo
        })
        app.updateUserInfoCallback = function () {
          that.triggerEvent('updateUserInfoSuccess');
        },
          app.updateUserInfo(e.detail.userInfo);
      }else{
        that.triggerEvent('cancleUpdateUserinfo');
      }
      
    },
    closeUpdateUserinfo:function(){
      this.triggerEvent('cancleUpdateUserinfo');
    }
  }
})
