const express = require('express')
const app = express()
const http = require('http').createServer(app)
const port = process.env.PORT || 8000
const io = require('socket.io')(http)

const users = []

app.use(express.static(__dirname + '/public'))
console.log(__dirname + '/public')

app.use('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

io.on('connection', (socket) => {
    socket.on('room-joined', (name, room) => {
        const user = {
            id: socket.id,
            name,
            room
        }
        users.push(user)
        socket.join(room);
        socket.to(room).broadcast.emit('user-joined', name)
    })
    socket.on('message', (msg) => {
        let index = users.findIndex(user => user.id == socket.id)
        socket.to(users[index].room).broadcast.emit('message', msg)
    })
    socket.on('disconnect', () => {
        let index = users.findIndex(user => user.id == socket.id)
        if (index != -1) {

            socket.to(users[index].room).broadcast.emit('disconnect-user', users[index].name)
            socket.leave(users[index].room)
            users.splice(index, index + 1)
        }
    })
    socket.on('disconnect-user', (user, room) => {
        let index = users.findIndex(user => user.id == socket.id)
        socket.to(room).broadcast.emit('disconnect-user', users[index].name)
        socket.leave(users[index].room)
        users.splice(index, index + 1)
    })
})

http.listen(port, () => {
    console.log("server is listening at port: " + port)
})