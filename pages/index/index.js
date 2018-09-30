//获取应用实例
const app = getApp()

Page({
  data: {
    modelAnimation:{},          //模态框动画
    showAttrModel:false,        //属性选择模态框控制
    showUpdateUserinfo:false,          //用户登录状态
    stock: 0,                   //当前库存
    price: 0,                   //当前价格
    count: 1,                   //产品数量
    cartNum:0,                   //购物车数量
    attrArr:[],
    attrData:[],
    hide_good_box:true
  },
  onLoad: function () {
    var that = this;
    this.busPos = {};
    this.busPos['x'] = app.systemInfo.winWidth - 50;//购物车的位置
    this.busPos['y'] = 566;
    this.setData({
      headerHeight: app.systemInfo.headerHeight,
      carX: app.systemInfo.winWidth - 50,
      carY: 486,
    })
    this.refreshView = this.selectComponent("#refreshView");
    //用户登录回调
    this.getuserInfoCallback();
  },
  getuserInfoCallback: function () {
    var that = this;
    if(app.globalData.session_key){
      that.getProducts();
      that.getStoreInfo();
    }else{
      app.getSessionKeyCallbackIndex = res => {     //session_key之后的回调，在此处初始化数据，防止session_key获取不到
        //初始数据
        that.getProducts();
        that.getStoreInfo();
      }
    }
  },
  updateUserInfoSuccess:function(){
    this.setData({
      showUpdateUserinfo:false
    })
    wx.navigateTo({
      url: '/pages/user/user',
    })
  },
  cancleUpdateUserinfo:function(){
    this.setData({
      showUpdateUserinfo: false
    })
  },
  navgatorUser:function(){
    var userInfo = wx.getStorageSync('userInfo');
    if (!app.globalData.userInfo || !userInfo || app.globalData.userInfo.avatarUrl != userInfo.avatarUrl || app.globalData.userInfo.nickName != userInfo.nickName){
      this.setData({
        showUpdateUserinfo: true
      })
    }else{
      wx.navigateTo({
        url: '/pages/user/user',
      })
    }
  },
  //获取店铺信息
  getStoreInfo:function(){
    var that = this;
    app.POST({
      url:app.config.url,
      data:{
        platform:app.config.platform,
        request:'private.weixin.shop.info.get',
        token:app.globalData.session_key
      },
      success:function(res){
        // console.log('getStoreInfo',res);
        if(res.data.code == 0){
          that.setData({
            storeInfo:res.data.data
          })
          app.globalData.storeInfo = res.data.data;
          that.getCartNum();
        }else if(res.data.code >= 999){
          app.getSessionKeyCallBack = function () {
            that.getStoreInfo();
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
   * 页面动画处理
  */
  modelAnimation: function () {
    var animation = wx.createAnimation({
      duration: 200
    })
    animation.opacity(1).step();
    this.setData({
      modelAnimation: animation.export()
    })
  },
  carAnimation:function(){
    var animation = wx.createAnimation({
      duration: 50
    })
    animation.scale(1.5).opacity(0.5).step();
    animation.scale(1).opacity(1).step();
    this.setData({
      carAnimation: animation.export()
    })
  },
  showAttrModel:function(e){
    if(e.currentTarget.dataset.id){
      this.getProductInfo(e.currentTarget.dataset.id)
    }
    this.setData({
      showAttrModel:true
    })
    this.modelAnimation();
  },
  closeAttrModel:function(){
    this.setData({
      showAttrModel: false,
      attrArr: [],       //属性状态
      stock: 0,                //当前库存
      price: 0,                 //当前价格
      count: 1,                  //产品数量
      // productData:{},
      attrData:[]
    })
  },
  navigatorToCar:function(){
    wx.navigateTo({
      url: '/pages/car/car',
    })
  },
  moveCar:function(e){
    if(e.detail.source == 'touch'){
      if (e.detail.x > app.systemInfo.winWidth/2){
        this.setData({
          carX: app.systemInfo.winWidth - 50,
          carY: e.detail.y,
        })
        this.busPos['x'] = app.systemInfo.winWidth - 50;//购物车的位置
        this.busPos['y'] = e.detail.y + 88;
      }else{
        this.setData({
          carX: 0,
          carY: e.detail.y,
        })
        this.busPos['x'] = 0;//购物车的位置
        this.busPos['y'] = e.detail.y + 88;
      } 
    }
  },
  /**
   * 获取产品信息
  */
  getProducts:function(){
    var that = this;
    app.POST({
      url:app.config.url,
      data:{
        platform:app.config.platform,
        request:'public.product.store.goods.get',
        token:app.globalData.session_key
      },
      success:function(res){
        // console.log('getProducts',res);
        if(res.data.code == 0){
          that.setData({
            productsListData:res.data.data
          })
          that.refreshView.stopPullRefresh();
        }else if(res.data.code >= 999){
            app.getSessionKeyCallBack = function(){
              that.getProducts();
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
  //获取购物车产品数量
  getCartNum:function(){
    var that = this;
    app.POST({
      url:app.config.url,
      data:{
        platform:app.config.platform,
        request:'private.cart.product.amount.get',
        token:app.globalData.session_key
      },
      success:function(res){
        if(res.data.code == 0){
          that.setData({
            cartNum:res.data.data
          })
          that.carAnimation();
        }else if(res.data.code >= 999){
          
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
  // 获取产品详情
  getProductInfo: function (product_id){
    var that = this;
    wx.showLoading({
      title: '拼命加载中',
      mask:true
    })
    app.POST({
      url:app.config.url,
      data:{
        platform:app.config.platform,
        request:'public.product.store.goods.detail.get',
        token:app.globalData.session_key,
        product_id: product_id
      },
      success:function(res){
        // console.log('getProductInfo',res);
        wx.hideLoading();
        if(res.data.code == 0){
          that.setData({
            productData: res.data.data.data,
            attrArr: res.data.data.attr_array,
            price: res.data.data.data.product_price,
            stock: res.data.data.data.product_stock
          })
          that.initAttrData();

        }else if(res.data.code >= 999){
          app.getSessionKeyCallBack = function () {
            that.getProductInfo(product_id);
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
  * 属性操作
  */
  // 初始化属性数组attrData
  initAttrData: function () {
    var attrArr = this.data.attrArr || [];
    var attrData = this.data.attrData || [];
    for (var i = 0; i < attrArr.length; i++) {
      for (var j = 0; j < attrArr[i].attrValueList.length; j++) {
        //index是属性在attrData下的下标，大于或等于0表示找到了该属性，则需要查询对应属性值，等于-1时未找到该属性，则添加属性及其属性值,
        var index = this.getAttrKeyIndex(attrData, attrArr[i].attrValueList[j].attrKey);
        if (index >= 0) {
          var attrValueIndex = this.getAttrValueIndex(attrData, index, attrArr[i].attrValueList[j].attrValue);
          //attrValueIndex大于等于0表示已存在该属性值，不做任何处理，等于-1未找到该属性值，将该属性加入到对应属性下
          if (attrValueIndex == -1) {
            attrData[index].attrValue.push(attrArr[i].attrValueList[j].attrValue);
            attrData[index].attrId.push(attrArr[i].attrValueList[j].attrValueId);
          }
        } else {
          //查询sku全排列数组，index为-1，添加属性和属性值
          attrData.push({
            attrKey: attrArr[i].attrValueList[j].attrKey,
            attrValue: [attrArr[i].attrValueList[j].attrValue],
            attrId: [attrArr[i].attrValueList[j].attrValueId],
            attrControl: [],
            attrStatus: []
          })
        }
      }
    }

    //根据属性值对应的库存添加attrData中属性值控制(attrControl)
    for (var k = 0; k < attrData.length; k++) {
      for (var m = 0; m < attrData[k].attrId.length; m++) {
        var attrStockStatus = this.searchAttrValueStockBack(attrData[k].attrId[m]);
        //attrStockStatus为false是该属性对应的所有库存都为0，将对应的attrControl设置为false,否则设置为true
        if (attrStockStatus) {
          attrData[k].attrControl.push(true)
        } else {
          attrData[k].attrControl.push(false)
        }
      }
    }

    //根据属性sku数据，如果每个属性只有一个值，并且库存大于0，则将选择状态置为true,否则置为false
    if (attrArr.length == 1 && attrArr[0].attr_stock > 0) {
      for (var k = 0; k < attrData.length; k++) {
        for (var m = 0; m < attrData[k].attrId.length; m++) {
          attrData[k].attrStatus.push(true)
        }
      }
      //所有属性只有一个值时，默认选中同时将属性库存和价格保存到全局库存和价格中
      this.setData({
        stock: attrArr[0].product_stock,
        price: attrArr[0].attr_change_price
      })
    } else {
      for (var k = 0; k < attrData.length; k++) {
        for (var m = 0; m < attrData[k].attrId.length; m++) {
          attrData[k].attrStatus.push(false)
        }
      }
    }
    //将初始化数据赋值到data
    this.setData({
      attrData: attrData
    })
    // console.log(attrData);
  },
  //查询对应的attrData是否有attrKey值，有返回位置坐标，没有返回-1
  //attrData属性数组，attr_key要查询的属性名
  getAttrKeyIndex: function (attrData, attr_key) {
    for (var i = 0; i < attrData.length; i++) {
      if (attrData[i].attrKey == attr_key) {
        return i;
      }
    }
    return -1;
  },
  //查询attrData下对应的attrkey中是否有属性值attr_value,有则返回下标，不存在返回-1
  //attrData属性数组，index要查询的attr_key的下标，由getAttrKeyIndex获取，attr_value要查询的属性值
  getAttrValueIndex: function (attrData, index, attr_value) {
    return attrData[index].attrValue.indexOf(attr_value)
  },
  //初始化数据是查询每个属性下对应的库存是否都为0，有库存返回true,没有库存返回false
  searchAttrValueStockBack: function (attr_id) {
    var attrArr = this.data.attrArr;
    for (var i = 0; i < attrArr.length; i++) {
      for (var j = 0; j < attrArr[i].attrValueList.length; j++) {
        if (attrArr[i].attrValueList[j].attrValueId == attr_id && Number(attrArr[i].product_stock) > 0) {
          return true;
        }
      }
    }
    return false;
  },
  //选择或取消属性时，根据sku数据库存判断每个属性的可选状态
  //规则：首先初始化所有属性状态为可选状态(true),根据attrData中选中的属性selectedId(selectedValue)查询其他属性中库存状态,没有库存将可选状态置为false,如果可选状态已经为false则不做处理，如果所有属性都未选中，则进行初始数据中可选操作【根据属性值对应的库存添加attrData中属性值控制(attrControl)】
  selectAttr: function (e) {
    var attr_value = e.currentTarget.dataset.attr_value;      //当前选中或取消的属性值
    var attr_id = e.currentTarget.dataset.attr_id;            //当前选中或取消的属性值id
    var attr_status = e.currentTarget.dataset.attr_status;    //当前选中或取消的属性值选中状态
    var attr_kindex = e.currentTarget.dataset.kindex;         //当前选中或取消的属性下标
    var attr_vindex = e.currentTarget.dataset.vindex;         //当前选中或取消的属性值下标

    var attrData = this.data.attrData;
    if (attr_status) {
      //这里是取消选择
      attrData[attr_kindex].attrStatus[attr_vindex] = false;
      attrData[attr_kindex].selectedValue = '';
      attrData[attr_kindex].selectedId = '';
    } else {
      //这里是选择属性
      if (attrData[attr_kindex].selectedId || attrData[attr_kindex].selectedValue) {
        //该属性值已经选择，这里是切换当前属性值
        var oldAttrValueIndex = this.getAttrValueIndex(attrData, attr_kindex, attrData[attr_kindex].selectedValue);
        attrData[attr_kindex].attrStatus[oldAttrValueIndex] = false;
        attrData[attr_kindex].attrStatus[attr_vindex] = true;
        attrData[attr_kindex].selectedValue = attr_value;
        attrData[attr_kindex].selectedId = attr_id;
      } else {
        //该属性值未选择，这里是选择当前属性值
        attrData[attr_kindex].attrStatus[attr_vindex] = true;
        attrData[attr_kindex].selectedValue = attr_value;
        attrData[attr_kindex].selectedId = attr_id;
      }
    }

    var selectedAttr = this.getSelectedAttr(attrData);
    this.resetAttrControl(attrData, selectedAttr);

    if (selectedAttr.selected_id.length == attrData.length) {
      var attrSkuInfo = this.getSeletedAttrInfo(selectedAttr.selected_id);
      if (attrSkuInfo) {
        this.setData({
          price: attrSkuInfo.attr_change_price,
          stock: attrSkuInfo.product_stock,
        })
      }
    } else {
      this.setData({
        price: this.data.productData.product_price,
        stock: this.data.productData.product_stock
      })
    }
    this.setData({
      attrData: attrData,
      seletedAttr: selectedAttr.selected_value.join(',')
    })
  },
  //根据当前选中的属性数组查找当前属性组的详细信息（价格、库存）
  getSeletedAttrInfo: function (selectedAttrId) {
    var attrArr = this.data.attrArr || [];
    if (selectedAttrId.length > 0) {
      for (var i = 0; i < attrArr.length; i++) {
        if (attrArr[i].attrValueList.length == selectedAttrId.length) {
          var com = 0;
          for (var k = 0; k < attrArr[i].attrValueList.length; k++) {
            if (selectedAttrId.indexOf(attrArr[i].attrValueList[k].attrValueId) >= 0) {
              com += 1;
            }
          }
          if (com == attrArr[i].attrValueList.length) {
            return attrArr[i];
          }
        } else {
          return false;
        }
      }
      return false;
    } else {
      return false;
    }

  },
  //根据已经选择的属性判断其他属性的属性值是否可选
  resetAttrControl: function (attrData, selectedAttr) {
    var attrArr = this.data.attrArr;
    //重置属性可操作值为true
    for (var i = 0; i < attrData.length; i++) {
      for (var j = 0; j < attrData[i].attrControl.length; j++) {
        attrData[i].attrControl[j] = true;
      }
    }
    //全局库存查询，将没有库存的属性值可选控制直接置为false
    for (var k = 0; k < attrData.length; k++) {
      for (var m = 0; m < attrData[k].attrId.length; m++) {
        var attrStockStatus = this.searchAttrValueStockBack(attrData[k].attrId[m]);
        //attrStockStatus为false是该属性对应的所有库存都为0，将对应的attrControl设置为false,否则设置为true
        if (!attrStockStatus) {
          attrData[k].attrControl[m] = false;
        }
      }
    }
    //通过已选择属性判断同时还有该属性值的其他属性是否存在库存，没有库存则可选属性置为false
    for (var i = 0; i < attrData.length; i++) {
      if (attrData[i].selectedId) {
        for (var j = 0; j < attrData.length; j++) {
          if (i != j) {
            for (var k = 0; k < attrData[j].attrId.length; k++) {
              if (attrData[j].attrControl[k]) {
                var hasStock = this.searchTwoAttrValueStockBack(attrData[i].selectedId, attrData[j].attrId[k]);
                if (!hasStock) {
                  attrData[j].attrControl[k] = false;
                }
              }
            }
          }
        }
      } else {
        //通过已经选择的所有属性判断还未选择的属性的库存是否存在
        for (var m = 0; m < attrData[i].attrId.length; m++) {
          if (attrData[i].attrControl[m]) {
            var attrStatus = this.searchAttrValueStock(selectedAttr.selected_id, attrData[i].attrId[m]);
            if (!attrStatus) {
              attrData[i].attrControl[m] = false;
            }
          }
        }
      }
    }
    //判断已经选择的所有属性自身相对于已经选择的其他属性值判断是否存在库存
    for (var i = 0; i < attrData.length; i++) {
      if (selectedAttr.selected_id.length > 1 && attrData[i].selectedId) {
        for (var n = 0; n < attrData[i].attrId.length; n++) {
          if (attrData[i].attrControl[n]) {
            var attrIdArr = [];
            for (var x = 0; x < selectedAttr.selected_id.length; x++) {
              if (selectedAttr.selected_id[x] != attrData[i].selectedId) {
                attrIdArr.push(selectedAttr.selected_id[x])
              }
            }
            var attrStatus = this.searchAttrValueStock(attrIdArr, attrData[i].attrId[n]);
            if (!attrStatus) {
              attrData[i].attrControl[n] = false;
            }
          }
        }
      }
    }
  },
  //判断同时含有两个属性值得sku数据库存是否大于0，有库存返回true，没有库存返回false
  searchTwoAttrValueStockBack: function (selectedId, attr_id) {
    var attrArr = this.data.attrArr;
    var num = 0;
    for (var i = 0; i < attrArr.length; i++) {
      num = 0;
      for (var j = 0; j < attrArr[i].attrValueList.length; j++) {
        if (attrArr[i].attrValueList[j].attrValueId == attr_id || attrArr[i].attrValueList[j].attrValueId == selectedId && Number(attrArr[i].product_stock) > 0) {
          num += 1;
        }
      }
      if (num == 2) {
        return true;
      }
    }
    return false;
  },
  //获取已经选择的属性id对应的未选中的属性库存是否存在,attrIdArr已选择的属性id数组，attr_id为为选择的属性对应的属性值id
  searchAttrValueStock: function (attrIdArr, attr_id) {
    var attrArr = this.data.attrArr;
    for (var i = 0; i < attrArr.length; i++) {
      var num = 0;
      for (var j = 0; j < attrArr[i].attrValueList.length; j++) {
        if (attrIdArr.indexOf(attrArr[i].attrValueList[j].attrValueId) >= 0 || attrArr[i].attrValueList[j].attrValueId == attr_id) {
          num += 1;
        }
      }
      if (num == (attrIdArr.length + 1)) {
        return true;
      }
    }
    return false;
  },
  //获取已经选择的属性id和value
  getSelectedAttr: function (attrData) {
    // console.log(attrData);
    var selected_id = [];
    var selected_value = [];
    for (var i = 0; i < attrData.length; i++) {
      if (attrData[i].selectedId) {
        selected_id.push(attrData[i].selectedId);
        selected_value.push(attrData[i].selectedValue);
      }
    }
    return {
      selected_id: selected_id,
      selected_value: selected_value
    }
  },


  /**
   * 产品数量控制
  */
  reduceCount: function () {
    if (this.data.count > 1) {
      this.setData({
        count: this.data.count - 1
      })
    }
  },
  addCount: function () {
    if (this.data.count < this.data.stock) {
      this.setData({
        count: Number(this.data.count) + 1
      })
    } else {
      wx.showToast({
        title: '库存不足',
        icon: 'none',
        duration: 1500
      })
    }
  },
  /**
   * 添加购物车
  */
  addCart:function(e){
    var that = this;
    // console.log(this.data.attrData);
    var attrid = this.getSelectedAttr(this.data.attrData);
    if (attrid.selected_id.length < this.data.attrData.length){
      wx.showToast({
        title: '请选择属性',
        icon:'none',
        duration:2000
      })
      return;
    }else if(this.data.stock <= 0){
      wx.showToast({
        title: '库存不足',
        icon: 'none',
        duration: 2000
      })
      return;
    }else if(this.data.count > this.data.stock){
      wx.showToast({
        title: '数量超出库存',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    app.POST({
      url:app.config.url,
      data:{
        platform: app.config.platform,
        request: 'private.cart.add.cart.action',
        token: app.globalData.session_key,
        product_id: e.currentTarget.dataset.pid,
        attr_id: attrid.selected_id.join(','),
        is_express: 0,
        product_count: that.data.count
      },
      success:function(res){
        // console.log(res);
        if(res.data.code == 0){

          that.touchOnGoods();
          // that.getCartNum();
        }else if(res.data.code >= 999){
          app.getSessionKeyCallBack = function () {
            that.addCart(e);
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
  touchOnGoods: function (e) {
    this.finger = {}; var topPoint = {};var that = this;
    var pImg = wx.createSelectorQuery().select('#pImg').boundingClientRect().exec(function(rect){
      that.finger['x'] = rect[0].left + rect[0].width/2;
      that.finger['y'] = rect[0].top + rect[0].height/2;

      if (that.finger['y'] < that.busPos['y']) {
        topPoint['y'] = that.finger['y'] - 200;
      } else {
        topPoint['y'] = that.busPos['y'] - 200;
      }
      topPoint['x'] = Math.abs(that.finger['x'] - that.busPos['x']) / 2;

      if (that.finger['x'] > that.busPos['x']) {
        topPoint['x'] = (that.finger['x'] - that.busPos['x']) / 2 + that.busPos['x'];
      } else {//
        topPoint['x'] = (that.busPos['x'] - that.finger['x']) / 2 + that.finger['x'];
      }
      if (that.busPos['x'] < app.systemInfo.winWidth/2){
        that.linePos = app.bezier([that.busPos, topPoint, that.finger], 30, 'L');
      }else{
        that.linePos = app.bezier([that.busPos, topPoint, that.finger], 30, 'R');
      }
      
      that.startAnimation(e);

    })


  },
  startAnimation: function (e) {
    var index = 0, that = this,
      bezier_points = that.linePos['bezier_points'];

    this.setData({
      hide_good_box: false,
      bus_x: that.finger['x'],
      bus_y: that.finger['y']
    })
    var len = bezier_points.length;
    index = len;
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000;
    var timer = 't' + timestamp;
    timer = setInterval(function () {
      index--;
      that.setData({
        bus_x: bezier_points[index]['x'],
        bus_y: bezier_points[index]['y']
      })

      if (index < 1) {
        clearInterval(timer);
        // that.addGoodToCartFn(e);
        that.getCartNum();
        that.setData({
          hide_good_box: true
        })
      }
    }, 30);
  },
  /**
   * 立即购买
  */
  shop:function(e){
    var that = this;
    var attrid = this.getSelectedAttr(this.data.attrData);
    if (attrid.selected_id.length < this.data.attrData.length) {
      wx.showToast({
        title: '请选择属性',
        icon: 'none',
        duration: 2000
      })
      return;
    } else if (this.data.stock <= 0) {
      wx.showToast({
        title: '库存不足',
        icon: 'none',
        duration: 2000
      })
      return;
    } else if (this.data.count > this.data.stock) {
      wx.showToast({
        title: '数量超出库存',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    app.POST({
      url: app.config.url,
      data: {
        platform: app.config.platform,
        request: 'private.cart.add.cart.action',
        token: app.globalData.session_key,
        product_id: e.currentTarget.dataset.pid,
        attr_id: attrid.selected_id.join(','),
        is_express: 1,
        product_count: that.data.count
      },
      success: function (res) {
        // console.log(res);
        if (res.data.code == 0) {
          wx.navigateTo({
            url: '/pages/settlement/settlement?sid=' + res.data.data.id,
          })
        } else if(res.data.code >= 999){
          app.getSessionKeyCallBack = function () {
            that.shop(e);
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
  onShow:function(){
    if(app.globalData.session_key){
      this.getCartNum();
    }
    
    this.setData({
      showAttrModel: false,        //属性选择模态框控制
      stock: 0,                   //当前库存
      price: 0,                   //当前价格
      count: 1,                   //产品数量
      attrArr: [],
      attrData: []
    })
  },
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
    this.setData({
      showAttrModel: false,        //属性选择模态框控制
      stock: 0,                   //当前库存
      price: 0,                   //当前价格
      count: 1,                   //产品数量
      attrArr: [],
      attrData: []
    })
    this.getProducts();
  },
})
