const app= getApp();
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
      orderid:options.orderid
    })
    this.getOrderInfo(options.orderid);
  },
  getOrderInfo: function (orderid) {
    var that = this;
    app.POST({
      url: app.config.url,
      data: {
        platform: app.config.platform,
        request: 'private.order.order.detail.get',
        token: app.globalData.session_key,
        id: orderid
      },
      success: function (res) {
        // console.log('orderDetail',res);
        if (res.data.code == 0) {
          that.setData({
            order: res.data.data,
            orderData: res.data.products
          })
        } else if (res.data.code >= 999) {
          app.getSessionKeyCallback = res => {
            that.getOrderInfo(orderid);
          }
          app.getSessionKey();
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  },
  //立即付款
  payOrder: function (e) {
    var that = this;
    app.POST({
      url: app.config.url,
      data: {
        platform: app.config.platform,
        request: 'private.pay.md.order.pay.get',
        token: app.globalData.session_key,
        pay_method: 'wx',
        orderid: e.currentTarget.dataset.orderid
      },
      success: function (result) {
        if (result.data.code && result.data.code == 1) {
          wx.showToast({
            title: result.data.msg,
            icon: 'none',
            duration: 2000
          })
        } else {
          wx.requestPayment({
            'timeStamp': result.data.timeStamp,
            'nonceStr': result.data.nonceStr,
            'package': result.data.package,
            'signType': 'MD5',
            'paySign': result.data.paySign,
            'success': function (res) {
              // console.log(res);
              wx.redirectTo({
                url: '/pages/payresult/payresult?status=success',
              })
            }
          })
        }
      }
    })
  },
  //删除订单
  deleteOrder: function (e) {
    var that = this;
    wx.showModal({
      title: '温馨提示',
      content: '是否删除订单？',
      success: function (res) {
        if (res.confirm) {
          app.POST({
            url: app.config.url,
            data: {
              platform: app.config.platform,
              request: 'private.order.del.order.action',
              token: app.globalData.session_key,
              orderid: e.currentTarget.dataset.orderid
            },
            success: function (res) {
              if (res.data.code == 0) {
                wx.navigateBack({
                  delta:1
                })
              } else if (res.data.code >= 999) {
                app.getSessionKeyCallback = res => {
                  that.deleteOrder(e);
                }
                app.getSessionKey();
              } else {
                wx.showToast({
                  title: res.data.msg,
                  icon: 'none',
                  duration: 2000
                })
              }
            }
          })
        }
      }
    })

  },
  //确认收货
  confirmAccept: function (e) {
    var that = this;
    wx.showModal({
      title: '温馨提示',
      content: '是否确认收货？',
      success: function (res) {
        app.POST({
          url: app.config.url,
          data: {
            platform: app.config.platform,
            request: 'private.order.order_receive_action',
            token: app.globalData.session_key,
            orderid: e.currentTarget.dataset.orderid
          },
          success: function (res) {
            if (res.data.code == 0) {
              wx.navigateBack({
                delta:1
              })
            } else if (res.data.code >= 999) {
              app.getSessionKeyCallback = res => {
                that.confirmAccept(e);
              }
              app.getSessionKey();
            } else {
              wx.showToast({
                title: res.data.msg,
                icon: 'none',
                duration: 2000
              })
            }
          }
        })
      }
    })

  },
  //取消订单
  cancleOrder:function(e){
    var that = this;
    wx.showModal({
      title: '温馨提示',
      content: '是否取消订单？',
      success: function (res) {
        if (res.confirm) {
          app.POST({
            url: app.config.url,
            data: {
              platform: app.config.platform,
              request: 'private.order.order.cancle.action',
              token: app.globalData.session_key,
              orderid: e.currentTarget.dataset.orderid
            },
            success: function (res) {
              if (res.data.code == 0) {
                wx.navigateBack({
                  delta: 1
                })
              } else if (res.data.code >= 999) {
                app.getSessionKeyCallback = res => {
                  that.cancleOrder(e);
                }
                app.getSessionKey();
              } else {
                wx.showToast({
                  title: res.data.msg,
                  icon: 'none',
                  duration: 2000
                })
              }
            }
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