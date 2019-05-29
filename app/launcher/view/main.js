let jiggle = false;

document.getElementById('apps').onclick = (e) => {
  if (jiggle) {
    jiggle = false;
    return;
  }
  document.getElementById('apps').removeAttribute('jiggle');
}

function messager(apps) {
  const container = document.getElementById('apps');
  container.innerHTML = `<div class="app" onclick="NodeJS.install()"><img src="installer.png"><div>Installer</div></div>
  <div class="app" onclick="NodeJS.launch('::square')"><img src="../../square/square.png"><div>Square</div></div>`;

  for (const app of apps) {
    const div = document.createElement('div');
    div.className = 'app';
    div.innerHTML = `<img src="${app.icon}"><div>${app.displayName}</div>`;
    div.onmousedown = (e) => {
      const counter = setTimeout(() => {
        document.getElementById('apps').setAttribute('jiggle', 'true');
        jiggle = true;
      }, 2000);
      e.target.setAttribute('counter', counter);
    }
    div.onclick = (e) => {
      if (document.getElementById('apps').hasAttribute('jiggle')) {
        return;
      }
      let counter =  e.target.getAttribute('counter');
      if (!isNaN(counter)) {
        counter = Number(counter);
        clearTimeout(counter);
        e.target.removeAttribute('counter');
      }
      NodeJS.launch(app.id);
    }
    const removeBtn = document.createElement('div');
    removeBtn.setAttribute('appid', app.id)
    removeBtn.className = 'remove';
    removeBtn.innerHTML = '&#10005;';
    removeBtn.onclick = (e) => {
      const id = e.target.getAttribute('appid');
      NodeJS.removeApp(id);
      jiggle = true;
    }
    div.appendChild(removeBtn);
    container.appendChild(div);
  }
}