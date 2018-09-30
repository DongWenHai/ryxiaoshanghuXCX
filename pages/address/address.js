// pages/address/address.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    curpage: 1,
    isGetAll: false,
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
    this.getAddress();
    if (!options.from) {
      this.setData({
        fromOrder: false
      })
    } else {
      this.setData({
        fromOrder: true
      })
    }
  },
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
        console.log(res);
        if (res.data.code == 0) {
          var data = res.data.data.data;
          for (var i = 0; i < data.length; i++) {
            data[i].isTouchMove = false //默认隐藏删除
          }
          that.setData({
            addressData: data
          })
          if (res.data.data.data.length < res.data.data.page_size) {
            that.setData({
              isGetAll: true
            })
          }
        } else if(res.data.code >= 999){
          app.getSessionKeyCallBack = function () {
            that.getAddress();
          }
          app.getSessionKey();
        }else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 1500
          })
        }
      }
    })
  },
  //设置默认地址
  setDefaultAddress: function (e) {
    var that = this;
    if (e.currentTarget.dataset.default == 1) { return; }
    app.POST({
      url: app.config.url,
      data: {
        platform: app.config.platform,
        request: 'private.address.set.default.select.action',
        select_id: e.currentTarget.dataset.id,
        token: app.globalData.session_key
      },
      success: function (res) {
        console.log(res);
        if (res.data.code == 0) {
          var addressData = that.data.addressData;
          for (var i = 0; i < addressData.length; i++) {
            if (addressData[i].id == e.currentTarget.dataset.id) {
              addressData[i].default_select = 1;
            } else {
              addressData[i].default_select = 0;
            }
          }
          that.setData({
            addressData: addressData
          })
        }else if(res.data.code >= 999){
          app.getSessionKeyCallBack = function () {
            that.setDefaultAddress(e);
          }
          app.getSessionKey();
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 1500
          })
        }
      },
      fail: function () {
        wx.showToast({
          title: '请求异常',
          icon: 'none',
          duration: 1500
        })
      }
    })
  },
  //删除地址
  deleteAddress: function (e) {
    var that = this;
    app.POST({
      url: app.config.url,
      data: {
        platform: app.config.platform,
        request: 'private.address.del.user.address.action',
        token: app.globalData.session_key,
        id: e.currentTarget.dataset.id
      },
      success: function (res) {
        if (res.data.code == 0) {
          var addressData = that.data.addressData;
          wx.showToast({
            title: '删除地址成功',
            icon: 'success',
            duration: 1500
          })
          addressData.splice(e.currentTarget.dataset.index, 1);
          that.setData({
            addressData: addressData
          })
        } else if(res.data.code >= 999){
          app.getSessionKeyCallBack = function () {
            that.deleteAddress(e);
          }
          app.getSessionKey();
        }else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 1500
          })
        }
      }
    })
  },
  // 编辑地址
  editAddress: function (e) {
    var data = '';
    for (var key in this.data.addressData) {
      if (this.data.addressData[key].id == e.currentTarget.dataset.id) {
        data = this.data.addressData[key];
      }
    }
    data = JSON.stringify(data);
    if (this.data.fromOrder) {
      wx.navigateTo({
        url: '/pages/editAddress/editAddress?address=' + data + '&from=2',
      })
    } else {
      wx.navigateTo({
        url: '/pages/editAddress/editAddress?address=' + data,
      })
    }

  },
  //由订单详情页触发选择地址
  selectAddressToOrder: function (e) {
    if (!this.data.fromOrder) { return; }
    var pages = getCurrentPages();             //  获取页面栈
    var currPage = pages[pages.length - 1];    // 当前页面
    var prevPage = pages[pages.length - 2];    // 上一个页面
    var defaultAddress = '';
    for (var key in this.data.addressData) {
      if (this.data.addressData[key].id == e.currentTarget.dataset.id) {
        defaultAddress = this.data.addressData[key];
      }
    }
    prevPage.setData({
      defaultAddress: defaultAddress
    })
    wx.navigateBack({
      delta: 1
    })
  },
  newAddress: function () {
    if (this.data.fromOrder) {
      wx.navigateTo({
        url: '/pages/addAddress/addAddress?from=2',
      })
    } else {
      wx.navigateTo({
        url: '/pages/addAddress/addAddress',
      })
    }
  },
  // 上拉加载更多
  getMore: function () {
    var that = this;
    app.POST({
      url: app.config.url,
      data: {
        platform: app.config.platform,
        request: 'private.address.all.my.address.get',
        token: app.globalData.session_key,
        curpage: that.data.curpage + 1
      },
      success: function (res) {
        if (res.data.code == 0) {
          var addressData = that.data.addressData;
          var data = res.data.data.data;
          for (var i = 0; i < data.length; i++) {
            data[i].isTouchMove = false //默认隐藏删除
          }
          addressData = addressData.concat(data);
          that.setData({
            addressData: addressData,
            curpage: that.data.curpage + 1
          })
          if (res.data.data.data.length < res.data.data.page_size) {
            that.setData({
              isGetAll: true
            })
          }
        } else if(res.data.code >= 999){
          app.getSessionKeyCallBack = function () {
            that.getMore();
          }
          app.getSessionKey();
        }else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 1500
          })
        }
      }
    })
  },


  //手指触摸动作开始 记录起点X坐标
  touchstart: function (e) {
    //开始触摸时 重置所有删除
    this.data.addressData.forEach(function (v, i) {
      if (v.isTouchMove)//只操作为true的
        v.isTouchMove = false;
    })
    this.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,
      addressData: this.data.addressData
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
    that.data.addressData.forEach(function (v, i) {
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
      addressData: that.data.addressData
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
    if (this.data.refresh) {
      this.setData({
        curpage: 1,
        isGetAll: false
      })
      this.getAddress();
    }
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
    if (this.data.isGetAll) { return; }
    this.getMore();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})