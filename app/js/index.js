var socket = require('./js/socket')
socket.setDebuger(log)

$('#name').val('xp')
$('#pass').val('123')
$('#room').val('285030145138360860')
initSocket()

$('.conn input').change(function(){
  initSocket()
})

$('body').keypress(function(event){
  if (event.which === 13) {
    // $('#send').trigger('click')
    $('#send').click()
  }
})

$('#send').click(function(){
  var tag = $('#cmd').val().trim()
  if (tag === '') return

  try {
    var value = $('#arg').val() ? JSON.parse($('#arg').val()) : ''
  } catch (error) {
    log('错误：参数必须是json字符串格式！')
    return
  }

  let roomId = $('#room').val().trim()
  socket.sendToAll(roomId, tag, value)
  // $('#cmd').val('')
  // $('#arg').val('')
})

function initSocket () {
  let username = $('#name').val().trim()
  let password = $('#pass').val().trim()

  socket.connect(username, password, null, onReceived)
}

function onReceived (tag, value) {

}

function log (msg) {
  $('#tip').append(msg + '\n')
  $('#tip')[0].scrollTop = $('#tip')[0].scrollHeight
}
