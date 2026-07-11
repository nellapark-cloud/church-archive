// build.js
// Netlify가 배포 전에 이 스크립트를 실행합니다.
// content/categories/*.json 파일들과 content/site.json을 합쳐서
// 방문자 화면(index.html)이 읽는 content/data.json을 만듭니다.
// 관리자는 이 파일을 직접 건드릴 필요가 없습니다 — 관리 화면(/admin/)에서
// 폴더/자료를 추가하면 자동으로 여기 반영됩니다.

const fs = require('fs');
const path = require('path');

const categoriesDir = path.join(__dirname, 'content', 'categories');
const sitePath = path.join(__dirname, 'content', 'site.json');
const outPath = path.join(__dirname, 'content', 'data.json');

let site = { siteTitle: '작업 아카이브', siteDesc: '' };
if (fs.existsSync(sitePath)) {
  site = JSON.parse(fs.readFileSync(sitePath, 'utf8'));
}

let categoryFiles = [];
if (fs.existsSync(categoriesDir)) {
  categoryFiles = fs.readdirSync(categoriesDir)
    .filter(f => f.endsWith('.json'))
    .sort();
}

const children = categoryFiles.map(filename => {
  const raw = fs.readFileSync(path.join(categoriesDir, filename), 'utf8');
  const cat = JSON.parse(raw);
  return {
    type: 'folder',
    title: cat.title || filename.replace(/\.json$/, ''),
    desc: cat.desc || '',
    children: cat.children || []
  };
});

const data = {
  siteTitle: site.siteTitle,
  siteDesc: site.siteDesc,
  root: { children }
};

fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`data.json 생성 완료 (${children.length}개 최상위 폴더)`);
