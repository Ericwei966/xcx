import {
  yi_pay_wxapp
} from '../../../api/api';
Page({

    /**
     * 页面的初始数据
     */
    data: {
      succ : -1
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

      var trade = options.trade;
      var that = this;

      wx.login({
        success(login) {
          if (login.code) {
            yi_pay_wxapp({
              trade_no: trade,
              code: login.code
            }).then(res => {

              if (res.code == 0) {
                var pay = res.data;
                wx.showLoading({
                  title: '支付处理中',
                })
                wx.requestPayment({
                  timeStamp: pay.timeStamp,
                  nonceStr: pay.nonceStr,
                  package: pay.package,
                  signType: 'MD5',
                  paySign: pay.paySign,
                  success(res) {
                    wx.showToast({
                      title: "支付成功",
                      duration: 800
                    })

                    that.setData({
                      succ:1
                    })
                    setTimeout(function () {
                      wx.exitMiniProgram({
                        success: (r) => {
                          console.log('退出小程序')
                        }
                      })
                    }, 100)
                  },
                  complete(d) {
                    wx.hideLoading();
                  },
                  fail(f) {
                    wx.hideLoading();
                  }
                });
              } else {
                wx.showModal({
                  title: '提示',
                  content: res.msg,
                  complete: (res) => {
                    if (res.cancel) {
                      wx.exitMiniProgram({
                        success: (r) => {
                          console.log('退出小程序')
                        }
                      })
                    }
                    if (res.confirm) {
                      wx.exitMiniProgram({
                        success: (r) => {
                          console.log('退出小程序')
                        }
                      })
                    }
                  }
                })
              }
            });
          } else {
            console.log('系统错误' + res.errMsg)
          }
        }
      })



    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})