// Outreach Desk demo: all companies are fictional (.example domains). State lives in memory.
const GATES = {G1:'Sells B2B software',G2:'Series A–C',G3:'100–1,000 staff',G4:'Compliance pressure',G5:'No SOC 2 / ISO yet'};
const S = {
  accounts:[
    {n:'Ledgerly',d:'ledgerly.example',g:'ppppp',score:11,c:['Priya Natarajan','VP Engineering'],st:'Draft ready',hook:'your recent enterprise-tier launch',ev:'Careers page lists "SOC 2 readiness" among 3 open security roles.'},
    {n:'Shiftwise',d:'shiftwise.example',g:'ppppp',score:9,c:['Dana Ortiz','Head of Security'],st:'Replied',hook:'the Series B announcement',ev:'Press release cites healthcare customers requiring audits.'},
    {n:'Routeline',d:'routeline.example',g:'ppppp',score:7,c:['Sam Iyer','CTO'],st:'Draft ready',hook:'your new EU data-center region',ev:'Blog post mentions upcoming ISO 27001 plans.'},
    {n:'Cartwheel',d:'cartwheel.example',g:'pfuuu',score:0,st:'Not a fit',fail:'G2'},
    {n:'Glasswing',d:'glasswing.example',g:'pppfu',score:0,st:'Not a fit',fail:'G5'},
    {n:'Northbeam Labs',d:'northbeam.example',g:'pffuu',score:0,st:'Not a fit',fail:'G2'},
    {n:'Pinecrest',d:'pinecrest.example',g:'ppfuu',score:0,st:'Not a fit',fail:'G3'},
    {n:'Haulr',d:'haulr.example',g:'ppppf',score:0,st:'Not a fit',fail:'G5'},
    {n:'Mintbox',d:'mintbox.example',g:'ppupu',score:0,st:'Needs a look'},
    {n:'Tidepool',d:'tidepool.example',g:'pppuu',score:0,st:'Needs a look'},
    {n:'Orbital Pay',d:'orbitalpay.example',g:'pfuuu',score:0,st:'Not a fit',fail:'G2'}
  ],
  replies:[
    {from:'Dana Ortiz · Shiftwise',text:'Interesting timing. Can you send over how this differs from what our auditor already uses? Also not sure I\'m the right owner, maybe loop in our GRC lead.',cls:null},
    {from:'Priya Natarajan · Ledgerly',text:'Thursday at 2pm works for a quick call.',cls:null}
  ],
  lessons:[{t:'Lead with the compliance deadline, not the product, when the contact is a Head of Security.',ok:false}]
};
const ICON={p:'g-pass',f:'g-fail',u:'g-unk'};
const $=s=>document.querySelector(s);
let page='overview';
const nav=[['overview','Overview'],['accounts','Accounts'],['find','Find accounts'],['replies','Reply agent'],['learning','Learning']];
function go(p){page=p;render()}
function gates(a){return Object.keys(GATES).map((k,i)=>`<span class="gate ${ICON[a.g[i]]}" title="${GATES[k]}">${k}</span>`).join('')}
function pill(s){return `<span class="pill ${s=='Not a fit'?'no':s=='Needs a look'?'look':'go'}">${s}</span>`}
function draft(a){return `Subject: Quick question about ${a.n}'s security roadmap\n\nHi ${a.c[0].split(' ')[0]},\n\nSaw ${a.hook}. ${a.ev}\nTeams at your stage usually hit two walls: audit prep eating engineering time, and customers asking for reports before you have them.\n\nWorth a 15-minute look? (Draft goes to your own inbox, not the prospect.)\n\n— Sent on behalf of Sprinto`}
function classify(t){t=t.toLowerCase();
  if(/(\d+\s?(am|pm)|works for|book|schedule|tomorrow|thursday|monday|tuesday|wednesday|friday)/.test(t)&&!/\?/.test(t))return['Meeting request','Propose times and book it.'];
  if(/unsubscribe|not interested|stop/.test(t))return['Decline','Log and stop outreach.'];
  return['Unclear','Handed to a human: could not classify with confidence.']}
