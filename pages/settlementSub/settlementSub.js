const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    need_ship: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      headerHeight: app.systemInfo.headerHeight
    })
    this.getSettlementInfo();
  },
  switchShip: function (e) {
    if (e.detail.value) {
      this.setData({
        need_ship: false
      })
    } else {
      this.setData({
        need_ship: true
      })
    }
  },
  //购物车下单信息
  getSettlementInfo: function () {
    var that = this;
    app.POST({
      url: app.config.url,
      data: {
        platform: app.config.platform,
        request: 'private.checkout.cart.order.get',
        token: app.globalData.session_key
      },
      success: function (res) {
        console.log('getSettlementInfo', res);
        if (res.data.code == 0) {
          that.setData({
            settlementInfo: res.data.data,
            storeInfo: res.data.shop
          })
          if (res.data.shop.is_dispatch == 0 || res.data.shop.is_dispatch == 2) {
            that.getAddress();
          }
        } else if(res.data.code >= 999){
            app.getSessionKeyCallBack = function () {
              that.getSettlementInfo();
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
  //获取地址
  getAddress: function () {
    var that = this;
    app.POST({
      url: app.config.url,
      data: {
        platform: app.config.platform,
        request: 'private.address.user.address.get',
        token: app.globalData.session_key
      },
      success: function (res) {
        // console.log('getAddress', res);
        if (res.data.code == 0) {
          var addressData = res.data.data.data;
          if (addressData.length == 0) {
            that.setData({
              defaultAddress: ''
            })
          } else {
            var defaultAddress = '';
            for (var i = 0; i < addressData.length; i++) {
              if (addressData[i].default_select == 1) {
                defaultAddress = addressData[i];
              }
            }
            if (!defaultAddress) {
              defaultAddress = addressData[0]
            }
            that.setData({
              defaultAddress: defaultAddress
            })
          }
        }
      }
    })
  },
  // 获取购物车订单id数组
  getOrderIdArr:function(){
    var settlementInfo = this.data.settlementInfo;
    var arr = [];
    for (var i = 0; i < settlementInfo.cart.length;i++){
      arr.push(settlementInfo.cart[i].id)
    }
    return arr;
  },
  //立即支付
  payOrder: function () {
    if ((this.data.storeInfo.is_dispatch == 2 || (this.data.storeInfo.is_dispatch == 0 && this.data.need_ship)) && !this.data.defaultAddress && !this.data.defaultAddress.id) {
      wx.showToast({
        title: '请填写收货地址',
        icon: 'none',
        duration: 1500
      })
      return;
    }
    var that = this;
    var cart_id = this.getOrderIdArr();
    app.POST({
      url: app.config.url,
      data: {
        platform: app.config.platform,
        request: 'private.checkout.cart.add.order.action',
        token: app.globalData.session_key,
        address_id: that.data.defaultAddress.id || '',
        cart_id: cart_id,
        is_take: that.data.storeInfo.is_dispatch == 2 ? 1 : (that.data.storeInfo.is_dispatch==0&&that.data.need_ship?1:0)
      },
      success: function (data) {
        console.log('payOrder',data);
        if(data.data.code == 0){
          var orderid = data.data.orderid;
          app.POST({
            url: app.config.url,
            data: {
              platform: app.config.platform,
              request: 'private.pay.md.order.pay.get',
              token: app.globalData.session_key,
              orderid: orderid,
              pay_method: 'wx'
            },
            success: function (result) {
              wx.requestPayment({
                'timeStamp': result.data.timeStamp,
                'nonceStr': result.data.nonceStr,
                'package': result.data.package,
                'signType': 'MD5',
                'paySign': result.data.paySign,
                'success': function (res) {
                  // console.log(res);
                  wx.redirectTo({
                    url: '/pages/payresult/payresult?status=success&code=' + data.data.id
                  })
                },
                'fail': function (res) {
                  // console.log(res);
                  wx.redirectTo({
                    url: '/pages/order/order?activeIndex=1',
                  })
                }
              })
            }
          })
        }else if(res.data.code >= 999){
          app.getSessionKeyCallBack = function () {
            that.payOrder();
          }
          app.getSessionKey();
        }else{
          wx.showToast({
            title: data.data.msg,
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