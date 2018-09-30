const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    startX: 0, //开始坐标
    startY: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      headerHeight: app.systemInfo.headerHeight
    })
    
  },
  //获取购物车产品
  getCartInfo:function(){
    var that = this;
    wx.showNavigationBarLoading();
    app.POST({
      url:app.config.url,
      data:{
        platform:app.config.platform,
        request:'private.cart.cart.detail.get',
        token:app.globalData.session_key
      },
      success:function(res){
        wx.hideNavigationBarLoading();
        // console.log('getCartInfo',res);
        if(res.data.code == 0){
          var data = res.data.data;
          for (var i = 0; i < data.length; i++) {
            data[i].isTouchMove = false //默认隐藏删除
          }
          that.setData({
            cartData:data,
            totalMoney: res.data.total_money
          })
        }else if(res.data.code >= 999){
          app.getSessionKeyCallBack = function () {
            that.getCartInfo();
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
  //减少数量
  reduceCount: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    var count = this.getCount(id);
    if (count == 1) {
      wx.showModal({
        title: '温馨提示',
        content: '是否删除该宝贝？',
        success: function (res) {
          if (res.cancel) {
            return;
          } else if (res.confirm) {
            that.deleteCart(id)
          }
        }
      })
    } else {
      this.fnReduceCount(count, id)
    }

  },
  fnReduceCount: function (count, id) {
    var that = this;
    app.POST({
      url: app.config.url,
      data: {
        platform: app.config.platform,
        request: 'private.cart.product.amount.change.action',
        token: app.globalData.session_key,
        id: id,
        product_count: count - 1
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.getCartInfo();
        } else if (res.data.code >= 999) {
          app.getSessionKeyCallBack = function () {
            that.fnReduceCount(count, id);
          }
          app.getSessionKey();
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 1500
          })
        }
      }
    })
  },
  //删除购物车
  del:function(e){
    this.deleteCart(e.currentTarget.dataset.id);
  },
  deleteCart: function (id) {
    var that = this;
    app.POST({
      url: app.config.url,
      data: {
        platform: app.config.platform,
        token: app.globalData.session_key,
        request: 'private.cart.product.delete.action',
        id: id
      },
      success: function (res) {
        if (res.data.code == 0) {
          wx.showToast({
            title: res.data.msg,
            icon: 'success',
            duration: 2000
          })
          that.getCartInfo();
        } else if(res.data.code >= 999){
          app.getSessionKeyCallBack = function () {
            that.deleteCart(id);
          }
          app.getSessionKey();
        }else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  },
  //增加数量
  addCount: function (e) {
    var that = this;
    var count = this.getCount(e.currentTarget.dataset.id);
    app.POST({
      url: app.config.url,
      data: {
        platform: app.config.platform,
        request: 'private.cart.product.amount.change.action',
        token: app.globalData.session_key,
        id: e.currentTarget.dataset.id,
        product_count: Number(count) + 1
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.getCartInfo();
        } else if (res.data.code >= 999) {
          app.getSessionKeyCallBack = function () {
            that.addCount(e);
          }
          app.getSessionKey();
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 1500
          })
        }
      }
    })
  },
  //根据id获取对应的数量
  getCount: function (id) {
    var cartData = this.data.cartData;
    for (var i=0;i<cartData.length;i++) {
      if (cartData[i].id == id) {
        return cartData[i].product_count
      }
    }
  },
  //结算
  settlement:function(){
    wx.navigateTo({
      url: '/pages/settlementSub/settlementSub',
    })
  },
  //手指触摸动作开始 记录起点X坐标
  touchstart: function (e) {
    //开始触摸时 重置所有删除
    this.data.cartData.forEach(function (v, i) {
      if (v.isTouchMove)//只操作为true的
        v.isTouchMove = false;
    })
    this.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,
      cartData: this.data.cartData
    })
  },

  //滑动事件处理
  touchmove: function (e) {
    var that = this,
      index = e.currentTarget.dataset.index,//当前索引
      startX = that.data.startX,//开始X坐标
      startY = that.data.startY,//开始Y坐标
      touchMoveX = e.changedTouches[0].clientX,//滑动变化坐标
      touchMoveY = e.changedTouches[0].clientY,//滑动变化坐标
      //获取滑动角度
      angle = that.angle({ X: startX, Y: startY }, { X: touchMoveX, Y: touchMoveY });
    that.data.cartData.forEach(function (v, i) {
      v.isTouchMove = false
      //滑动超过30度角 return
      if (Math.abs(angle) > 30) return;
      if (i == index) {
        if (touchMoveX > startX) //右滑
          v.isTouchMove = false
        else //左滑
          v.isTouchMove = true
      }
    })

    //更新数据
    that.setData({
      cartData: that.data.cartData
    })
  },

  /**
  
  * 计算滑动角度
  
  * @param {Object} start 起点坐标
  
  * @param {Object} end 终点坐标
  
  */

  angle: function (start, end) {
    var _X = end.X - start.X,
      _Y = end.Y - start.Y
    //返回角度 /Math.atan()返回数字的反正切值
    return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
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
    this.getCartInfo();
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