// pages/map/edit.js
/**
 * 问题：
 * 1、撤销体验完善
 * 2、打点、画线时数据应该和渲染数据同时更新
 * 后期：修改逻辑，将当前正在编辑的对象，单独存放,完成后才将其放入进行保存的数组,好处很多
 */
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		longitude: '113.324520', //当前经度
		latitude: '23.099994', //当前纬度
		scale: 18,
		showSatellite: true,
		showSetting: false, //弹出设置面板
		brushWeight: 6, // 笔刷粗细
		sliderValue: 60, // 滑块值
		brushColor: "#f9a336", // 笔刷默认颜色
		hasDirection: true,
		colors: [
			"#ffffff", // 白色
			"#f9a336", // 黄色
			"#fc6729", // 橙红色
			"#1afa29", // 亮绿色
			"#d4237a", // 紫色
			"#2c2c2c", // 黑色
			"#9f74de"
		],
		editType: 'point',
		editHistory: [],
		editStatus: false, // 是否处于编辑状态
		centerPosition: {}, // 中心点位置
		points: [], // 需要保存的标注点
		markers: [], // 用于展示的marker
		polylines: [], // 用于展示的线路
		markerNumber: 0,
		lines: [], //  需要保存的线,
		showNote: false, //显示备注弹窗
		note: '', //备注内容,
		showMapControll:true, //是否展示地图控件，防止穿透
		finalPolyline:{}
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		let _this = this
		wx.getSystemInfo({
			success: function(res) {
				let W = res.windowWidth;
				let H = res.windowHeight;
				// 动态计算中心位置
				let center = {
					x: W * 0.5 - 25,
					y: H * 0.5 - 25
				}
				_this.setData({
					centerPosition: center
				})
			}
		})
		_this.getLocation()
	},
	onReady() {
		this.mapCtx = wx.createMapContext('editMap')
		this.tipEditType(this.data.editType)
	},
	tipEditType(type){
		switch (type){
			case 'point':
				wx.showToast({
					icon: 'none',
					title: '画点模式',
					duration: 1000
				})
				break;
			case 'line':
			wx.showToast({
				icon: 'none',
				title: '画线模式',
				duration: 1000
			})
			break
		}
	},
	/**
	 * 切换图层
	 */
	layers() {
		this.setData({
			showSatellite: !this.data.showSatellite
		})
	},
	// 切换编辑类型
	changeEditType(e) {
		let type = e.currentTarget.dataset.type
		// 正在编辑无法切花
		if(this.data.editStatus){
			wx.showToast({
				icon:'none',
				title:'正在编辑，无法切换编辑类型'
			})
			return
		}
		this.setData({
			editType: type
		})
		this.tipEditType(type)
	},
	openBrushSetting() {
		this.setData({
			showSetting: true,
			showMapControll:false
		})
	},
	mapRegionChange(){
		// 地图范围切换
	},
	// 撤销一步
	rebackOneStep() {
		let _this = this
		let {
			editStatus,
			editHistory,
			editType
		} = _this.data
		// 处于正在编辑
		if (editStatus) {
			// 删除当前编辑对象的最后一个点
			// 仅对线、面起作用
			if (editType == 'line') {
				let {
					polylines,
					lines
				} = _this.data
				// 当前编辑类型的最后一个对象的最后一个点
				let length = lines.length
				// 删除当前线路的最后一个点
				lines[length - 1].points.pop()
				// 删除渲染线路上的最后一个点
				polylines[length - 1].points.pop()
				// 更新渲染数组
				let polyline_points = "polylines[" + (length - 1) + "].points"
				_this.setData({
					[polyline_points]: polylines[length - 1].points
				})
			}
		} else {
			let editType = editHistory.pop()
			if (editType == 'point') {
				let {
					markers,
					points
				} = _this.data
				// 删除最后一个对象
				markers.pop();
				let point = points.pop();
				_this.setData({
					markers: markers
				})
			} else if (editType == 'line') {
				let {
					polylines,
					lines
				} = _this.data
				polylines.pop()
				lines.pop()
				_this.setData({
					polylines: polylines
				})
			}
		}
		wx.showToast({
			icon: "none",
			title: "撤销成功"
		})
	},
	clearOne() {
		let _this = this

		wx.showModal({
			title: "警告",
			content: "危险操作。请问确定清除所有内容吗？",
			cancelColor: "#f9a336",
			success: (res) => {
				if (res.confirm) {
					// 初始化
					_this.setData({
						brushWeight: 6,
						sliderValue: 60,
						brushColor: "#f9a336",
						editType: 'point',
						editStatus: false,
						points: [],
						markers: [],
						polylines: [],
						markerNumber: 0,
						lines: [],
						showNote: false,
						showMapControll:true,
						note: '',
					})
					wx.showToast({
						icon: "none",
						title: '清除成功'
					})
				}
			}
		})
	},
	confirmOne() {
		let _this = this
		let {
			editStatus,
			editType
		} = _this.data
		if(editType == 'line'){
			// 检查正在画的线确认时至少需要两个点
			let {lines} =_this.data
			if(lines[lines.length-1].points.length<2){
				wx.showToast({
					icon:'none',
					title:'路线至少需要两个点',
					duration:1000
				})
				return
			}
		}
		if (editStatus) {
			_this.setData({
				showNote: true,
				showMapControll:false
			})
		}
	},
	// 关闭画笔设置
	closeBrushSetting() {
		this.setData({
			showSetting: false,
			showMapControll:true
		})
	},
	// 改变笔刷粗细
	changeBrush(e) {
		let value = e.detail.value
		this.setData({
			sliderValue: value,
			brushWeight: value / 10
		})
	},
	// 改变笔刷是否存在方向
	changeBrushDirection(e) {
		let checked = e.detail
		this.setData({
			hasDirection: checked
		})
	},
	changeColor(e) {
		let index = e.currentTarget.dataset.index
		let color = this.data.colors[index]
		this.setData({
			brushColor: color
		})
	},

	// 添加点
	addPoint() {
		let _this = this
		let {
			editType,
			editStatus,
			brushColor,
			brushWeight,
			hasDirection
		} = _this.data

		if (editType == 'point') {
			// 画点
			// 获取坐标
			this.mapCtx.getCenterLocation({
				success: (res) => {
					let longitude = res.longitude
					let latitude = res.latitude

					// 向points 数组内压入点
					_this.setData({
						points: _this.data.points.concat([{
							longitude: longitude,
							latitude: latitude,
							color: brushColor,
							content: ''
						}]),
						editStatus: true, // 进入编辑状态
						showNote: true,
						showMapControll:false
					})
				}
			})
		} else if (editType == 'line') {
			// 画线
			this.mapCtx.getCenterLocation({
				success: (res) => {
					let longitude = res.longitude
					let latitude = res.latitude

					// 判读是否正在编辑
					if (editStatus) {
						// 向线路添加点
						let length = _this.data.lines.length

						let line_points = "lines[" + (length - 1) + "].points"
						let polyline_points = "polylines[" + (length - 1) + "].points"

						_this.setData({
							[line_points]: _this.data.lines[length - 1].points.concat([{
								latitude: latitude,
								longitude: longitude
							}]),
							[polyline_points]: _this.data.polylines[length - 1].points.concat([{
								latitude: latitude,
								longitude: longitude
							}])
						})
					} else {
						let polyline = {
							points: [{
								latitude: latitude,
								longitude: longitude,
							}],
							color: brushColor,
							width: brushWeight,
							arrowLine: hasDirection,
						}
						let line = {
							points: [{
								latitude: latitude,
								longitude: longitude,
							}],
							color: brushColor,
							width: brushWeight,
							arrowLine: hasDirection,
							content: ""
						}
						_this.setData({
							lines: _this.data.lines.concat([line]),
							polylines: _this.data.polylines.concat([polyline]),
							editStatus: true
						})
					}
				}
			})
		}
	},
	// 关闭备注事件，最终完成创建的地方
	closeNote() {
		let _this = this
		let {
			editStatus,
			editType,
			note,
			markerNumber,
			brushColor,
			editHistory
		} = _this.data
		// 必须处于编辑状态
		if (editStatus) {
			if (editType == 'point') {
				let length = _this.data.points.length
				let pointIndex = "points[" + (length - 1) + "]"
				let point = _this.data.points[length - 1]
				point.content = note
				// 添加显示的标注点
				let marker = {
					id: ++markerNumber,
					longitude: point.longitude,
					latitude: point.latitude,
					iconPath: '/static/icon/map/marker.png',
					width: 40,
					height: 40
				}
				// 判断是否需要设置callout
				if (note != "") {
					let callout = {
						content: note || '',
						fontSize: 12,
						bgColor: "#FFF",
						borderWidth: 1,
						borderRadius: 20,
						borderColor: brushColor,
						padding: 6,
						display: "ALWAYS",
						textAlign: "center"
					}
					marker.callout = callout
				}
				// 更新数据,初始化备注
				_this.setData({
					[pointIndex]: point,
					markers: _this.data.markers.concat(marker),
					note: "",
					markerNumber: markerNumber,
					editStatus: false,
					showMapControll:true
				})
			} else if (editType == 'line') {
				// 保存数据
				let length = _this.data.lines.length
				let contentIndex = "lines[" + (length - 1) + "].content"

				_this.setData({
					[contentIndex]: note,
					note:'',
					editStatus: false,
					showMapControll:true
				})

			}
			// 保存编辑顺序
			editHistory.push(editType)
		}
	},
	// 记录备注内容
	changeNote(e) {
		this.setData({
			note: e.detail
		})
	},
	saveMap() {
		let {
			lines,
			points
		} = this.data
		let mapContent = {}
		if (lines.length == 0 && points == 0) {
			wx.showToast({
				icon: "none",
				title: "没有编辑地图"
			})
			return
		}
		mapContent.points = points
		mapContent.lines = lines
		wx.navigateTo({
			url: './save?mapContent=' + JSON.stringify(mapContent)
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
	}
})
