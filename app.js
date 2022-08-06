//app.js
App({
	onLaunch: function() {
		let _this =this
		wx.BaaS = requirePlugin('sdkPlugin')
		//让插件帮助完成登录、支付等功能
		wx.BaaS.wxExtend(wx.login,
			wx.getUserInfo,
			wx.requestPayment)

		// 初始化SDK
		wx.BaaS.init('e16a0176f7df51feb61e')

		// 登陆
		wx.BaaS.auth.loginWithWechat().then(user => {
			// 登录成功
			_this.globalData.user =user
		}, err => {
			// 登录失败
			console.log(err)
		})
	},
	onShow(options){
		wx.BaaS.reportTemplateMsgAnalytics(options)
	},
	globalData: {
		user:null
	}
})
