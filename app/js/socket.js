/**
 * 环信 Web IM SDK 封装
 */
(function(window){
  'use strict';

  var client = null
  var name = ''
  var pass = ''
  var connectCallback = null
  var receiveCallback = null
  var errorCallback = null
  var closeCallback = null
  var hasShutdown = false
  var logger = null

  function connect(username, password, onConnected, onReceived, onError, onClosed){
    close(false)

    if (username){
      name = username
    }
    if (password){
      pass = password
    }
    if (onConnected){
      connectCallback = onConnected
    }
    if (onReceived){
      receiveCallback = onReceived
    }
    if (onError){
      errorCallback = onError
    }
    if (onClosed){
      closeCallback = onClosed
    }

    client = new WebIM.connection({
      https: WebIM.config.https,
      url: WebIM.config.xmppURL,
      isAutoLogin: WebIM.config.isAutoLogin,
      isMultiLoginSessions: WebIM.config.isMultiLoginSessions,
      heartBeatWait: WebIM.config.heartBeatWait,
      autoReconnectNumMax: WebIM.config.autoReconnectNumMax,
      autoReconnectInterval: WebIM.config.autoReconnectInterval,
      apiUrl: WebIM.config.apiURL,
      isHttpDNS: WebIM.config.isHttpDNS,
      isWindowSDK: WebIM.config.isWindowSDK
    })

    client.listen({
      onOpened: function (message) {  //连接成功回调
        // 如果isAutoLogin设置为false，那么必须手动设置上线，否则无法收消息
        // 手动上线指的是调用conn.setPresence()
        trace('The socket has opened')
        if (typeof connectCallback === 'function'){
          connectCallback()
        }
      },
      onClosed: function (message) {
        trace('The socket closed')
        if (typeof closeCallback === 'function'){
          closeCallback()
        }
      },
      onCmdMessage: function (message) {  //收到命令消息
        console.log('The socket received message:', message)
        if (WebIM.config.isWindowSDK) {
          message = eval('(' + message + ')')
        }
        if (message.delay) {
          trace('Ignore the history message: ' + message.action + ' from ' + message.delay)
          return
        }
        onReceivePackData(message)
      },
      onOnline: function () {
        trace('本机网络连接成功')
      },
      onOffline: function () {
        trace('本机网络掉线')
      },
      onError: function (message) { //失败回调
        try {
          trace('The socket had an error:' + message.msg ? message.msg : message.data.data)
        } catch (error) {
          trace('The socket had an error')
        }

        if (typeof errorCallback === 'function') {
          errorCallback('Socket Error')
        }
      }
    })

    login(username, password)
  }

  function reconnect(){
    if (!hasShutdown){
      connect()
    }
  }

  function close(shutdown) {
    if (shutdown === undefined) shutdown = true;

    hasShutdown = shutdown
    if (client){
      client.close()
      client = null
    }
  }

  /**
   * 发送消息到聊天室
   */
  function send(roomId, cmd, arg){
    trace('[Send] tag: ' + cmd + ' value: ' + (arg ? JSON.stringify(arg) : ''))
    if (client){
      var id = client.getUniqueId()  //生成本地消息id
      var msg = new WebIM.message('cmd', id) //创建命令消息

      msg.set({
        to: roomId, //接收消息对象
        action: cmd,  //用户自定义，cmd消息必填
        ext: { data: arg },  //用户自扩展的消息内容
        success: function (id, serverMsgId) {  //消息发送成功回调
          trace('The commond send success: ' + cmd)
        }
      })

      msg.body.roomType = true // 聊天室
      msg.setGroup('groupchat')

      client.send(msg.body)
    } else {
      trace('socket 未连接')
    }
  }

  /**
   * 单聊
   */
  function sendToUser(user, cmd, arg){
    trace('[Send] to: ' + user + ' tag: ' + cmd + ' value: ' + (arg ? JSON.stringify(arg) : ''))
    if (client){
      var id = client.getUniqueId()  //生成本地消息id
      var msg = new WebIM.message('cmd', id) //创建命令消息

      msg.set({
        to: user, //接收消息对象
        action: cmd,  //用户自定义，cmd消息必填
        ext: { data: arg },  //用户自扩展的消息内容
        success: function (id, serverMsgId) {  //消息发送成功回调
          trace('The commond send success: ' + cmd)
        }
      })

      msg.body.chatType = 'singleChat'

      client.send(msg.body)
    } else {
      trace('socket 未连接')
    }
  }

  function onReceivePackData(data){
    var tag = data.action
    var value = data.ext.data
    trace('[Received] tag: ' + tag + ' value: ' + (value ? JSON.stringify(value) : ''))

    if (typeof receiveCallback === 'function'){
      try {
        receiveCallback(tag, value)
      } catch (err) {
        trace(err, 'error')
      }
    }
  }

  function setDebuger(value){
    logger = value
  }

  function trace (log, level) {
    if (level == undefined) level = 'log';

    if (typeof logger === 'function') {
      logger(log)
    } else {
      if (typeof DEBUG_ENV === 'string') {
        if (DEBUG_ENV !== 'production') {
          console[level](log)
        }
      } else {
        console[level](log)
      }
    }
  }

  function login(username, password) {
    if (!client) {
      trace('请先建立连接')
      return
    }

    var options = {
      apiUrl: WebIM.config.apiURL,
      user: username,
      pwd: password,
      appKey: WebIM.config.appkey,
      success: function (token) {
        trace('环信登录成功')

        var encryptUsername = WebIM.utils.encrypt(username)
        WebIM.utils.setCookie('webim_' + encryptUsername, token.access_token, 1)
      },
      error: function(){
        trace('环信登录失败')
        if (typeof errorCallback === 'function'){
          errorCallback('环信登录失败')
        }
      }
    }
    client.open(options)
  }

  function loginByToken(token) {
    if (!client) {
      trace('请先建立连接')
      return
    }

    var options = {
      apiUrl: WebIM.config.apiURL,
      accessToken: token,
      appKey: WebIM.config.appkey
    }
    client.open(options)
  }

  var socket = {
    setDebuger: setDebuger,
    connect: connect,
    close: close,
    sendToAll: send,
    sendToUser: sendToUser
  }

  if (typeof module === 'object' && module && typeof module.exports === 'object') {
    module.exports = socket
  } else {
    window.socket = socket
  }
})(window);
