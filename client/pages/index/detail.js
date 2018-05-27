// pages/mylist/detail.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
Page({
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
  /**
   * 页面的初始数据
   */
  data: {
    list:[],
    classify_id:'',
    list_text:'',
    list_id:'',
    model_title:'',
    button_text:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setData({
      classify_id: options.classify_id,
      classify_name: options.classify_name,
      create_time: options.create_time
    });
    this.getListData();
    
  },
  getListData:function(){
    var that = this;
    qcloud.request({
      login: true,
      url: config.service.host + '/weapp/getListByClassId',
      data: { classify_id: that.data.classify_id },
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
     * 监听checkbox事件
     */
  listenCheckboxChange: function (e) {
    var list = this.data.list;
    var checkArr = e.detail.value;
    for (var i = 0; i < list.length; i++) {
      if (checkArr.indexOf(list[i].list_id+"") != -1) {
        list[i].complete_flag = 1;
      } else {
        list[i].complete_flag = 0;
      }
    }
    this.setData({
      list: list
    })  
    qcloud.request({
      login: true,
      url: config.service.host + '/weapp/batchUpdateComFlag',
      data: checkArr,
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: header ? header : "application/json", // 设置请求的 header
      success: function (res) {
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
    this.getListData();

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  showDialogForUpdate(e){
    if (!e.target.dataset.idx || !e.target.dataset.text){
      return;
    }
    this.setData({
      list_id:e.target.dataset.idx,
      list_text: e.target.dataset.text,
      model_title: '修改项目',
      button_text: '修改'
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
    this.setData({
      showModal: false
    });
  },
  /**
   * 对话框取消按钮点击事件
   */
  onCancel: function () {
    this.hideModal();
  },
  /**
   * 对话框确认按钮点击事件
   */
  onConfirm: function () {
    var that = this;
    qcloud.request({
      login: true,
      url: config.service.host + '/weapp/createOrUpdateList',
      data: { list_id: that.data.list_id, list_text: that.data.list_text, classify_id: that.data.classify_id},
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: header ? header : "application/json", // 设置请求的 header
      success: function (res) {
        that.getListData();
      },
      fail: function () {
        // fail
      },
      complete: function () {
        // complete
      }
    })
    this.hideModal();

  },
  inputChange: function (e) {
    var value = e.detail.value;
    this.setData({
      list_text: value
    });
  }, 
  addlist:function(){
    this.setData({
      list_id: '',
      list_text: '',
      model_title: '增加项目',
      button_text: '增加'
    })

    this.showDialogBtn();
  }
})