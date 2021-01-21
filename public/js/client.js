const socket = io('https://messenger21.herokuapp.com/');
// variables

let chatForm = document.getElementById('chatForm');
let chatBody = document.getElementById('chatBody');
let msgInp = document.getElementById('msgInp');
let chatRate = document.getElementById('chatRate');
let userName;
let room;
let chatDay;
let textArea;
var audio = new Audio('ting.mp3');

// setting up date and time

let date = new Date()
let day = date.toLocaleDateString('en-us', { weekday: 'long' })
let hours = date.getHours()
var timeFormat = "AM";
var minutes = date.getMinutes()
if (hours > 11) { timeFormat = "PM"; }
if (hours > 12) { hours = hours - 12; }
if (hours == 0) { hours = 12; }
if (hours < 10) { hours = "0" + hours; }

// setting default room ============

function useDefault(e) {
    if (e.checked) {
        document.getElementById("room").setAttribute("disabled","")
        document.getElementById("room").value="Public"
    }
    else{
        document.getElementById("room").removeAttribute("disabled")
        document.getElementById("room").value=""
    }
}

function startChat() {
    chatDay = document.getElementById('chatDay')
    userName = document.getElementById('name').value
    room = document.getElementById("room").value
    textArea = document.getElementById('textarea')
    chatDay.innerHTML=`${day}, ${hours}:${minutes} ${timeFormat}`
    socket.emit('room-joined',userName,room)
}

function appendMessage(userName,message,type) {
    chatBody.insertAdjacentHTML("beforeend",`<div class="chat-bubble ${type}">${(type == "me"?`<small class="none"></small>`:`<p class='name'>${userName} <span> ${hours}:${minutes} ${timeFormat}</span></p>`)}${message}</div>`)
    scrollToBottom()
    if(type == "you"){
        audio.play();
    }
}
function getMsg() {
    var msg = {
        userName,
        message: textArea.value
    }
    appendMessage(msg.userName,msg.message,"me")
    socket.emit('message',(msg))
    textArea.value=''
}
function endChat() {
    socket.emit('disconnect-user',userName,room)
}
function rate() {
    chatRate.classList.add("hide")
    chatBody.classList.add("hide")
    msgInp.classList.add("hide")
    chatForm.classList.remove("hide")
}
socket.on('message', (msg) => {
    appendMessage(msg.userName,msg.message, "you")
})
socket.on('user-joined',(user)=>{
    appendMessage("Admin",`${user} joined the chat.`,"you")
})
socket.on('disconnect-user',(user)=>{
    appendMessage("Admin",`${user} left the chat.`,"you")
})

// for auto scrolling

function scrollToBottom() {
    chatBody.scrollTop = chatBody.scrollHeight
}