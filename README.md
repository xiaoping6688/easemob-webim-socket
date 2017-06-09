# easemob-webim-socket
环信WEBIM即时通信封装（socket.js 非IM） + 客户端模拟器（electron）

## Install

```
$ npm install
$ cd app & npm install
```

## Start

```
$ cd ..
$ npm start
```

## Usage

```js
function initSocket () {
  let username = $('#name').val().trim()
  let password = $('#pass').val().trim()
  let roomId = $('#room').val().trim()

  socket.connect(username, password, function(){
    // 环信连接&登录成功
  }, onReceived, onError)
}

function onReceived (tag, value) {
  // tag 命令 value 数据
}

//=> @see app/js/index.js // 参考socket使用方法
//=> @see app/js/socket.js // 对环信WEB-IM sdk封装，包括队列和日志功能等
```

![image](https://raw.githubusercontent.com/xiaoping6688/easemob-webim-socket/master/screenshot.png)
