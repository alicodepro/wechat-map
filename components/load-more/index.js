Component({
  /**
   * 组件的属性列表
   */
  properties: {
    status: {
    	//上拉的状态：more-loading前；loading-loading中；noMore-没有更多了
    	type: String,
    	value:'more'
    },
    showIcon: {
    	type: Boolean,
    	value: true
    },
    color: {
    	type: String,
    	value: '#777777'
    },
	contentdown: {
		type:String,
		value:'点击显示更多'
	},
	contentrefresh:{
		type:String,
		value:'正在加载...'
	},
	contentnomore:{
		type:String,
		value:'没有更多了'
	} 
 },

  /**
   * 组件的初始数据
   */
  data: {
    
  },

  ready: function () {
    
  },

  /**
   * 组件的方法列表
   */
  methods: {
    
  }
})