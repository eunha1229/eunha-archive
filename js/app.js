const FALLBACK_POSTS=[`---
name: 우연서
native_name: 禹然曙
codename: Aubade
world: THEMiS
tags: [Guide, S-Class, MUSE, Korea]
image:
updated: 2026-09-17
age: 22
gender: 여성
birthday:
height: 153 cm
nationality: 대한민국
partner:
---
# CHARACTER
감각 조종 계열의 S급 가이드. 시각·청각·움직임 등의 감각을 흐리거나 선명하게 조정한다.

# BACKGROUND
이곳에는 캐릭터의 배경 설정을 자유롭게 작성합니다.

# AI CHAT PROMPT
{{char}}의 AI 채팅용 프롬프트를 이곳에 백업합니다.

# OOC
필요한 OOC 지침을 이곳에 보관합니다.`];

let state={posts:[],filterWorld:null,filterTag:null,query:""};
const contentEl=document.getElementById("content");
const crumbEl=document.getElementById("crumb");
const worldListEl=document.getElementById("worldList");
const sidebarEl=document.getElementById("sidebar");
const searchInputEl=document.getElementById("searchInput");
const newEntryBtnEl=document.getElementById("newEntryBtn");
const menuBtnEl=document.getElementById("menuBtn");
const themeBtnEl=document.getElementById("themeBtn");
const importMdEl=document.getElementById("importMd");
function parseFrontMatter(text){
 const normalized=String(text??"").replace(/^\uFEFF/,"").replace(/\r\n?/g,"\n").trimStart();
 let meta={},body=normalized;
 if(normalized.startsWith("---")){
  const lines=normalized.split("\n"),closing=lines.findIndex((l,i)=>i>0&&l.trim()==="---");
  if(closing>0){body=lines.slice(closing+1).join("\n").trim();lines.slice(1,closing).forEach(line=>{
   const i=line.indexOf(":");if(i<0)return;const key=line.slice(0,i).trim().toLowerCase();let raw=line.slice(i+1).trim();
   if((raw.startsWith('"')&&raw.endsWith('"'))||(raw.startsWith("'")&&raw.endsWith("'")))raw=raw.slice(1,-1);
   meta[key]=key==="tags"?raw.replace(/^\s*\[/,"").replace(/\]\s*$/,"").split(",").map(s=>s.trim().replace(/^['"]|['"]$/g,"")).filter(Boolean):raw;
  })}
 }
 const sections=[],rx=/^#\s+(.+)$/gm,matches=[...body.matchAll(rx)];
 matches.forEach((m,i)=>sections.push({title:m[1].trim(),content:body.slice(m.index+m[0].length,i+1<matches.length?matches[i+1].index:body.length).trim()}));
 return {...meta,name:meta.name||"Untitled",native_name:meta.native_name||"",codename:meta.codename||"",world:meta.world||"",image:meta.image||"",updated:meta.updated||"",tags:Array.isArray(meta.tags)?meta.tags:[],sections,raw:text};
}
async function loadPosts(){
 try{
  const r=await fetch("posts/index.json",{cache:"no-store"});if(!r.ok)throw 0;const manifest=await r.json();
  const texts=await Promise.all(manifest.map(async file=>{const x=await fetch("posts/"+encodeURIComponent(file),{cache:"no-store"});if(!x.ok)throw new Error(file);return x.text()}));
  state.posts=texts.map(parseFrontMatter);
 }catch(e){state.posts=FALLBACK_POSTS.map(parseFrontMatter)}
 renderSide();showHome();
}
function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function initials(p){return(p.codename||p.name||"PA").slice(0,2).toUpperCase()}
function art(p,cls="card-art"){return`<div class="${cls}">${p.image?`<img src="${esc(p.image)}" alt="">`:esc(initials(p))}</div>`}
function card(p,i){return`<article class="persona-card" onclick="showDetail(${i})">${art(p)}<div class="card-body"><div class="card-world">${esc(p.world||"UNFILED")}</div><div class="card-name">${esc(p.name)}</div>${p.native_name?`<div class="card-native">${esc(p.native_name)}</div>`:""}<div class="card-code">${esc(p.codename)}</div></div></article>`}
function renderSide(){const worlds=[...new Set(state.posts.map(p=>p.world).filter(Boolean))].sort();worldListEl.innerHTML=worlds.map(w=>`<button class="world-btn" onclick="filterWorld('${esc(w)}')">⌞ ${esc(w)}</button>`).join("")}
function setCrumb(s){crumbEl.textContent="ARCHIVE / "+s.toUpperCase()}
function navActive(v){document.querySelectorAll(".nav-item").forEach(x=>x.classList.toggle("active",x.dataset.view===v))}
function getFiltered(){const q=state.query.toLowerCase();return state.posts.map((p,i)=>({p,i})).filter(({p})=>{const hay=[p.name,p.native_name,p.codename,p.world,...p.tags,...p.sections.map(s=>s.title+" "+s.content)].join(" ").toLowerCase();return(!q||hay.includes(q))&&(!state.filterWorld||p.world===state.filterWorld)})}
function showHome(){state.filterWorld=null;navActive("home");setCrumb("HOME");const recent=state.posts.map((p,i)=>({p,i})).sort((a,b)=>(b.p.updated||"").localeCompare(a.p.updated||"")).slice(0,5);contentEl.innerHTML=`<section class="hero"><div class="eyebrow">✦ Personal character database</div><h1>Welcome to your <em>Archive.</em></h1><p>페르소나의 설정과 AI 채팅 프롬프트를 한곳에 보관하는 개인 위키.</p><div class="stats"><span><b>${state.posts.length}</b> PERSONAS</span><span><b>${new Set(state.posts.map(p=>p.world).filter(Boolean)).size}</b> WORLDS</span><span><b>${new Set(state.posts.flatMap(p=>p.tags)).size}</b> TAGS</span></div></section><div class="section-head"><h2>PERSONAS</h2><span>ARCHIVE INDEX</span></div><div class="card-grid">${state.posts.map(card).join("")}</div><div class="section-head"><h2>RECENTLY UPDATED</h2><span>LAST CHANGES</span></div><div class="recent-list">${recent.map(({p,i})=>`<div class="recent-row" onclick="showDetail(${i})"><span>◇ ${esc(p.name)} / ${esc(p.codename)}</span><span class="recent-date">${esc(p.updated||"—")}</span></div>`).join("")}</div>`;closeSide()}
function showPersonas(){navActive("personas");setCrumb("PERSONAS");const list=getFiltered();contentEl.innerHTML=`<section class="hero"><div class="eyebrow">Archive Index</div><h1>Persona <em>Index</em></h1><p>${state.filterWorld?`WORLD · ${esc(state.filterWorld)}`:"전체 페르소나"}${state.query?` · SEARCH "${esc(state.query)}"`:""}</p></section><div class="section-head"><h2>${list.length} ENTRIES</h2><span>${state.filterWorld||"ALL"}</span></div><div class="card-grid">${list.map(({p,i})=>card(p,i)).join("")||'<div class="empty">조건에 맞는 페르소나가 없습니다.</div>'}</div>`;closeSide()}
function filterWorld(w){state.filterWorld=w;showPersonas()}
function profileGrid(p){const fields=[["AGE",p.age],["GENDER",p.gender],["BIRTHDAY",p.birthday],["HEIGHT",p.height],["NATIONALITY",p.nationality],["PARTNER",p.partner]];return`<div class="profile-grid">${fields.map(([l,v])=>`<div class="profile-cell"><div class="profile-label">${l}</div><div class="profile-value ${v?"":"empty-value"}">${esc(v||"—")}</div></div>`).join("")}</div>`}
function showDetail(i){const p=state.posts[i];if(!p)return;navActive("");setCrumb(p.codename||p.name);const promptNames=["AI CHAT PROMPT","OOC","IMAGE PROMPT","PROMPT"];const sections=p.sections.map((s,si)=>{const prompt=promptNames.some(x=>s.title.toUpperCase().includes(x));return`<section class="doc-section"><h2>${esc(s.title)}</h2>${prompt?`<div class="prompt-box"><div class="prompt-top"><span>ARCHIVED PROMPT</span><button class="copy-btn" onclick="copyPrompt(${i},${si},this)">COPY</button></div><pre>${esc(s.content)}</pre></div>`:`<div class="prose">${esc(s.content)}</div>`}</section>`}).join("");contentEl.innerHTML=`<button class="back-btn" onclick="showPersonas()">← BACK TO INDEX</button><div class="detail-head">${art(p,"portrait")}<div class="detail-title"><div class="eyebrow">${esc(p.world||"UNFILED")}</div><h1>${esc(p.name)}</h1>${p.native_name?`<div class="native-name">${esc(p.native_name)}</div>`:""}<div class="code">${esc(p.codename)}</div><div class="detail-tags">${p.tags.map(t=>`<span class="tag-chip">#${esc(t)}</span>`).join("")}</div></div></div>${profileGrid(p)}<div class="detail-body">${sections}</div>`;window.scrollTo(0,0);closeSide()}
async function copyPrompt(i,si,b){await navigator.clipboard.writeText(state.posts[i].sections[si].content);b.textContent="COPIED";setTimeout(()=>b.textContent="COPY",1000)}
let customCount=0;
function field(id,label,val="",cls=""){return`<div class="field ${cls}"><label>${label}</label><input id="${id}" value="${esc(val||"")}"></div>`}
function editor(prefill=null){navActive("");setCrumb(prefill?"EDIT ENTRY":"NEW ENTRY");const p=prefill||{tags:[],sections:[],updated:new Date().toISOString().slice(0,10)};contentEl.innerHTML=`<div class="editor-wrap"><div class="eyebrow">✦ Archive Editor</div><h1 class="editor-title">${prefill?"Edit":"New"} Persona</h1><div class="form-grid">
${field("name","NAME",p.name)}${field("native_name","NATIVE NAME",p.native_name)}${field("codename","CODENAME",p.codename)}${field("world","WORLD",p.world)}${field("tags","TAGS · comma separated",(p.tags||[]).join(", "))}${field("image","IMAGE PATH",p.image)}
<div class="editor-subhead">PROFILE</div>${field("age","AGE",p.age)}${field("gender","GENDER",p.gender)}${field("birthday","BIRTHDAY",p.birthday)}${field("height","HEIGHT",p.height)}${field("nationality","NATIONALITY",p.nationality)}${field("partner","PARTNER",p.partner)}
<div class="editor-subhead">FREE SECTIONS</div><div id="sectionsHost" class="field full"></div></div>
<div class="editor-actions"><button class="action-btn" onclick="addSection()">＋ ADD SECTION</button><button class="action-btn primary" onclick="downloadMd()">DOWNLOAD .MD</button><button class="action-btn" onclick="importMdEl.click()">IMPORT .MD</button><button class="action-btn" onclick="previewEditor()">PREVIEW</button></div><div class="editor-note">v0.2에서는 PROFILE만 고정 항목이며, 아래 섹션은 CHARACTER / BACKGROUND / RELATIONSHIP / PROMPT 등 원하는 제목으로 자유롭게 추가할 수 있습니다.</div></div>`;(p.sections||[]).forEach(s=>addSection(s.title,s.content));if(!p.sections?.length){addSection("CHARACTER","");addSection("BACKGROUND","");addSection("AI CHAT PROMPT","")}closeSide()}
function addSection(title="",body=""){const id=customCount++;const wrap=document.createElement("div");wrap.className="custom-section";wrap.dataset.section=id;wrap.innerHTML=`<input class="section-title" placeholder="SECTION TITLE" value="${esc(title)}"><button class="remove-section" onclick="this.parentElement.remove()">✕</button><textarea class="section-body" placeholder="내용을 입력하세요.">${esc(body)}</textarea>`;document.getElementById("sectionsHost").appendChild(wrap)}
function buildMd(){const v=id=>document.getElementById(id)?.value.trim()||"";const tags=v("tags").split(",").map(x=>x.trim()).filter(Boolean);const sections=[...document.querySelectorAll(".custom-section")].map(x=>[x.querySelector(".section-title").value.trim(),x.querySelector(".section-body").value.trim()]).filter(x=>x[0]&&x[1]);return`---\nname: ${v("name")}\nnative_name: ${v("native_name")}\ncodename: ${v("codename")}\nworld: ${v("world")}\ntags: [${tags.join(", ")}]\nimage: ${v("image")}\nupdated: ${new Date().toISOString().slice(0,10)}\nage: ${v("age")}\ngender: ${v("gender")}\nbirthday: ${v("birthday")}\nheight: ${v("height")}\nnationality: ${v("nationality")}\npartner: ${v("partner")}\n---\n\n${sections.map(([h,b])=>`# ${h}\n${b}`).join("\n\n")}\n`}
function downloadMd(){const md=buildMd(),name=(document.getElementById("codename").value||document.getElementById("name").value||"persona").trim().toLowerCase().replace(/[^a-z0-9가-힣_-]+/g,"-");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([md],{type:"text/markdown;charset=utf-8"}));a.download=name+".md";a.click();URL.revokeObjectURL(a.href)}
function previewEditor(){const p=parseFrontMatter(buildMd());state.posts.push(p);showDetail(state.posts.length-1);state.posts.pop()}
function closeSide(){sidebarEl.classList.remove("open")}
document.querySelectorAll(".nav-item").forEach(b=>b.onclick=()=>b.dataset.view==="home"?showHome():showPersonas());searchInputEl.addEventListener("input",e=>{state.query=e.target.value.trim();showPersonas()});newEntryBtnEl.onclick=()=>editor();menuBtnEl.onclick=()=>sidebarEl.classList.toggle("open");themeBtnEl.onclick=()=>document.body.classList.toggle("light");importMdEl.onchange=async e=>{const f=e.target.files[0];if(f)editor(parseFrontMatter(await f.text()));e.target.value=""};loadPosts();