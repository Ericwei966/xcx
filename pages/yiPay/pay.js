// pages/payCenter/pay.

import {
  getYiShop,
  YI_PAY
} from '../../api/api';
var qrCode;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    payData: {
      yi_code: -1,
      msg: '请扫付款码付款'

    },
    warm_img: 'https://hsenkj.oss-cn-shenzhen.aliyuncs.com/Pay_Image/warm.png',
    mark_txt: "",
    mark_btn: "付款备注",
    pay_moeny: "0.00",

    show_dialog_input: false,
    input_money: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(e) {
    let scanUrl = decodeURIComponent(e.q);

    if (scanUrl != "undefined" && scanUrl != "") {

      let result = scanUrl;

      result = result.split('/');

      let qrCodeMsg = result[result.length - 1];
      qrCode = qrCodeMsg;

      this.getTradeInfo(qrCodeMsg);
    }
  },

  /**
   * 启动扫码
   */
  scan() {
    let that = this;
    wx.scanCode({
      scanType: ['qrCode'],
      success(res) {
        let result = res.result;

        result = result.split('/');

        let qrCodeMsg = result[result.length - 1];
        qrCode = qrCodeMsg;

        that.getTradeInfo(qrCodeMsg);

      },
      fail(res) {
        wx.showModal({
          content: '请扫小票二维码！'
        })

      }
    })

  },
  /**
   * 获取二维码信息
   */
  getTradeInfo(qrCode) {

    if (qrCode != "undefined" && qrCode != "" && typeof (qrCode) != 'undefined') {

      wx.showLoading({
        title: '处理中',
      })

      let postParm = {

        pid: qrCode

      };

      getYiShop(postParm).then((res) => {

        wx.hideLoading();

        if (res.code == 1) {

          if (res.active != '1') {
            wx.showToast({
              title: '商户状态异常，请联系商户处理！',
              icon: "none",
            })

          } else {
            this.setData({
              payData: res,
              warm_img: 'https://hsenkj.oss-cn-shenzhen.aliyuncs.com/Pay_Image/warm.png',
              show_focus: true
            })
          }
        } else {
          wx.showToast({
            title: res.msg,
            icon: "none",
          })

        }


      });


    } else {
      this.setData({
        payData: {
          'code': -1,
          'msg': '请扫二维码'
        },
        warm_img: 'https://hsenkj.oss-cn-shenzhen.aliyuncs.com/Pay_Image/warm.png'
      })

    }

  },


  /**
   * 启动付款
   */
  payBill() {
    var that = this,
      payMoney;
    //判断静态码付款参数
    if (this.data.payData.yi_code == 1) {
      payMoney = this.data.pay_moeny;
      payMoney = parseFloat(payMoney).toFixed(2);
      if (payMoney <= 0) {

        wx.showToast({
          title: '金额输入不正确',
          icon: "none",
        })

        return false;
      }
      if (payMoney > 1000000) {
        wx.showToast({
          title: '金额不能超100万',
          icon: "none",
        })

        return false;
      }


    }





    wx.login({
      success(res) {
        if (res.code) {
          //发起网络请求
          that.setData({
            isLoginLoading: true,
          });
          let postParm = {
            code: res.code,
            qrCode: qrCode,
            pay_money: payMoney,
            pay_mark: that.data.mark_txt
          };
          YI_PAY(postParm).then((result) => {

            if(result.code == 1){
              let prePay = result.data;
              wx.requestPayment({
                timeStamp: prePay.timeStamp,
                nonceStr: prePay.nonceStr,
                package: prePay.package,
                signType: prePay.signType,
                paySign: prePay.paySign,
                success(res) {
                  that.data.pay_moeny = "0.00";
                  that.data.mark_txt = "";
                  that.setData({
                    mark_btn: "付款备注",
                    mark_txt: "",
                    input_money: ""
                  });
                  wx.showToast({
                    title: "支付成功",
                    duration: 800
                  })
                  setTimeout(() => {
                    wx.navigateTo({
                      url: '/pages/yiPay/success/ok?order_id=' + prePay.trade,
                    })
                  }, 800);
                },
                complete(d) {
                  that.setData({
                    isLoginLoading: false,
                  });
                },
                fail(f) {
                  that.setData({
                    isLoginLoading: false,
                  });
                }
              });

            }else{
              wx.showToast({
                title: result.msg,
                icon: "none",
              })
              that.setData({
                isLoginLoading: false,
              });
            }
          });
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })

  },


  moneyInput(n) {
    // this.data.pay_moeny = e.detail.value;

    // this.setData({
    //   input_money: e.detail.value
    // })

    var e = n.detail.value;


    // 第一位输入0，第二位输入1，直接展示1
    if (e[0] === '0' && e[1] && e[1] !== '.') {
      this.setData({
        input_money: e.slice(1, e.length)
      });
      return;
    }
    // 小数点补齐0.
    if (e === '.') {
      this.setData({
        input_money: '0.'
      });
      return;
    }
    // 不允许多个小数点
    const onePoint = e && e[e.length - 1] === '.' && e.length - 1 !== e.indexOf('.');
    // 限制小数点后2位
    const precision2 = e && e.split('.').length > 1 && e.split('.')[1].length === 3;
    if (onePoint || precision2) {
      this.setData({
        input_money: e.slice(0, e.length - 1)
      });
      return;
    }
    this.data.pay_moeny = e;
    this.setData({
      input_money: e
    })
  },


  onCloseNumKey() {
    // 失去焦点时如果末尾是小数点，自动去掉
    if (this.data.input_money[this.data.input_money.length - 1] === '.') {
      this.setData({
        input_money: this.data.input_money.slice(0, this.data.input_money.length - 1)
      });
    }
    this.setData({
      visible: false
    });
  },



  //备注弹出

  handleOpen() {

    this.setData({
      show_dialog_input: true,

    });
  },

  markInput(e) {

    this.setData({
      mark_txt: e.detail
    })

  },

  //确定输入框
  onConfirm_dialog_input(e) {
    this.setData({
      mark_btn: this.data.mark_txt ? " 修改" : "付款备注"
    });

  },


  //关闭输入框
  onClose_dialog_input(e) {
    this.setData({
      show_dialog_input: false
    });

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