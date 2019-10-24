/* eslint-disable no-undef */
const socket = io('http://localhost:3000');
const btn = document.getElementById('btn');
if (btn) {
  btn.addEventListener('click', () => socket.emit('msg_to_server', { rand_num: Math.random() }));
}

const uList = document.getElementById('list');
socket.on('msg_from_server', msg => {
  if (uList) {
    const el = document.createElement('li');
    const pre = document.createElement('pre');
    pre.innerText = JSON.stringify(msg);
    el.appendChild(pre);
    uList.appendChild(el);
  }
});
