// pages/addaddress/address.js
var app = getApp();
var validData = require('../../utils/valid.js');
var valid = validData.valid;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    region: ['广东省', '广州市', '海珠区'],
    formData: {
      name_val: '',
      phone_val: '',
      address_val: ''
    },
    defaultAddress: 1,
    fromOrder: false
  },
  bindRegionChange: function (e) {
    this.setData({
      region: e.detail.value
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      headerHeight: app.systemInfo.headerHeight
    })
    if (options.from) {
      this.setData({
        fromOrder: options.from
      })
    }
  },
  // 收货人姓名
  setName: function (e) {
    var name = 'formData.name_val';
    this.setData({
      [name]: e.detail.value
    })
  },
  // 收货人电话
  setPhone: function (e) {
    var name = 'formData.phone_val';
    this.setData({
      [name]: e.detail.value
    })
  },
  setAddress: function (e) {
    var name = 'formData.address_val';
    this.setData({
      [name]: e.detail.value
    })
  },
  // 提交
  submitData: function () {
    // console.log(this.data);
    wx.showLoading({
      title: '正在添加地址...',
      mask: true
    })
    var self = this;
    if (!this.formValid()) { return }
    app.POST({
      url: app.config.url,
      data: {
        request: 'private.address.add.user.address.action',
        platform: app.config.platform,
        token: app.globalData.session_key,
        shop_name: self.data.formData.name_val,
        shop_phone: self.data.formData.phone_val,
        address_details: self.data.formData.address_val,
        default_select: self.data.defaultAddress,
        provice_name: self.data.region[0],
        city_name: self.data.region[1],
        area_name: self.data.region[2]
      },
      success: function (res) {
        // console.log('addAddress', res);
        var addressId = res.data.id;
        if (res.data.code == 0) {
          wx.showToast({
            title: res.data.msg,
            icon: 'success',
            duration: 1500,
            success: function () {
              setTimeout(function () {
                if (self.data.fromOrder == '1') {
                  var pages = getCurrentPages();             //  获取页面栈
                  var currPage = pages[pages.length - 1];    // 当前页面
                  var prevPage = pages[pages.length - 2];    // 上一个页面
                  console.log(addressId);
                  prevPage.setData({
                    defaultAddress: {
                      shop_name: self.data.formData.name_val,
                      shop_phone: self.data.formData.phone_val,
                      address_location: self.data.region[0] + ' ' + self.data.region[1] + ' ' + self.data.region[2],
                      address_details: self.data.formData.address_val,
                      default_select: self.data.defaultAddress,
                      id: addressId
                    }
                  })
                  wx.navigateBack({
                    delta: 1
                  })
                } else if (self.data.fromOrder == 2) {
                  var pages = getCurrentPages();             //  获取页面栈
                  var currPage = pages[pages.length - 1];    // 当前页面
                  var prevPage = pages[pages.length - 3];    // 上上一个页面
                  prevPage.setData({
                    defaultAddress: {
                      shop_name: self.data.formData.name_val,
                      shop_phone: self.data.formData.phone_val,
                      address_location: self.data.region[0] + ' ' + self.data.region[1] + ' ' + self.data.region[2],
                      address_details: self.data.formData.address_val,
                      default_select: self.data.defaultAddress,
                      id: addressId
                    }
                  })
                  wx.navigateBack({
                    delta: 2
                  })
                } else {
                  var pages = getCurrentPages();             //  获取页面栈
                  var currPage = pages[pages.length - 1];    // 当前页面
                  var prevPage = pages[pages.length - 2];    // 上一个页面

                  prevPage.setData({
                    refresh: true
                  })
                  wx.navigateBack({
                    delta: 1
                  })
                }

              }, 1500)
            }
          })
        } else if(res.data.code >= 999){
          app.getSessionKeyCallBack = function () {
            that.submitData();
          }
          app.getSessionKey();
        }else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 1500
          })
        }
      },
      fail: function (res) {
        console.log(res);
        wx.showToast({
          title: '请求异常',
          icon: 'none',
          duration: 1500
        })
      },
      complete: function () {
        wx.hideLoading()
      }
    })
  },
  // 设置默认地址
  setDefaultAddress: function (e) {
    if (e.detail.value) {
      this.setData({
        defaultAddress: 1
      })
    } else {
      this.setData({
        defaultAddress: 0
      })
    }
  },
  // 表单验证
  formValid: function () {
    if (valid.isEmputy(this.data.formData.name_val)) {
      wx.showToast({
        title: '收货人姓名不能为空',
        icon: 'none',
        duration: 2000
      })
      return false;
    } else if (valid.isEmputy(this.data.formData.phone_val)) {
      wx.showToast({
        title: '收货电话不能为空',
        icon: 'none',
        duration: 2000
      })
      return false;
    } else if (valid.isEmputy(this.data.formData.address_val)) {
      wx.showToast({
        title: '请输入收货详细信息',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    return true;
  },
  showToast: function (msg) {
    wx.showToast({
      title: msg,
      icon: 'none',
      duration: 1500
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


})