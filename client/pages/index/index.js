// pages/mylist.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[],
    classify_name:'',
    classify_id:'',
    model_title: '',
    button_text: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          that.getClassifyData();
          that.setData({
            hasPower:true
          })
        } else {
          wx.redirectTo({
            url: '/pages/empower/empower',
          })
        }
      },
      fail: function (res) {
        util.showModel('失败', res);
      }
    });
  },
  getClassifyData:function(){
    var that = this;
    qcloud.request({
      login:true,
      url: config.service.host + '/weapp/getAllClassify',
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: header ? header : "application/json", // 设置请求的 header
      success: function (res) {
        console.log(res);
        that.setData({
          list: res.data.data
        });
      },
      fail: function () {
        // fail
      },
      complete: function () {
        // complete
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getClassifyData();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '备忘清单笔记',
      path: '/pages/index/index',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  createClassify() {
    this.setData({
      classify_name: '',
      classify_id: '',
      model_title:"新建清单",
      button_text:"新建"
    })

    this.showDialogBtn();
  },
  updateClassify(e) {
    this.setData({
      classify_name: e.target.dataset.classify_name,
      classify_id: e.target.dataset.classify_id,
      model_title: "修改清单",
      button_text: "修改"
    })

    this.showDialogBtn();
  },
  /**
    * 弹窗
    */
  showDialogBtn: function () {
    this.setData({
      showModal: true
    })
  },
  /**
   * 弹出框蒙层截断touchmove事件
   */
  preventTouchMove: function () {
  },
  /**
   * 隐藏模态对话框
   */
  hideModal: function () {
    this.clearClassData();
    this.setData({
      showModal: false,
      showTips: false
    });
  },
  
  /**
   * 对话框取消按钮点击事件
   */
  onCancel: function () {
    this.clearClassData();
    this.hideModal();
  },
  /**
   * 对话框确认按钮点击事件
   */
  onConfirm: function () {
    var that = this;
    var data = { classify_name: that.data.classify_name, classify_id: that.data.classify_id };
    that.updateDbClassify(data);
    that.hideModal();

  },
  updateDbClassify: function (data) {
    var that = this;
    qcloud.request({
      login: true,
      url: config.service.host + '/weapp/createOrUpdateClassify',
      data: data,
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: header ? header : "application/json", // 设置请求的 header
      success: function (res) {
        that.getClassifyData();
        that.clearClassData();
      },
      fail: function () {
        // fail
      },
      complete: function () {
        // complete
      }
    })
  },
  inputChange: function (e) {
    var value = e.detail.value;
    this.setData({
      classify_name: value
    });
  },
  showTips:function (e) {
    this.setData({
      showTips: true,
      classify_id: e.currentTarget.dataset.idx,
      classify_name: e.currentTarget.dataset.name,
      istop: e.currentTarget.dataset.istop
    })
  },

//   bindTouchStart: function (e) {
//     this.startTime = e.timeStamp;
//   },
// bindTouchEnd: function (e) {
//     this.endTime = e.timeStamp;
//   },
  navigatToDetail: function (e) {
      wx.navigateTo({
        url: '/pages/index/detail?classify_id=' + e.currentTarget.dataset.idx + '&classify_name=' + e.currentTarget.dataset.name + '&create_time=' + e.currentTarget.dataset.time
      })
  },
  hideTips: function () {
    this.setData({
      showTips: false
    })
  },
  operator:function(e) {
    var that = this;
    var op = e.target.dataset.op;
    if (op == 'top'){
      that.updateDbClassify({
        classify_id:that.data.classify_id,
        top_flag:'1'
        });
    } else if (op == 'untop') {
      that.updateDbClassify({
        classify_id: that.data.classify_id,
        top_flag: '0'
      });
    } else if (op == 'done'){
      that.updateDbClassify({
        classify_id: that.data.classify_id,
        complete_flag: '1'
      });
    } else if (op == 'upate') {
      that.setData({
        model_title: "修改清单名称",
        button_text: "修改"
      })

      that.showDialogBtn();
      // that.updateDbClassify({
      //   classify_id: that.data.classify_id,
      //   classify_name: that.data.classify_name
      // });
    } else if (op == 'del') {
      that.deleteDbClassify(that.data.classify_id);
    }
    this.setData({
      showTips: false
    })
  },
  clearClassData:function(){
    this.setData({
      classify_id:'',
      classify_name: ''
    })
  },
  deleteDbClassify: function (classify_id){
    var that = this;
    qcloud.request({
      login: true,
      url: config.service.host + '/weapp/delClassify',
      data: { classify_id: classify_id},
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: header ? header : "application/json", // 设置请求的 header
      success: function (res) {
        that.getClassifyData();
        that.clearClassData();
      },
      fail: function () {
        // fail
      },
      complete: function () {
        // complete
      }
    })
  },

})