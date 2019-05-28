function messager(apps) {
  const container = document.getElementById('apps');
  container.innerHTML = `<div class="app" onclick="NodeJS.install()"><img src="installer.png"><div>Installer</div></div>
  <div class="app" onclick="NodeJS.launch('::square')"><img src="../../square/square.png"><div>Square</div></div>`;

  for (const app of apps) {
    const div = document.createElement('div');
    div.className = 'app';
    div.innerHTML = `<img src="${app.icon}"><div>${app.displayName}</div>`;
    div.onclick = () => {
      NodeJS.launch(app.id);
    }
    container.appendChild(div);
  }
}