function render(){
  const A=S.accounts,q=$('#search').value.toLowerCase();
  $('#nav').innerHTML=nav.map(([k,l])=>`<button class="${page==k?'on':''}" onclick="go('${k}')">${l}${k=='accounts'?`<span>${A.length}</span>`:''}${k=='replies'?`<span class="badge">${S.replies.filter(r=>!r.cls).length}</span>`:''}${k=='learning'?`<span class="badge">${S.lessons.filter(l=>!l.ok).length}</span>`:''}</button>`).join('');
  $('#title').textContent=(nav.find(n=>n[0]==page)||[])[1];
  const qual=A.filter(a=>a.score>0),emailed=A.filter(a=>['Replied','Emailed'].includes(a.st));
  const V={
    overview:()=>`<div class="note">Demo workspace. Every company is fictional (domains end in .example); changes reset on reload.</div>
    <div class="card"><h2>Pipeline</h2><p class="sub">Research → qualify against gates with quoted evidence → find a decision-maker → draft. Nothing goes to a prospect.</p>
    <div class="funnel">${[['Researched',A.length],['Qualified',qual.length],['Verified contact',qual.length],['Emailed',emailed.length],['Replied',S.replies.length],['Meeting booked',S.replies.filter(r=>r.cls=='Meeting request').length]].map(([l,n])=>`<div class="stat"><b>${n}</b><span>${l}</span></div>`).join('')}</div></div>
    <div class="cols"><div class="card"><h2>Top qualified accounts</h2><p class="sub">Ranked by fit score.</p>${table(qual.sort((a,b)=>b.score-a.score))}</div>
    <div class="card"><h2>Needs you</h2><p class="sub">${A.filter(a=>a.st=='Needs a look').length} accounts need a human look · ${S.replies.filter(r=>!r.cls).length} replies unread · ${S.lessons.filter(l=>!l.ok).length} lesson to approve</p>
    <h2>Why accounts were rejected</h2>${['G2','G5','G3'].map(g=>`<div>${GATES[g]} <b>${A.filter(a=>a.fail==g).length}</b></div>`).join('')}</div></div>`,
    accounts:()=>`<div class="card">${table(A.filter(a=>(a.n+a.d).toLowerCase().includes(q)))}</div>`,
    find:()=>`<div class="card"><h2>Find accounts</h2><p class="sub">Enter a company name. The demo agent runs a simulated research + gate check.</p>
    <div class="row"><input id="co" placeholder="Company name"><button class="primary" onclick="addCo()">Research</button></div><div id="out"></div></div>`,
    replies:()=>`<div class="card"><h2>Reply agent</h2><p class="sub">Classifies replies, proposes times, or hands off.</p>${S.replies.map((r,i)=>`<div class="reply"><b>${r.from}</b><div>${r.text}</div>${r.cls?`<p><span class="pill go">${r.cls}</span> ${r.act}</p>`:`<button class="ghost" onclick="cl(${i})">Classify</button>`}</div>`).join('')}</div>`,
    learning:()=>`<div class="card"><h2>Learning</h2><p class="sub">Approved lessons shape the next drafts.</p>${S.lessons.map((l,i)=>`<div class="reply row"><span style="flex:1">${l.t}</span>${l.ok?'<span class="pill go">Approved</span>':`<button class="ghost" onclick="S.lessons[${i}].ok=true;render()">Approve</button>`}</div>`).join('')}</div>`
  };
  $('#view').innerHTML=V[page]();
}
function table(rows){return `<table><tr><th>Company</th><th>Gates</th><th>Score</th><th>Contact</th><th>Status</th></tr>${rows.map(a=>`<tr onclick="show('${a.d}')" style="cursor:pointer"><td><b>${a.n}</b><br><small>${a.d}</small></td><td>${gates(a)}</td><td>${a.score?a.score+'pts':'–'}</td><td>${a.c?a.c[0]+'<br><small>'+a.c[1]+'</small>':'–'}</td><td>${pill(a.st)}</td></tr>`).join('')}</table>`}
function show(d){const a=S.accounts.find(x=>x.d==d);if(!a.c)return;$('#view').innerHTML=`<div class="card"><button class="ghost" onclick="render()">← Back</button><h2>${a.n}</h2><p class="sub">${gates(a)} · evidence: ${a.ev}</p><b>Draft email</b><div class="draft">${draft(a)}</div></div>`}
function cl(i){const [c,a]=classify(S.replies[i].text);S.replies[i].cls=c;S.replies[i].act=a;render()}
function addCo(){const n=$('#co').value.trim();if(!n)return;const seed=[...n].reduce((s,c)=>s+c.charCodeAt(0),0);
  const g=[...'ppppp'].map((_,i)=>(seed>>i)%5==0?'f':(seed>>i)%7==0?'u':'p').join('');
  const fail=g.indexOf('f');const ok=fail<0&&!g.includes('u');
  const a={n,d:n.toLowerCase().replace(/\W/g,'')+'.example',g,score:ok?5+seed%7:0,st:ok?'Draft ready':fail>=0?'Not a fit':'Needs a look',fail:fail>=0?'G'+(fail+1):undefined};
  if(ok){a.c=['Alex Rivera','VP Engineering'];a.hook='your latest funding news';a.ev='Quoted from a public job post (simulated).'}
  S.accounts.unshift(a);$('#out').innerHTML=`<p><b>${n}</b> ${gates(a)} ${pill(a.st)}</p>`;
  $('#nav').querySelector('span').textContent=S.accounts.length}
$('#search').addEventListener('input',()=>{if(page!='accounts')page='accounts';render()});
render();
