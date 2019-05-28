async function loadList() {
  const index = await NodeJS.getAppIndex();
  const apps = index.apps;
  let html = '';
  
  for (const app of apps) {
    html += `<div class="item" onclick="showDetail(${JSON.stringify(app).replace(/"/g, '\'')})">
    <div class="bg" style="background-image: url(https://raw.githubusercontent.com/${app.repository}/master/${app.icon})"></div>
    <div class="icon" style="background-image: url(https://raw.githubusercontent.com/${app.repository}/master/${app.icon})"></div>
    <div class="info">
      <div class="display-name">${app.displayName}</div>
      <div class="publisher">${app.publisher}</div>
    </div>
  </div>`;
  }

  document.getElementById('list').innerHTML = html;
  setTimeout(() => {
    document.getElementById('list').className = '';
  }, 3000);
}

async function showDetail(app) {
  document.getElementById('list').style.display = 'none';
  document.getElementById('icon').style.backgroundImage = `url(https://raw.githubusercontent.com/${app.repository}/master/${app.icon})`;
  document.getElementById('name').innerHTML = app.displayName;
  document.getElementById('publisher').innerHTML = app.publisher;
  document.getElementById('readme').innerHTML = '';
  document.getElementById('readme').className = 'loading';
  const isInstalled = await NodeJS.isInstalled(app.bin);
  document.getElementById('install').innerHTML = isInstalled ? 'Installed' : 'Install';
  document.getElementById('install').className = isInstalled ? 'installed' : '';
  document.getElementById('install').disabled = isInstalled;
  document.getElementById('install').setAttribute('repository', app.repository);
  document.getElementById('install').setAttribute('release', app.release);
  document.getElementById('install').setAttribute('bin', app.bin);
  document.getElementById('detail').style.display = 'block';
  const readme = await NodeJS.getReadme(app.repository);
  document.getElementById('readme').className = '';
  document.getElementById('readme').innerHTML = readme;
}

function back() {
  document.getElementById('detail').style.display = 'none';
  document.getElementById('list').style.display = 'block';
}

async function install() {
  const repository = document.getElementById('install').getAttribute('repository');
  const release = document.getElementById('install').getAttribute('release');
  const bin = document.getElementById('install').getAttribute('bin');
  document.getElementById('install').disabled = true;
  document.getElementById('install').innerHTML = 'Installing';
  await NodeJS.install(repository, release, bin);
  document.getElementById('install').innerHTML = 'Installed';
  document.getElementById('install').className = 'installed';
}

function init() {
  document.getElementById('back').onclick = back;
  document.getElementById('install').onclick = install;
  loadList();
}

init();