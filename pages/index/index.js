let utils =require('../../utils/utils.js')
let globalData=getApp().globalDate
const key = globalData.key
// 系统配置
let SYSTEMINFO = globalData.systeminfo

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isIPhoneX: globalData.isIPhoneX, //判断是否iphonex  如果是加样式
    message: '',   //更新
    cityDatas:{},    //城市
    hourlyDatas:[],  //时间
    weatherIconUrl: globalData.weatherIconUrl,   //天气数据
    detailsDic: {
      key: ['tmp', 'fl', 'hum', 'pcpn', 'wind_dir', 'wind_deg', 'wind_sc', 'wind_spd', 'vis', 'pres', 'cloud', 'dew'],
      val: {
        tmp: '温度(℃)',
        fl: '体感温度(℃)',
        hum: '相对湿度(%)',
        pcpn: '降水量(mm)',
        wind_dir: '风向',
        wind_deg: '风向角度(deg)',
        wind_sc: '风力(级)',
        wind_spd: '风速(mk/h)',
        vis: '能见度(km)',
        pres: '气压(mb)',
        cloud: '云量',
        // dew: '露点温度(℃)',
      },
    },
    lifestyles: {
      'comf': '舒适度指数',
      'cw': '洗车指数',
      'drsg': '穿衣指数',
      'flu': '感冒指数',
      'sport': '运动指数',
      'trav': '旅游指数',
      'uv': '紫外线指数',
      'air': '空气污染扩散条件指数',
      'ac': '空调开启指数',
      'ag': '过敏指数',
      'gl': '太阳镜指数',
      'mu': '化妆指数',
      'airc': '晾晒指数',
      'ptfc': '交通指数',
      'fsh': '钓鱼指数',
      'spi': '防晒指数',
    },
    searchText:"", //用来清空input
    hasPopped:false, //是否弹出框
    animationMain: {},
    animationOne: {},
    animationTwo: {},
    animationThree: {},
    located: true,// 定位图标
    searchCity:'',//查询的城市
    setting:{}, 
    showHeartbeat: true,
    bcgImgList: [
      {
        src: '/img/index1.jpg',
        topColor: '#508eee'
      },
      {
        src: '/img/index2.jpg',
        topColor: '#6fa2d2'
      },
      {
        src: '/img/index3.jpg',
        topColor: '#015fd3'
      },
      {
        src: '/img/index4.jpg',
        topColor: '#8a9eba'
      },
      {
        src: '/img/index5.jpg',
        topColor: '#141414'
      },
      {
        src: '/img/asphalt-blue-sky-clouds-490411.jpg',
        topColor: '#009ffe'
      },
      {
        src: '/img/aerial-climate-cold-296559.jpg',
        topColor: '#d6d1e6'
      },
      {
        src: '/img/beautiful-cold-dawn-547115.jpg',
        topColor: '#ffa5bc'
      }
    ],
    bcgImgIndex: 0,
    bcgImg: '',
    bcgImgAreaShow: false,
    bcgColor: 'darkcyan',
    // bcgColor: '#2d2225',
    // 粗暴直接：移除后再创建，达到初始化组件的作用
    showHeartbeat: true,
    // heartbeat 时禁止搜索，防止动画执行
    enableSearch: true,
    openSettingButtonShow: false,
    shareInfo: {},
  },
  success(data,location){
    // 城市搜索
    this.setData({
      openSettingButtonShow:false,
      searchCity:location,
    })
    wx.stopPullDownRefresh()
      //获取当前时间
    let now=new Date()
    console.log(now)
    data.updateTime=now.getTime()
    data.updateTimeFormat = utils.formatDate(now, "MM-dd hh:mm")
    wx.setStorage({
      key: 'cityDatas',
      data,
    })
    //城市时间
    this.setData({
      cityDatas:Date
    })
  },
  fail(res){
    //下拉刷新
    wx.stopPullDownRefresh()
    let errMsg=res.errMsg || ""
    //拒绝授权地理位置权限
    if(errMsg.indexOf('deny')!==-1||errMsg.indexOf('denied')!==-1){
      //小程序弹框
      wx.showToast({
        title: '需要开启地理位置权限',
        icon:'none',
        duration:2000,
        success:(res)=>{
          if (this.canUseOpenSettingApi()){
            let timer=setTimeout(()=>{
                clearTimeout(timer)
                //让用户重新授权
                wx.openSetting({})
            },2000)
          }else{
            this.setData({
              openSettingButtonShow: true,
            })
          }
        },
      })
    }else{
      wx.showToast({
        title: '网络不好,请稍后再试',
        icon:'none',
      })
    }
  
  },
  commitSearch(res) {
    let val = ((res.detail || {}).value || '').replace(/\s+/g, '')
    this.search(val)
  },
  dance() {
    this.setData({
      enableSearch: false,
    })
    let heartbeat = this.selectComponent('#heartbeat')
    heartbeat.dance(() => {
      this.setData({
        showHeartbeat: false,
        enableSearch: true,
      })
      this.setData({
        showHeartbeat: true,
      })
    })
  },
  clearInput() {
    this.setData({
      searchText: '',
    })
  },
  search(val,callback){
    if(val==='520'||val==='521'){
      this.clearInput()
      this.dance()
      return
    }
    //移动到一面顶端
    wx.pageScrollTo({
      scrollTop: 0,
      duration:300,
    })
    if(val){
      this.setData({
        located:false
      })
      this.getWeather(val)
      this.getHourly(val)
    }
    callback&&callback()
  },
  //ca
  init(params, callback) {
    this.setData({
      located: true,
    })
    wx.getLocation({
      success: (res) => {
        console.log(res)
        this.getWeather(`${res.latitude},${res.longitude}`)
        this.getHourly(`${res.latitude},${res.longitude}`)
        callback && callback()
      },
      fail: (res) => {
        this.fail(res)
      }
    })
  },
  //调用当地天气
  getWeather(location) {
    wx.request({
      url: `${globalData.requestUrl.weather}`,
      data: {
        location,
        key,
      },
      success: (res) => {
        if (res.statusCode === 200) {
          let data = res.data.HeWeather6[0]
          if (data.status === 'ok') {
            this.clearInput()
            this.success(data, location)
          } else {
            wx.showToast({
              title: '查询失败',
              icon: 'none',
            })
          }
        }
      },
      fail: () => {
        wx.showToast({
          title: '查询失败',
          icon: 'none',
        })
      },
    })
  },
  //获取时间
  getHourly(location) {
    wx.request({
      url: `${globalData.requestUrl.hourly}`,
      data: {
        location,
        key,
      },
      success: (res) => {
        if (res.statusCode === 200) {
          let data = res.data.HeWeather6[0]
          if (data.status === 'ok') {
            this.setData({
              hourlyDatas: data.hourly || []
            })
          }
        }
      },
      fail: () => {
        wx.showToast({
          title: '查询失败',
          icon: 'none',
        })
      },
    })
  },
  onPullDownRefresh(res){
    this.reloadPage()
  },
  getCityDatas(){
    //获取数据
    let cityDatas=wx.getStorage({
      key: 'cityDatas',
      success: (res)=> {
        this.setData({
          cityDatas:res.data,
        })
      },
    })
  },

  // 存在bug
  setBcgImg(index) {
    console.log(index)
    if (index !== undefined) {
      console.log(index)
      this.setData({
        bcgImgIndex: index,
        bcgImg: this.data.bcgImgList[index].src,
        bcgColor: this.data.bcgImgList[index].topColor,
      })
      this.setNavigationBarColor()
      return
    }
    wx.getStorage({
      key: 'bcgImgIndex',
      success: (res) => {
        console.log(res)
        let bcgImgIndex = res.data || 0
        this.setData({
          bcgImgIndex,
          bcgImg: this.data.bcgImgList[1].src,
          bcgColor: this.data.bcgImgList[1].topColor,
        })
        console.log(this.data.bcgImg)
        this.setNavigationBarColor()
      },
      fail: () => {
        this.setData({
          bcgImgIndex: 0,
          bcgImg: this.data.bcgImgList[0].src,
          bcgColor: this.data.bcgImgList[0].topColor,
        })
        this.setNavigationBarColor()
      },
    })
  },
  setNavigationBarColor(color){
    let bcgColor = color||this.data.bcgColor
    //微信动态设置背景颜色
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: this.data.bcgColor,
    })
  },
  // getBroadcast(callback){
  //   wx.cloud.callFunction({
  //     name:'getBroadcast',
  //     data:{
  //       //取得小时
  //       hour:new Date().getHours()
  //     }
  //   })
  //   .then(res=>{
  //     let data=res.result.data
  //     if(data){
  //       callback&&callback(data[0].message)
  //     }
  //   })
  // },
  reloadGetBroadcast(){
    this.getBroadcast((message)=>{
      this.setData({
        message
      })
    })
  },
  reloadWeather(){
    if(this.data.located){
      this.init({})
    }else{
      this.search(this.data.searchCity)
      this.setData({
        searchCity:""
      })
    }
  },

  onShow(){
    if (!utils.isEmptyObject(this.data.shareInfo)){
      return
    }
    wx.cloud.callFunction({
      name:'getShareInfo'
    })
    .then(res=>{
      let shareInfo=res.result
      if (shareInfo){
        if(!utils.isEmptyObject(shareInfo)){
          this.setData({
            shareInfo
          })
        }
      }
    })
  },
  onLoad(){
    this.reloadPage()
  },
  reloadPage(){
    this.setBcgImg()
    this.getCityDatas()
    this.reloadInitSetting()
    this.reloadWeather()
    this.reloadGetBroadcast()
  },
  //缺少兼容
  checkUpdate(setting) {
    if (!setting.forceUpdate || !wx.getUpdateManager) {
      return
    }
    let updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate((res) => {
      console.error(res)
    })
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已下载完成，是否重启应用？',
        success: function (res) {
          if (res.confirm) {
            updateManager.applyUpdate()
          }
        }
      })
    })
  },
  showBcgImgArea(){
    this.setData({
      bcgImgAreaShow:true
    })
  },
  //隐藏
  hideBcgImgArea(){
    this.setData({
      bcgImgAreaShow:false
    })
  },
  chooseBcg(e){
    let dataset=e.currentTarget.dataset
    let src =dataset.src
    let index=dataset.index
    this.setBcgImg(index)
    wx.setStorage({
      key: 'bcgImgIndex',
      data: 'index',
    })
  },

  toCitychoose(){
    wx.navigateBack({
      //从子页面退到父页面
      url:'/pages/citychoose/citychoose'
    })
  },
  initSetting(successFunc) {
    wx.getStorage({
      key: 'setting',
      success: (res) => {
        let setting = res.data || {}
        this.setData({
          setting,
        })
        successFunc && successFunc(setting)
      },
      fail: () => {
        this.setData({
          setting: {},
        })
      },
    })
  },
  reloadInitSetting(){
    this.initSetting((setting)=>{
      this.checkUpdate(setting)
    })
  },
  onShareAppMessage(res){
    let shareInfo=this.data.shareInfo
    return{
      title: shareInfo.title || 'Quiet Weather',
      path: shareInfo.path || '/pages/index/index',
      imageUrl: shareInfo.imageUrl,
    }
  },
  menuHide() {
    if (this.data.hasPopped) {
      this.takeback()
      this.setData({
        hasPopped: false,
      })
    }
  },
  menuMain() {
    if (!this.data.hasPopped) {
      this.popp()
      this.setData({
        hasPopped: true,
      })
    } else {
      this.takeback()
      this.setData({
        hasPopped: false,
      })
    }
  },
  //跳转
  menuToCitychoose() {
    this.menuMain()
    wx.navigateTo({
      url: '/pages/citychoose/citychoose',
    })
  },
  menuToSetting() {
    this.menuMain()
    wx.navigateTo({
      url: '/pages/setting/setting',
    })
  },
  menuToAbout() {
    this.menuMain()
    wx.navigateTo({
      url: '/pages/about/about',
    })
  },
  //选择按钮
  popp() {
    let animationMain = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-out'
    })
    let animationOne = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-out'
    })
    let animationTwo = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-out'
    })
    let animationThree = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-out'
    })
    let animationFour = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-out'
    })
    animationMain.rotateZ(180).step()
    animationOne.translate(0, -60).rotateZ(360).opacity(1).step()
    animationTwo.translate(-Math.sqrt(3600 - 400), -30).rotateZ(360).opacity(1).step()
    animationThree.translate(-Math.sqrt(3600 - 400), 30).rotateZ(360).opacity(1).step()
    animationFour.translate(0, 60).rotateZ(360).opacity(1).step()
    this.setData({
      animationMain: animationMain.export(),
      animationOne: animationOne.export(),
      animationTwo: animationTwo.export(),
      animationThree: animationThree.export(),
      animationFour: animationFour.export(),
    })
  },
  takeback() {
    let animationMain = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-out'
    })
    let animationOne = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-out'
    })
    let animationTwo = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-out'
    })
    let animationThree = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-out'
    })
    let animationFour = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-out'
    })
    animationMain.rotateZ(0).step();
    animationOne.translate(0, 0).rotateZ(0).opacity(0).step()
    animationTwo.translate(0, 0).rotateZ(0).opacity(0).step()
    animationThree.translate(0, 0).rotateZ(0).opacity(0).step()
    animationFour.translate(0, 0).rotateZ(0).opacity(0).step()
    this.setData({
      animationMain: animationMain.export(),
      animationOne: animationOne.export(),
      animationTwo: animationTwo.export(),
      animationThree: animationThree.export(),
      animationFour: animationFour.export(),
    })
  },
})