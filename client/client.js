let socket = io('http://localhost:3000');
let btn = document.getElementById('btn');
if (btn) {
  btn.addEventListener('click', () => socket.emit('msg_to_server', { rand_num: Math.random() }));
}

let uList = document.getElementById('list');
socket.on('msg_from_server', msg => {
  if (uList) {
    let el = document.createElement('li');
    let pre = document.createElement('pre');
    pre.innerHTML = JSON.stringify(msg);
    el.appendChild(pre);
    uList.appendChild(el);
  }
});
