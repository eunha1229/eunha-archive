const FALLBACK_POSTS = [
`---
name: 우연서
codename: Aubade
world: THEMiS
tags: [Guide, S-Class, MUSE, Korea]
image:
updated: 2026-09-17
---

# PROFILE
22세 / 여성 / 153cm / 대한민국.
새벽빛을 닮은 청보라에서 금빛으로 이어지는 긴 머리와 흰 눈동자.

# ABILITY
감각 조종 계열의 S급 가이드. 시각·청각·움직임 등의 감각을 흐리거나 선명하게 조정한다.

# BACKGROUND
이곳에는 캐릭터의 배경 설정을 자유롭게 작성합니다.
Markdown 파일만 수정하면 사이트 본문이 함께 바뀝니다.

# AI CHAT PROMPT
{{char}}의 AI 채팅용 프롬프트를 이곳에 백업합니다.

# OOC
필요한 OOC 지침을 이곳에 보관합니다.`
];

let state = { posts: [], filterWorld: null, filterTag: null, query: "" };

function parseFrontMatter(text){
  // GitHub/raw Markdown may contain BOM, CRLF, or leading whitespace.
  const normalized = String(text ?? "")
    .replace(/^\uFEFF/, "")
    .replace(/\r\n?/g, "\n")
    .trimStart();

  let meta = {};
  let body = normalized;

  if (normalized.startsWith("---")) {
    const lines = normalized.split("\n");
    const closing = lines.findIndex((line, index) => index > 0 && line.trim() === "---");

    if (closing > 0) {
      body = lines.slice(closing + 1).join("\n").trim();

      lines.slice(1, closing).forEach(line => {
        const i = line.indexOf(":");
        if (i < 0) return;

        const key = line.slice(0, i).trim().toLowerCase();
        let raw = line.slice(i + 1).trim();

        if ((raw.startsWith('"') && raw.endsWith('"')) ||
            (raw.startsWith("'") && raw.endsWith("'"))) {
          raw = raw.slice(1, -1);
        }

        if (key === "tags") {
          meta[key] = raw
            .replace(/^\s*\[/, "")
            .replace(/\]\s*$/, "")
            .split(",")
            .map(s => s.trim().replace(/^['"]|['"]$/g, ""))
            .filter(Boolean);
        } else {
          meta[key] = raw;
        }
      });
    }
  }

  const sections = [];
  const headingRegex = /^#\s+(.+)$/gm;
  const matches = [...body.matchAll(headingRegex)];

  matches.forEach((match, index) => {
    const title = match[1].trim();
    const contentStart = match.index + match[0].length;
    const contentEnd = index + 1 < matches.length ? matches[index + 1].index : body.length;
    sections.push({
      title,
      content: body.slice(contentStart, contentEnd).trim()
    });
  });

  return {
    ...meta,
    name: meta.name || "Untitled",
    codename: meta.codename || "",
    world: meta.world || "",
    image: meta.image || "",
    updated: meta.updated || "",
    tags: Array.isArray(meta.tags) ? meta.tags : [],
    sections,
    raw: text
  };
}

async function loadPosts(){
  // GitHub Pages cannot enumerate a folder by itself, so posts/index.json is the tiny manifest.
  try{
    const manifest=await fetch("posts/index.json",{cache:"no-store"}).then(r=>{if(!r.ok)throw 0;return r.json()});
    const texts=await Promise.all(manifest.map(async file=>{
      const r=await fetch("posts/"+encodeURIComponent(file),{cache:"no-store"});
      if(!r.ok) throw new Error(`Could not load posts/${file}: ${r.status}`);
      return await r.text();
    }));
    state.posts=texts.map(parseFrontMatter);
  }catch(e){
    state.posts=FALLBACK_POSTS.map(parseFrontMatter);
  }
  renderSide();
  showHome();
}

function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function initials(p){return (p.codename||p.name||"PA").slice(0,2).toUpperCase()}
function art(p, cls="card-art"){
  return `<div class="${cls}">${p.image?`<img src="${esc(p.image)}" alt="">`:esc(initials(p))}</div>`;
}
function card(p,i){
  return `<article class="persona-card" onclick="showDetail(${i})">${art(p)}
    <div class="card-body"><div class="card-world">${esc(p.world||"UNFILED")}</div>
    <div class="card-name">${esc(p.name||"Untitled")}</div><div class="card-code">${esc(p.codename||"")}</div></div></article>`;
}
function getFiltered(){
  const q=state.query.toLowerCase();
  return state.posts.map((p,i)=>({p,i})).filter(({p})=>{
    const hay=[p.name,p.codename,p.world,...p.tags,...p.sections.map(s=>s.content)].join(" ").toLowerCase();
    return (!q||hay.includes(q)) && (!state.filterWorld||p.world===state.filterWorld) && (!state.filterTag||p.tags.includes(state.filterTag));
  });
}
function renderSide(){
  const worlds=[...new Set(state.posts.map(p=>p.world).filter(Boolean))].sort();
  const tags=[...new Set(state.posts.flatMap(p=>p.tags))].sort();
  worldList.innerHTML=worlds.map(w=>`<button class="world-btn" onclick="filterWorld('${esc(w)}')">⌞ ${esc(w)}</button>`).join("");
  tagList.innerHTML=tags.map(t=>`<button class="tag-chip" onclick="filterTag('${esc(t)}')">#${esc(t)}</button>`).join("");
}
function setCrumb(s){crumb.textContent="ARCHIVE / "+s.toUpperCase()}
function navActive(view){document.querySelectorAll(".nav-item").forEach(x=>x.classList.toggle("active",x.dataset.view===view))}
function showHome(){
  state.filterWorld=state.filterTag=null; navActive("home"); setCrumb("HOME");
  const recent=state.posts.map((p,i)=>({p,i})).sort((a,b)=>(b.p.updated||"").localeCompare(a.p.updated||"")).slice(0,5);
  content.innerHTML=`<section class="hero"><div class="eyebrow">✦ Personal character database</div>
    <h1>Welcome to your <em>Archive.</em></h1>
    <p>페르소나의 설정과 AI 채팅 프롬프트를 한곳에 보관하는 개인 위키. 내용은 Markdown으로, 사이트는 자동으로.</p>
    <div class="stats"><span><b>${state.posts.length}</b> PERSONAS</span><span><b>${new Set(state.posts.map(p=>p.world).filter(Boolean)).size}</b> WORLDS</span><span><b>${new Set(state.posts.flatMap(p=>p.tags)).size}</b> TAGS</span></div></section>
    <div class="section-head"><h2>PERSONAS</h2><span>ARCHIVE INDEX</span></div>
    <div class="card-grid">${state.posts.map(card).join("")||'<div class="empty">아직 등록된 페르소나가 없습니다.</div>'}</div>
    <div class="section-head"><h2>RECENTLY UPDATED</h2><span>LAST CHANGES</span></div>
    <div class="recent-list">${recent.map(({p,i})=>`<div class="recent-row" onclick="showDetail(${i})"><span class="recent-name">◇ ${esc(p.name)} <small>/ ${esc(p.codename||"")}</small></span><span class="recent-date">${esc(p.updated||"—")}</span></div>`).join("")}</div>`;
  closeSide();
}
function showPersonas(){
  navActive("personas"); setCrumb("PERSONAS");
  const list=getFiltered();
  content.innerHTML=`<section class="hero"><div class="eyebrow">Archive Index</div><h1>Persona <em>Index</em></h1>
  <p>${state.filterWorld?`WORLD · ${esc(state.filterWorld)}`:state.filterTag?`TAG · #${esc(state.filterTag)}`:"전체 페르소나"}${state.query?` · SEARCH "${esc(state.query)}"`:""}</p></section>
  <div class="section-head"><h2>${list.length} ENTRIES</h2><span>${state.filterWorld||state.filterTag||"ALL"}</span></div>
  <div class="card-grid">${list.map(({p,i})=>card(p,i)).join("")||'<div class="empty">조건에 맞는 페르소나가 없습니다.</div>'}</div>`;
  closeSide();
}
function filterWorld(w){state.filterWorld=w;state.filterTag=null;showPersonas()}
function filterTag(t){state.filterTag=t;state.filterWorld=null;showPersonas()}
function showDetail(i){
  const p=state.posts[i]; if(!p)return; navActive(""); setCrumb(p.codename||p.name);
  const promptNames=["AI CHAT PROMPT","OOC","IMAGE PROMPT","PROMPT"];
  const sections=p.sections.map((s,si)=>{
    const isPrompt=promptNames.some(x=>s.title.toUpperCase().includes(x));
    return `<section class="doc-section"><h2>${esc(s.title)}</h2>${isPrompt?
      `<div class="prompt-box"><div class="prompt-top"><span>ARCHIVED PROMPT</span><button class="copy-btn" onclick="copyPrompt(${i},${si},this)">COPY</button></div><pre>${esc(s.content)}</pre></div>`:
      `<div class="prose">${esc(s.content)}</div>`}</section>`;
  }).join("");
  content.innerHTML=`<button class="back-btn" onclick="showPersonas()">← BACK TO INDEX</button>
    <div class="detail-head">${art(p,"portrait")}<div class="detail-title"><div class="eyebrow">${esc(p.world||"UNFILED")}</div>
    <h1>${esc(p.name||"Untitled")}</h1><div class="code">${esc(p.codename||"")}</div>
    <div class="detail-tags">${p.tags.map(t=>`<button class="tag-chip" onclick="filterTag('${esc(t)}')">#${esc(t)}</button>`).join("")}</div></div></div>
    <div class="detail-body">${sections}</div>`;
  window.scrollTo(0,0);closeSide();
}
async function copyPrompt(i,si,btn){
  await navigator.clipboard.writeText(state.posts[i].sections[si].content);
  btn.textContent="COPIED";setTimeout(()=>btn.textContent="COPY",1200);
}
function editor(prefill=null){
  navActive("");setCrumb(prefill?"EDIT ENTRY":"NEW ENTRY");
  const p=prefill||{name:"",codename:"",world:"",tags:[],image:"",updated:new Date().toISOString().slice(0,10),sections:[]};
  const sec=Object.fromEntries((p.sections||[]).map(s=>[s.title.toUpperCase(),s.content]));
  content.innerHTML=`<div class="editor-wrap"><div class="eyebrow">✦ Archive Editor</div><h1 class="editor-title">${prefill?"Edit":"New"} Persona</h1>
  <div class="form-grid">
   ${field("name","NAME",p.name)} ${field("codename","CODENAME",p.codename)}
   ${field("world","WORLD",p.world)} ${field("tags","TAGS · comma separated",(p.tags||[]).join(", "))}
   ${field("image","IMAGE PATH · optional",p.image,"full")} ${field("updated","UPDATED · YYYY-MM-DD",p.updated)}
   ${area("profile","PROFILE",sec["PROFILE"]||"","full")} ${area("ability","ABILITY",sec["ABILITY"]||"","full")}
   ${area("background","BACKGROUND",sec["BACKGROUND"]||"","full")} ${area("prompt","AI CHAT PROMPT",sec["AI CHAT PROMPT"]||"","full")}
   ${area("ooc","OOC",sec["OOC"]||"","full")} ${area("imageprompt","IMAGE PROMPT",sec["IMAGE PROMPT"]||"","full")}
  </div>
  <div class="editor-actions"><button class="action-btn primary" onclick="downloadMd()">DOWNLOAD .MD</button><button class="action-btn" onclick="importMd.click()">IMPORT .MD TO EDIT</button><button class="action-btn" onclick="previewEditor()">PREVIEW</button></div>
  <div class="editor-note">이 에디터는 브라우저에서 Markdown 파일을 만들어 줍니다. 다운로드한 .md 파일을 posts 폴더에 넣고 posts/index.json에 파일명만 추가하면 사이트에 표시됩니다. GitHub 토큰이나 비밀번호는 사이트에 저장하지 않습니다.</div></div>`;
  closeSide();
}
function field(id,label,val="",cls=""){return `<div class="field ${cls}"><label for="${id}">${label}</label><input id="${id}" value="${esc(val||"")}"></div>`}
function area(id,label,val="",cls=""){return `<div class="field ${cls}"><label for="${id}">${label}</label><textarea id="${id}">${esc(val||"")}</textarea></div>`}
function buildMd(){
  const v=id=>document.getElementById(id)?.value.trim()||"";
  const tags=v("tags").split(",").map(x=>x.trim()).filter(Boolean);
  const sections=[["PROFILE",v("profile")],["ABILITY",v("ability")],["BACKGROUND",v("background")],["AI CHAT PROMPT",v("prompt")],["OOC",v("ooc")],["IMAGE PROMPT",v("imageprompt")]].filter(x=>x[1]);
  return `---\nname: ${v("name")}\ncodename: ${v("codename")}\nworld: ${v("world")}\ntags: [${tags.join(", ")}]\nimage: ${v("image")}\nupdated: ${v("updated")||new Date().toISOString().slice(0,10)}\n---\n\n${sections.map(([h,b])=>`# ${h}\n${b}`).join("\n\n")}\n`;
}
function downloadMd(){
  const md=buildMd(), name=(document.getElementById("codename").value||document.getElementById("name").value||"persona").trim().toLowerCase().replace(/[^a-z0-9가-힣_-]+/g,"-");
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([md],{type:"text/markdown;charset=utf-8"}));a.download=name+".md";a.click();URL.revokeObjectURL(a.href);
}
function previewEditor(){const p=parseFrontMatter(buildMd());state.posts.push(p);showDetail(state.posts.length-1);state.posts.pop()}
function closeSide(){sidebar.classList.remove("open")}

document.querySelectorAll(".nav-item").forEach(b=>b.onclick=()=>b.dataset.view==="home"?showHome():showPersonas());
searchInput.addEventListener("input",e=>{state.query=e.target.value.trim();if(state.query)showPersonas();else if(document.querySelector(".nav-item[data-view=personas]").classList.contains("active"))showPersonas()});
newEntryBtn.onclick=()=>editor();
menuBtn.onclick=()=>sidebar.classList.toggle("open");
themeBtn.onclick=()=>document.body.classList.toggle("light");
importMd.onchange=async e=>{const f=e.target.files[0];if(f)editor(parseFrontMatter(await f.text()));e.target.value=""};
loadPosts();
