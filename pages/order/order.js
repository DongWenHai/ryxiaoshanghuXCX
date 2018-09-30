const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    curpage:1,
    loaded:false,
    topY:50
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      headerHeight: app.systemInfo.headerHeight
    })
    this.refreshView = this.selectComponent("#refreshView");
    
    
  },
  //获取未完成订单列表
  getUnOrderList:function(){
    var that = this;
    app.POST({
      url:app.config.url,
      data:{
        platform:app.config.platform,
        request:'private.order.order.undone.list.get',
        token:app.globalData.session_key
      },
      success:function(res){
        // console.log('getUnOrderList',res);
        if(res.data.code == 0){
          that.getOrderList();
          that.setData({
            orderUnDoneList:res.data.data
          })
          that.refreshView.stopPullRefresh();
        } else if (res.data.code >= 999) {
          app.getSessionKeyCallback = res => {
            that.getUnOrderList();
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
  //获取已完成订单列表
  getOrderList: function () {
    var that = this;
    app.POST({
      url: app.config.url,
      data: {
        platform: app.config.platform,
        request: 'private.order.order.done.list.get',
        token: app.globalData.session_key,
        curpage:that.data.curpage
      },
      success: function (res) {
        // console.log('getOrderList', res);
        if(res.data.code == 0){
          var orderList = that.data.orderList || [];
          orderList = orderList.concat(res.data.data);
          that.setData({
            orderList:orderList
          })
          if (res.data.data.length < res.data.page_size){
            that.setData({
              loaded:true
            })
          }
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
  //立即付款
  payOrder:function(e){
    var that = this;
    app.POST({
      url:app.config.url,
      data:{
        platform:app.config.platform,
        request:'private.pay.md.order.pay.get',
        token:app.globalData.session_key,
        pay_method:'wx',
        orderid:e.currentTarget.dataset.orderid
      },
      success:function(result){
        if(result.data.code && result.data.code == 1){
          wx.showToast({
            title: result.data.msg,
            icon:'none',
            duration:2000
          })
        }else{
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
  deleteOrder:function(e){
    var that = this;
    wx.showModal({
      title: '温馨提示',
      content: '是否删除订单？',
      success:function(res){
        if(res.confirm){
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
                var orderList = that.data.orderList;
                orderList.splice(e.currentTarget.dataset.index, 1);
                that.setData({
                  orderList: orderList
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
  confirmAccept:function(e){
    var that = this;
    wx.showModal({
      title: '温馨提示',
      content: '是否确认收货？',
      success:function(res){
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
              that.setData({
                orderUnDoneList: [],
                orderList: [],
                curpage: 1,
                loaded: true
              })
              that.getUnOrderList();
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      curpage: 1,
      loaded: false,
      orderUnDoneList:[],
      orderList:[]
    })
    this.getUnOrderList();
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
  //触摸开始
  handletouchstart: function (event) {
    this.refreshView.handletouchstart(event)
  },
  //触摸移动
  handletouchmove: function (event) {
    this.refreshView.handletouchmove(event)
  },
  //触摸结束
  handletouchend: function (event) {
    this.refreshView.handletouchend(event)
  },
  //触摸取消
  handletouchcancel: function (event) {
    this.refreshView.handletouchcancel(event)
  },
  //页面滚动
  onPageScroll: function (event) {
    this.refreshView.onPageScroll(event)
  },
  onPullDownRefresh: function () {
    this.getUnOrderList();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if(this.data.loaded){
      return;
    }
    this.getOrderList();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})