// pages/map/save.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		title: '',
		description: '',
		content: []
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.setData({
			content: JSON.parse(options.mapContent)
		})
	},
	// 输入描述
	inputDesc(e) {
		this.setData({
			description: e.detail
		})
	},
	// 输入标题
	inputTitle(e) {
		this.setData({
			title: e.detail
		})
	},
	// 提交数据
	saveMap() {
		let _this =this
		let {
			title,
			description,
			content
		} = this.data

		if (title == '') {
			wx.showToast({
				icon: "none",
				title: "标题是必填项"
			})
			return
		}
		if (title.length > 20 || description.length > 200) {
			wx.showToast({
				icon: "none",
				title: "标题或描述长度不符合要求"
			})
			return
		}
		// 提交数据
		let mapsTableObject = new wx.BaaS.TableObject('maps')

		let mapRecord = mapsTableObject.create()

		let data = {
			title: title,
			content: content,
			description: description
		}
		wx.showLoading({
			title:"保存中"
		})
		mapRecord.set(data).save().then(res => {
			// success
			let id =res.data.id
			wx.hideLoading()
			wx.showToast({
				icon:"success",
				title:"保存成功",
				duration:1500
			})
			setTimeout(function() {
				wx.redirectTo({
					url:"./show?id="+id
				})
			}, 1500);
		}, err => {
			console.log(err)
			// HError 对象
			// err 为 HError 类实例
			wx.hideLoading()
			if (err.code === 400) {
				console.log('系统错误')
			}else if (err.code === 403) {
				_this.showToast("无权限编辑")
			}else if(err.code === 404){
				_this.showToast("系统错误")
			}
		})
	},
	showToast(message){
		wx.showToast({
			icon:"none",
			title:message
		})
	}
})
