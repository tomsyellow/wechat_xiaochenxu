//导入模块  封装了函数
let utils=require('../../utils/utils.js')

Component({
  data:{
    windowWidth:0,
    windowHeight:0,
    arr: [],
    //动画最长持续时间
    duration:5000,
    animations:[],
    lefts:[],
    tops:[],
    widths:[],
  },
  properties:{
    show:{
      type:Boolean,
      value:true
    },
  },
  ready(){
    let systeminfo = getApp().globalDate.systeminfo
    if (utils.isEmptyObject(systeminfo)){
      wx.getSystemInfo({
        success:(res)=> {
          //setData修改页面 并且修改 上面data的值
          this.setData({
            windowHeight:res.windowHeight||res.screenWidth,
            windowHeight:res.windowHeight||res.screenHeight
          })
        },
      })
    }else{
      this.setData({
        windowWidth:systeminfo.windowWidth||systeminfo.screenWidth,
        windowHeight:systeminfo.windowHeight || systeminfo.screenHeight
      })
    }
    let num=parseInt(Math.random()*100)+10
    let arr=Array.apply(null,{length:num}).map(function(value,index){
        return index+1;
    })
    this.setData({
      arr,
    })
  },
  methods:{
    //自定义组件  this指向component  this.data可以访问data
    dance(callback){
      let windowWidth=this.data.windowWidth
      let windowHigth=this.data.windowHeight
      let animations=[]
      let lefts=[]
      let tops=[]
      let widths=[]
      let obj={}
      for (let i=0;i<this.data.arr.length;i++){
        lefts.push(Math.random()*windowWidth)
        tops.push(-140)
        widths.push(Math.random()*50+40)
        //创建一个动画实例
        let animation=wx.createAnimation({
          //duration动画的持续时间  默认400   delay动画延迟多长时间
          duration:Math.random()*(duration-1000)+1000
        })
        animation.top(windowHeight).left(Math.random() * windowWidth).rotate(Math.random() * 960).step()
        animations.push(animation.export())
      }
      this.setData({
        lefts,
        tops,
        widths
      })
      let timer=setTimeout(()=>{
        this.setData({
          animations
        })
        clearTimeout(timer)
      },200)
      let end =setTimeout(()=>{
        callback&&callback()
        clearTimeout(end)
      },duration)
    }
  }
})