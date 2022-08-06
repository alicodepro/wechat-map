// pages/map/list.js
const LIMIT =5
const app = getApp()
import utils from '../../utils/util.js'
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		loadMoreStatus: "nomore",
		maps: [],
		meta: {},
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		// 获取当前用户创建地图
		this.getMaps(LIMIT, 0);
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function() {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {

	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function() {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function() {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function() {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function() {

	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function() {

	},
	// 加载更多
	loadMore(){
		// 判断是否需要加载数据
		let meta =this.data.meta
		if(meta.next){
			this.setData({
				loadMoreStatus:'loading'
			})
			this.getMaps(LIMIT,meta.offset+LIMIT)
		}
	},
	getMaps(limit, offset) {
		let _this = this
		// 获取当前用户创建地图
		let Map = new wx.BaaS.TableObject("maps")
		
		let query = new wx.BaaS.Query()

		query.compare('created_by', '=',app.globalData.user.id) // 过滤当前用户的数据
		
		Map.setQuery(query).select(['created_at', 'id', 'title']).limit(limit).offset(offset).orderBy('-created_at').find().then(res => {
			let meta = res.data.meta
      // 转换日期格式
      let objects = res.data.objects.map((item)=>{
        let datetime = new Date(item.created_at * 1000)
        item.created_at = utils.formatTime(datetime)
        return item
      })
			let loadMoreStatus = 'more'
			// 判断是否存在更多数据
			if (!meta.next) {
				loadMoreStatus = 'nomore'
			}
			_this.setData({
				loadMoreStatus: loadMoreStatus,
				meta: meta,
				maps: _this.data.maps.concat(objects)
			})
		}, err => {
			// err
			console.log(err)
		})
	},
	navToMap(e){
		let id =e.currentTarget.dataset.id
		wx.navigateTo({
			url:"./show?id="+id
		})
	}
})
