// components/header/header.js
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      value: "标题",
    },
    status_height:{
      type:String,
      value:app.systemInfo.statusHeight
    },
    nav_height:{
      type:String,
      value: app.systemInfo.navHeight
    },
    background_color:{
      type:String,
      value:"#FF9300"
    },
    show_back:{
      type:Boolean,
      value:false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    _navgatorBack:function(){
      wx.navigateBack()
    },
    _navgatorUser:function(){
      this.triggerEvent('navgatorUser') 
    }
  }
})
