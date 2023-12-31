/*
(c) 2023 Louis D. Nel
Based on:
https://socket.io
see in particular:
https://socket.io/docs/
https://socket.io/get-started/chat/

Before you run this app first execute
>npm install
to install npm modules dependencies listed in package.json file
Then launch this server:
>node server.js

To test open several browsers to: http://localhost:3000/chatClient.html

*/
const server = require('http').createServer(handler)
const io = require('socket.io')(server) //wrap server app in socket io capability
const fs = require('fs') //file system to server static files
const url = require('url'); //to parse url strings
const PORT = process.argv[2] || process.env.PORT || 3000 //useful if you want to specify port through environment variable
                                                         //or command-line arguments
//const socketids = []
const clientInfo = {
  'name': [],
  'socketids': []
}

const ROOT_DIR = 'html' //dir to serve static files from

const MIME_TYPES = {
  'css': 'text/css',
  'gif': 'image/gif',
  'htm': 'text/html',
  'html': 'text/html',
  'ico': 'image/x-icon',
  'jpeg': 'image/jpeg',
  'jpg': 'image/jpeg',
  'js': 'application/javascript',
  'json': 'application/json',
  'png': 'image/png',
  'svg': 'image/svg+xml',
  'txt': 'text/plain'
}

function get_mime(filename) {
  for (let ext in MIME_TYPES) {
    if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
      return MIME_TYPES[ext]
    }
  }
  return MIME_TYPES['txt']
}

server.listen(PORT) //start http server listening on PORT

function handler(request, response) {
  //handler for http server requests including static files
  let urlObj = url.parse(request.url, true, false)
  console.log('\n============================')
  console.log("PATHNAME: " + urlObj.pathname)
  console.log("REQUEST: " + ROOT_DIR + urlObj.pathname)
  console.log("METHOD: " + request.method)

  let filePath = ROOT_DIR + urlObj.pathname
  if (urlObj.pathname === '/') filePath = ROOT_DIR + '/index.html'

  fs.readFile(filePath, function(err, data) {
    if (err) {
      //report error to console
      console.log('ERROR: ' + JSON.stringify(err))
      //respond with not found 404 to client
      response.writeHead(404);
      response.end(JSON.stringify(err))
      return
    }
    response.writeHead(200, {
      'Content-Type': get_mime(filePath)
    })
    response.end(data)
  })

}

//Socket Server
io.on('connection', function(socket) {
  console.log('client connected')
  //console.dir(socket)

  socket.emit('serverSays', 'You are connected to CHAT SERVER')

  socket.on('clientSays', function(data) {
    console.log('RECEIVED: ' + data)
    //to broadcast message to everyone including sender:
    io.emit('serverSays', data) //broadcast to everyone including sender
    //alternatively to broadcast to everyone except the sender
    //socket.broadcast.emit('serverSays', data)
  })
  //register a client
  socket.on('register', function(name) {
    if(!clientInfo.socketids.includes(socket.id)){
      socket.join("room")
      clientInfo.socketids.push(socket.id)
      clientInfo.name.push(name)
    }
  })

  socket.on('main', function(data,username) {
    //event emitted when a client sends a message
    //check if the message is a private message
    //if it is, send it to the intended recipient
    //if not, send it to everyone
    let str=''
    let pvtMsg = false
    for(let i=0; i<data.length; i++){ 
      if(data[i] != ':'){
        str+=data[i]
      }
      else{
        pvtMsg = true
        break
      }
    }
    let msg = username + ":" + data
    if(username === ''){
      msg = data
    }
    let array = []
    let str2 = ''
    for(let i=0; i<str.length; i++){
      if(!str[i].match(/[a-z]/i) && !str[i].match(/[0-9]/i)){
        array.push(str2)
        str2=''
      }
      else{
        str2+=str[i]
      }
    }
    if(str2 != ''){
      array.push(str2)
    }
    if(pvtMsg){
      for(let i = 0; i < clientInfo.name.length; i++){
        for(let j = 0; j < array.length; j++){
          if(clientInfo.name[i]===array[j]){
            io.to(clientInfo.socketids[i]).emit('private',msg)
          }
        }
      }
      io.to(socket.id).emit('private',msg);
    }
    else{
      for(let i = 0; i < clientInfo.socketids.length; i++){
        if(clientInfo.socketids[i] != socket.id){
          io.to(clientInfo.socketids[i]).emit('serverSays',msg)
        }
      }
      io.to(socket.id).emit('senderSays',msg);
    }
  })
  socket.on('disconnect', function(data) {
    //event emitted when a client disconnects
    console.log('client disconnected')
  })
})

console.log(`Server Running at port ${PORT}  CNTL-C to quit`)
console.log(`To Test:`)
console.log(`Open several browsers to: http://localhost:${PORT}/chatClient.html`)