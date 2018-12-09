App({

  /**
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch () {
    //云函数
    //初始化
    wx.cloud.init({
      env:'envid',
      traceUser:true,
    })
    //获取系统信息
    wx.getSystemInfo({
      success: (res)=> {
        this.globalDate.systeminfo=res
        this.globalDate.isIPoneX = /iphonex/gi.test(res.model.replace(/\s+/, ''))
      },
    })
  },
  globalDate:{
    //是否保持常亮,离开小程序失效
    keepscreenon:false,
    systeminfo:{},
    isIPoneX:false,
    key:"10c3ecaa0ffa4f9782723ed0f61560fa",
    weatherIconUrl: 'https://cdn.heweather.com/cond_icon/',
    requestUrl: {
      weather: 'https://free-api.heweather.com/s6/weather',
      hourly: 'https://free-api.heweather.com/s6/weather/hourly',
    },
  }

})
