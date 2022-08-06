// pages/map/show.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		longitude: '113.324520', //当前经度
		latitude: '23.099994', //当前纬度
		scale: 18,
		includePoints:[],
		showSatellite: true,
		map: null,
		markers: [], // 展示点
		polylines: [], // 展示线
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		let _this = this
		wx.showLoading({
			title: "加载中"
		})
    let mapTable = new wx.BaaS.TableObject("maps")
    // 获取ID
		let recordID = options.id || options.token
    // 或查询
    let query1 = new wx.BaaS.Query()
    query1.compare('id','=',recordID)

    let query2 = new wx.BaaS.Query()
    query2.compare('token', '=', recordID)

    let orQuery = wx.BaaS.Query.or(query1, query2)

		// 获取数据
    mapTable.setQuery(orQuery).limit(1).find().then(res => {
			// success
			wx.hideLoading()
			_this.parseMap(res.data.objects[0]);
		}, err => {
			wx.hideLoading()
			switch (err.code) {
				case 404:
					wx.showModal({
						title: "提示",
						content: "地图已被删除",
						showCancel: false
					})
					break;
			}
		})
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function() {
		this.mapCtx = wx.createMapContext('showMap')
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {

	},

	// 将数据解析成地图能够展示的格式
	parseMap(map) {
		let _this = this
		// 解析点
		let markers = []
		let includePoints=[]
		
		for(var i=0;i<map.content.lines.length;i++){
			includePoints=includePoints.concat(map.content.lines[i].points)
		}
		let includeMarkerPoints =false // 是否包含标记的点
		if(includeMarkerPoints.length<1){
			includeMarkerPoints=true
		}
		for (var i = 0; i < map.content.points.length; i++) {
			let point = map.content.points[i]
			if(includeMarkerPoints){
				includePoints.push(point)
			}
			let marker = {
				id: i + 1,
				longitude: point.longitude,
				latitude: point.latitude,
				iconPath: '/static/icon/map/marker.png',
				width: 40,
				height: 40
			}
			// 判断是否需要设置callout
			if (point.content != "") {
				let callout = {
					content: point.content || '',
					fontSize: 12,
					bgColor: "#FFF",
					borderWidth: 1,
					borderRadius: 20,
					borderColor: point.color,
					padding: 6,
					display: "ALWAYS",
					textAlign: "center"
				}
				marker.callout = callout
			}
			markers.push(marker)
		}
		// 设置数据
		_this.mapCtx.includePoints({
			points:includePoints,
			padding:[40,40,40,40]
		})
		_this.setData({
			markers: markers,
			polylines: map.content.lines,
			map: map,
			includePoints:includePoints
		})
	},
	/**
	 * 分享地图
	 */
	onShareAppMessage: function(res) {
		let _this = this
		return {
			title: '精准地图，为您指路！',
			path: '/pages/map/show?id=' + _this.data.map._id,
			success: function(res) {}
		}
	},
	createMap() {
		wx.navigateTo({
			url: "./edit"
		})
	},
	// 复制口令
	copyToken() {
		let _this = this
		let token = "微信搜索【精准地图】小程序输入口令【" + _this.data.map.token + "】为您指路"
		wx.setClipboardData({
			data: token,
			success: () => {
				wx.hideToast()
				wx.showToast({
					icon: "none",
					title: '口令复制成功，可以把其粘贴至其他软件的地址备注中',
          duration:5000
				})
			}
		})
	},
	layers() {
		this.setData({
			showSatellite: !this.data.showSatellite
		})
	},
	// 获取定位
	getLocation() {
		let _this = this
		// 获取定位
		wx.getLocation({
			type: 'gcj02',
			altitude: true, //高精度定位
			success: function(res) {
				_this.setData({
					longitude: res.longitude,
					latitude: res.latitude,
					scale: 19
				})
				_this.mapCtx.moveToLocation({
					longitude: res.longitude,
					latitude: res.latitude
				})
			},
			fail: function() {
				wx.getSetting({
					success: function(res) {
						if (!res.authSetting['scope.userLocation']) {
							wx.showModal({
								title: '用户未授权',
								content: '如需正常使用小程序功能，请按确定并且在【设置】页面打开【使用地理位置】。',
								showCancel: false,
								success: function(res) {
									if (res.confirm) {
										wx.openSetting({
											success: function(res) {
												if (res.authSetting['scope.userLocation']) {
													_this.getLocation()
												}
											}
										})
									}
								}
							})
						}
					}
				})
			},
		})
	},
	// 包含大部分控制点
	fullScreen(){
		this.mapCtx.includePoints({
			points:this.data.includePoints,
			padding:[40,40,40,40]
		})
	}
})
