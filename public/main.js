const socket = io();

const clientsTotal = document.getElementById('client-total');
const messageContainer = document.getElementById('message-container');
const nameInput = document.getElementById('name-input');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

const messageTone = new Audio('/message-tone.mp3');

messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage();
});

socket.on('clients-total', (data) => {
    clientsTotal.innerText = `Total clients: ${data}`;
});

function sendMessage() {
    if (messageInput.value.trim() === '') return;
    const data = {
        name: nameInput.value.trim(),
        message: messageInput.value.trim(),
        dateTime: new Date(),
    };
    socket.emit('message', data);
    addMessageToUI(true, data);
    messageInput.value = '';
}

socket.on('chat-message', (data) => {
    messageTone.play();
    addMessageToUI(false, data);
});

function addMessageToUI(isOwnMessage, data) {
    clearFeedback();
    const messageClass = isOwnMessage ? 'message-right' : 'message-left';
    const element = `
        <li class="${messageClass}">
            <p>${data.message}</p>
            <span>${data.name} • ${moment(data.dateTime).fromNow()}</span>
        </li>
    `;
    messageContainer.innerHTML += element;
    scrollToBottom();
}

function scrollToBottom() {
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

messageInput.addEventListener('focus', () => {
    socket.emit('feedback', { feedback: `${nameInput.value} is typing...` });
});

messageInput.addEventListener('blur', () => {
    socket.emit('feedback', { feedback: '' });
});

socket.on('feedback', (data) => {
    clearFeedback();
    const element = `
        <li class="feedback-message">
            <p>${data.feedback}</p>
        </li>
    `;
    messageContainer.innerHTML += element;
});

function clearFeedback() {
    document.querySelectorAll('.feedback-message').forEach(element => {
        element.remove();
    });
}
