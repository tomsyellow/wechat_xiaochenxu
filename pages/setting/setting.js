let utils = require('../../utils/utils')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    setting:{},
    show:false,
    screenBrightness:'获取中',
    keepscreenon:false,
    SDKVersion:'',
    enableUpdate:true,
    indexPage:{},
  },
  switchChange(e){
    let dataset=e.currentTarget.dataset
    console.log(dataset)
    //碰到的bug1
    let switchaparam = dataset.switchparam
    console.log(switchaparam)
    let setting =this.data.setting
    console.log(setting)
    if (switchaparam ==='forceUpdate'){
      if(this.data.enableUpdate){
        setting[switchaparam]=(e.detail||{}).value
      }else{
        setting[switchaparam]=false
        wx.showToast({
          title: '版本较低,无法使用该功能',
          icon:'none',
          duration:2000
        })
      }
    }else if(switchaparam==='keepscreenon'){
      this.setKeepScreenOn(!this.data.keepscreenon)
      getApp().globalData.keepscreenon=!this.data.keepscreenon
    }else{
      setting[switchaparam]=!(e.detail||{}).value
    }
    this.setData({
      setting,
    })
    wx.setStorage({
      key: 'setting',
      data: setting,
      success:()=>{
        this.data.indexPage.reloadInitSetting()
      }
    })
  },
  hide(){
    this.setData({
      show:false
    })
  },
  updateInstruc(){
    this.setData({
      show:true
    })
  },
  onShow() {
    let pages = getCurrentPages()
    let len = pages.length
    let indexPage = pages[len - 2]
    // 不能初始化到 data 里面！！！！
    this.setData({
      keepscreenon: getApp().globalDate.keepscreenon,
      indexPage,
    })
    this.ifDisableUpdate()
    this.getScreenBrightness()
    wx.getStorage({
      key: 'setting',
      success: (res) => {
        let setting = res.data
        this.setData({
          setting,
        })
      },
      fail: (res) => {
        this.setData({
          setting: {},
        })
      },
    })
  },
  ifDisableUpdate() {
    let systeminfo = getApp().globalDate.systeminfo
    let SDKVersion = systeminfo.SDKVersion
    let version = utils.cmpVersion(SDKVersion, '1.9.90')
    if (version >= 0) {
      this.setData({
        SDKVersion,
        enableUpdate: true,
      })
    } else {
      this.setData({
        SDKVersion,
        enableUpdate: false,
      })
    }
  },
  getHCEState() {
    wx.showLoading({
      title: '检测中...',
    })
    wx.getHCEState({
      success: function (res) {
        wx.hideLoading()
        wx.showModal({
          title: '检测结果',
          content: '该设备支持NFC功能',
          showCancel: false,
          confirmText: '知道了',
          confirmColor: '#40a7e7',
        })
      },
      fail: function (res) {
        wx.hideLoading()
        wx.showModal({
          title: '检测结果',
          content: '该设备不支持NFC功能',
          showCancel: false,
          confirmText: '好的',
          confirmColor: '#40a7e7',
        })
      },
    })
  }, getScreenBrightness() {
    wx.getScreenBrightness({
      success: (res) => {
        this.setData({
          screenBrightness: Number(res.value * 100).toFixed(0),
        })
      },
      fail: (res) => {
        this.setData({
          screenBrightness: '获取失败',
        })
      },
    })
  },
  screenBrightnessChanging(e) {
    this.setScreenBrightness(e.detail.value)
  },
  setScreenBrightness(val) {
    wx.setScreenBrightness({
      value: val / 100,
      success: (res) => {
        this.setData({
          screenBrightness: val,
        })
      },
    })
  },
  setKeepScreenOn(b) {
    wx.setKeepScreenOn({
      keepScreenOn: b,
      success: () => {
        this.setData({
          keepscreenon: b,
        })
      },
    })
  },
  getsysteminfo() {
    wx.navigateTo({
      url: '/pages/info/info',
    })
  },
  removeStorage(e) {
    let that = this
    let datatype = e.currentTarget.dataset.type
    console.log(e)
    console.log(datatype)
    if (datatype === 'setting') {
      //bug
      wx.showModal({
        title: '提示',
        content: '确认要初始化设置',
        cancelText: '不了不了,这伤身体',
        confirmColor: '#40a7e7',
        success: (res) => {
          if (res.confirm) {
            wx.removeStorage({
              key: 'setting',
              success: function (res) {
                wx.showToast({
                  title: '设置已初始化',
                })
                that.setData({
                  setting: {},
                })
                that.data.indexPage.reloadInitSetting()
              },
            })
          }
        },
      })
    } else if (datatype === 'all') {
      wx.showModal({
        title: '提示',
        content: '确认要删除',
        cancelText: '不,我还有想想',
        confirmColor: '#40a7e7',
        success(res) {
          if (res.confirm) {
            wx.clearStorage({
              success: (res) => {
                wx.showToast({
                  title: '数据已清除',
                })
                that.setData({
                  setting: {},
                  pos: {},
                })
                that.data.indexPage.reloadInitSetting()
              },
            })
          }
        },
      })
    }
  },
})