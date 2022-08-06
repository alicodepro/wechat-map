//index.js
//获取应用实例
const app = getApp()

Page({
	data: {
		longitude: '113.324520', //当前经度
		latitude: '23.099994', //当前纬度
		scale: 18,
		showSatellite: false,
		token:''
	},
	onLoad(options) {
		let _this = this
		_this.getLocation()
	},
	onReady() {
		this.mapCtx = wx.createMapContext('showMap')
	},
	// 输入地图Token
	inputToken(e){
		let value =e.detail.value
		this.setData({
			token:value
		})
	},
	// 前往导航
	nav() {
		let {token} =this.data
		if(token == ''){
			wx.showToast({
				icon:'none',
				title:'请输入地图口令'
			})
			return
		}
		wx.navigateTo({
			url:'../map/show?token='+token
		})
	},
	navigateToUser() {
		wx.navigateTo({
			url: '../user/user',
		})
	},

	addMap() {
		wx.navigateTo({
			url: '../map/edit',
		})
	},
	/**
	 * 切换图层
	 */
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
					latitude: res.latitude,
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
	}
})
