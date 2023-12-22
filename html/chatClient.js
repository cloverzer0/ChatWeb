//connect to server and retain the socket
//connect to same host that served the document

//const socket = io('http://' + window.document.location.host)
const socket = io() //by default connects to same server that served the page
let Storename =''
//for main messages on the server's screen
socket.on('serverSays', function(message) {
  let msgDiv = document.createElement('div')
  /*
  What is the distinction among the following options to set
  the content? That is, the difference among:
  .innerHTML, .innerText, .textContent
  */
  msgDiv.innerHTML = message
  msgDiv.style.color = 'black'
  document.getElementById('messages').appendChild(msgDiv)
})

//for main messages on the sender's screen
socket.on('senderSays', function(message) {
  let msgDiv = document.createElement('div')

  msgDiv.innerHTML = message
  msgDiv.style.color = 'blue'
  document.getElementById('messages').appendChild(msgDiv)
})

//for private messages
socket.on('private', function(message) { 
  let msgDiv = document.createElement('div')

  msgDiv.innerHTML = message
  msgDiv.style.color = 'red'
  document.getElementById('messages').appendChild(msgDiv)
})

//check if the username is valid
function isLetter(str) {
  for(let i=0; i<str.length; i++){
    if(!str[0].match(/[a-z]/i)){
      return false
    }
    else if(!str[i].match(/[a-z]/i) && !str[i].match(/[0-9]/i)){
      return false
    }
  }
  return true
}

//register with the client in the server
function connectAs() {
   let name = document.getElementById('username').value.trim()
  if(!isLetter(name)|| name === '') {
    document.getElementById('username').value=''
    document.getElementById('username').placeholder='Invalid username'; return
  } //do nothing
  socket.emit('clientSays',"Welcome " + name)
  socket.emit('register', name)
  

  Storename
  
  document.getElementById('msgBox').style.display = 'block'
  document.getElementById('send_button').style.display = 'block'

  document.getElementById('username').style.display = 'none'
  document.getElementById('connect_as').style.display = 'none'

  document.getElementById('clear_button').style.display = 'block'
}
//send message to server
function sendMessage() {
  let message = document.getElementById('msgBox').value.trim()
  document.getElementById('messages').style.color = 'black'
  if(message === '') return //do 

  socket.emit('main', message, Storename)
  socket.emit('senderSays', message)
  document.getElementById('msgBox').value = ''
}
//clear the messages from the chat window
function clearMessages() {
  document.getElementById('messages').innerHTML = ''
  let msgDiv = document.createElement('div')
  msgDiv.innerHTML = 'You are connected to CHAT SERVER'
  document.getElementById('messages').appendChild(msgDiv)
}

function handleKeyDown(event) {
  const ENTER_KEY = 13 //keycode for enter key
  if (event.keyCode === ENTER_KEY) {
    sendMessage()
    return false //don't propogate event
  }
}


//Add event listeners
document.addEventListener('DOMContentLoaded', function() {
  //This function is called after the browser has loaded the web page

  document.getElementById('connect_as').addEventListener('click',connectAs)

  //add listener to buttons
  document.getElementById('send_button').addEventListener('click', sendMessage)

  document.getElementById('clear_button').addEventListener('click', clearMessages)

  //add keyboard handler for the document as a whole, not separate elements.
  document.addEventListener('keydown', handleKeyDown)
  //document.addEventListener('keyup', handleKeyUp)
})