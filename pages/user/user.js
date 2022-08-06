// pages/user/user.js
const app = getApp()
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		user:null,
		// 吐个槽跳转数据
		extraData: {
			id: "82068",
			// 自定义参数，具体参考文档
			customData: {}
		}
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.setData({
			user:app.globalData.user
		})
	},

	// 更新用户信息
	getuserinfo(data) {
		let _this =this
		wx.BaaS.auth.loginWithWechat(data).then(user => {
			app.globalData.user =user
			_this.setData({
				user:user
			})
			wx.showToast({
				icon:"none",
				title:"成功"
			})
		}, err => {
			console.log(err)
			if(err.code ==603){
				wx.showToast({
					icon:"none",
					title:"用户未授权"
				})
			}
		})
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function() {

	}
})
