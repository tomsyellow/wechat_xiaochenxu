let staticData = require('../../data/staticData.js')
let utils = require('../../utils/utils.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    alternative:null,
    cities:[],
    showItems:null, //城市列表
    inputText:'', //输入框
    hotCities:[] //热门城市  没做
  },
  cancel(){
    this.setData({
      inputText:'',
      showItems:this.data.cities
    })
  },
  inputFilter(e){
    let alternative={}
    let cities=this.data.cities
    //用户输入的
    let value = e.detail.value.replace(/\s+/g, '')
    if(value.length){
      for(let i in cities){
        let items=cities[i]
        for(let j=0,len=items.length;j<len;j++){
          let item=items[j]
          if(item.name.indexOf(value)!==-1){
            if (utils.isEmptyObject(alternative[i])){
              alternative[i]=[]
            }
            alternative[i].push(item)

          }
        }
      }
      if(utils.isEmptyObject(alternative)){
        alternative=null
      }
      this.setData({
        alternative,
        showItems:alternative
      })
    }else{
      this.setData({
        alternative:null,
        showItems:cities
      })
    }
  },
  // 字母生成数据
  getSortedAreaObj(areas){
    console.log(areas)
    areas=areas.sort((a,b)=>{
      if(a.letter>b.letter){
        return 1
      }
      if(a.letter<b.letter){
        return -1
      }
      return 0
    })
    let obj = {}
    for (let i = 0, len = areas.length; i < len; i++) {
      let item = areas[i]
      delete item.districts
      let letter = item.letter
      if (!obj[letter]) {
        obj[letter] = []
      }
      obj[letter].push(item)
    }
    return obj 
    // 返回obj用来迭代
  },
  choose(e){
    let name=e.currentTarget.dataset.name
    let pages=getCurrentPages()
    let len=pages.length
    let indexPage=pages[len-2]
    if(name){
      indexPage.search(name,()=>{
        wx.navigateBack({})
      })
    }else{
        indexPage.init({},()=>{
          wx.navigateBack({
            
          })
        })
    }
  },
  getHotCities(callback) {
    wx.cloud.callFunction({
      name: 'getHotCities',
      data: {},
    })
      .then(res => {
        let data = res.result.data
        if (data) {
          this.setData({
            hotCities: data
          })
        }
      })
  },
  onLoad() {
    this.getHotCities()
    let cities = this.getSortedAreaObj(staticData.cities || [])
    this.setData({
      cities,
      showItems: cities,
    })
  },
})

 