const RAW_CONTACTS = window.RAW_CONTACTS;
const RAW_VISITORS = window.RAW_VISITORS;

(function(){
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const openBtn = document.getElementById('hamburgerBtn');
  const closeBtn = document.getElementById('sidebarClose');

  function openSidebar(){
    sidebar.classList.add('open');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
  function closeSidebar(){
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
    document.body.style.overflow = '';
  }
  openBtn.addEventListener('click', openSidebar);
  closeBtn.addEventListener('click', closeSidebar);
  overlay.addEventListener('click', closeSidebar);

  // close sidebar automatically when a nav item is tapped (mobile)
  document.querySelectorAll('.nav-item[data-target]').forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 900) closeSidebar();
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) closeSidebar();
  });
})();

(function(){
  let current = 'dark';
  function setTheme(t){
    document.body.setAttribute('data-theme', t);
    document.getElementById('themeIcon').className = t==='dark'?'fas fa-moon':'fas fa-sun';
    document.getElementById('sidebarThemeLabel').textContent = t==='dark'?'Dark mode':'Light mode';
    document.getElementById('sidebarThemeToggle').querySelector('i').className = t==='dark'?'fas fa-moon':'fas fa-sun';
  }
  setTheme(current);
  const toggle = () => { current = current==='dark'?'light':'dark'; setTheme(current); };
  document.getElementById('themeToggle').addEventListener('click', toggle);
  document.getElementById('sidebarThemeToggle').addEventListener('click', toggle);
})();

function tickClock(){
  const now = new Date();
  document.getElementById('clockTime').textContent = now.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  document.getElementById('clockDate').textContent = now.toLocaleDateString([],{weekday:'short',year:'numeric',month:'short',day:'numeric'});
}
tickClock(); setInterval(tickClock, 1000);

const pageTitles = {
  overview: ['Dashboard Overview', "Welcome back — here's what's happening with your portfolio."],
  messages: ['Contact Messages', 'Search, filter, sort, and manage incoming messages.'],
  analytics: ['Analytics', 'Visual breakdown of your visitor and message data.'],
};
document.querySelectorAll('.nav-item[data-target]').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item[data-target]').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    const target = item.dataset.target;
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(target).classList.add('active');
    document.getElementById('pageTitle').textContent = pageTitles[target][0];
    document.getElementById('pageSub').textContent = pageTitles[target][1];
    if (target === 'analytics' && !window.__analyticsReady) renderAnalyticsCharts();
  });
});

function toast(msg, type='success'){
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<i class="fas ${type==='success'?'fa-check-circle':'fa-exclamation-circle'}"></i>${msg}`;
  document.getElementById('toastContainer').appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

const chartDefaults = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color:'rgba(255,255,255,0.05)' }, ticks: { color:'#94a3b8', font:{size:10} } },
    y: { grid: { color:'rgba(255,255,255,0.05)' }, ticks: { color:'#94a3b8', font:{size:10} } }
  }
};
const doughnutOpts = {
  responsive:true, maintainAspectRatio:false,
  plugins:{ legend:{ position:'bottom', labels:{ color:'#94a3b8', font:{size:10}, boxWidth:10 } } }
};

(function buildStatusChart(){
  const ctx = document.getElementById('statusChart');
  if (!ctx) return;
  const read = RAW_CONTACTS.filter(c=>c.read).length;
  const unread = RAW_CONTACTS.length - read;
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Read','Unread'],
      datasets:[{ data:[read,unread], backgroundColor:['#06b6d4','#8b5cf6'], borderWidth:0 }]
    },
    options: doughnutOpts
  });
})();

function renderAnalyticsCharts(){
  window.__analyticsReady = true;

  const growth = {};
  RAW_VISITORS.forEach(v => {
    const d = new Date(v.firstVisit);
    const key = d.toLocaleDateString('default',{month:'short',day:'numeric'});
    growth[key] = (growth[key]||0) + 1;
  });
  const gLabels = Object.keys(growth).slice(-30);
  const gData = gLabels.map(k => growth[k]);
  const gc = document.getElementById('growthChart');
  if (gc) new Chart(gc, {
    type:'line',
    data:{ labels:gLabels, datasets:[{ data:gData, borderColor:'#06b6d4', backgroundColor:'rgba(6,182,212,0.15)', fill:true, tension:0.35, pointRadius:3, borderWidth:2 }] },
    options:{ ...chartDefaults }
  });

  const browsers = {};
  RAW_VISITORS.forEach(v => {
    const b = v.browser || 'Unknown';
    browsers[b] = (browsers[b]||0) + 1;
  });
  const bc = document.getElementById('browserChart');
  if (bc) new Chart(bc, {
    type:'doughnut',
    data:{ labels:Object.keys(browsers), datasets:[{ data:Object.values(browsers), backgroundColor:['#8b5cf6','#06b6d4','#fbbf24','#34d399','#f87171','#94a3b8'], borderWidth:0 }] },
    options: doughnutOpts
  });

  const cities = {};
  RAW_VISITORS.forEach(v => {
    const c = v.city || 'Unknown';
    cities[c] = (cities[c]||0) + 1;
  });
  const topCities = Object.entries(cities).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const cc = document.getElementById('citiesChart');
  if (cc) new Chart(cc, {
    type:'bar',
    data:{ labels:topCities.map(c=>c[0]), datasets:[{ data:topCities.map(c=>c[1]), backgroundColor:'rgba(139,92,246,0.6)', borderColor:'#8b5cf6', borderWidth:1, borderRadius:6 }] },
    options:{ ...chartDefaults, indexAxis:'y' }
  });

  const pages = {};
  RAW_VISITORS.forEach(v => (v.pages||[]).forEach(p => { pages[p] = (pages[p]||0) + 1; }));
  const topPages = Object.entries(pages).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const pc = document.getElementById('pagesChart');
  if (pc) new Chart(pc, {
    type:'bar',
    data:{ labels:topPages.map(p=>p[0]), datasets:[{ data:topPages.map(p=>p[1]), backgroundColor:'rgba(6,182,212,0.6)', borderColor:'#06b6d4', borderWidth:1, borderRadius:6 }] },
    options:{ ...chartDefaults }
  });

  const monthly = {};
  RAW_CONTACTS.forEach(c => {
    const d = new Date(c.date);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    monthly[key] = (monthly[key]||0)+1;
  });
  const mLabels = Object.keys(monthly).sort().slice(-12);
  const mData = mLabels.map(k => monthly[k]);
  const ac = document.getElementById('analyticsChart');
  if (ac) new Chart(ac, {
    type:'line',
    data:{ labels:mLabels, datasets:[{ data:mData, borderColor:'#8b5cf6', backgroundColor:'rgba(139,92,246,0.15)', fill:true, tension:0.35, pointRadius:3, borderWidth:2 }] },
    options:{ ...chartDefaults }
  });

  const rc = document.getElementById('readChart');
  const read = RAW_CONTACTS.filter(c=>c.read).length;
  if (rc) new Chart(rc, { type:'doughnut', data:{ labels:['Read','Unread'], datasets:[{ data:[read, RAW_CONTACTS.length-read], backgroundColor:['#34d399','#8b5cf6'], borderWidth:0 }] }, options: doughnutOpts });

  const sc = document.getElementById('starChart');
  const starred = RAW_CONTACTS.filter(c=>c.starred).length;
  if (sc) new Chart(sc, { type:'doughnut', data:{ labels:['Starred','Normal'], datasets:[{ data:[starred, RAW_CONTACTS.length-starred], backgroundColor:['#fbbf24','#94a3b8'], borderWidth:0 }] }, options: doughnutOpts });
}

const table = document.getElementById('msgTable');
if (table) {
  const tbody = table.querySelector('tbody');
  const searchInput = document.getElementById('searchInput');
  const statusFilter = document.getElementById('statusFilter');
  const starFilter = document.getElementById('starFilter');
  const selectAll = document.getElementById('selectAll');
  const bulkBar = document.getElementById('bulkBar');
  const selCountEl = document.getElementById('selCount');
  const pageSize = 10;
  let currentPage = 1;
  let sortState = { key:'date', dir:-1 };

  function dataRows(){ return Array.from(tbody.querySelectorAll('tr:not(.note-row)')); }
  function noteRowFor(id){ return tbody.querySelector(`tr.note-row[data-note-for="${id}"]`); }

  function applyFilters(){
    const term = searchInput.value.trim().toLowerCase();
    const status = statusFilter.value;
    const star = starFilter.value;
    dataRows().forEach(row => {
      const text = row.innerText.toLowerCase();
      let visible = true;
      if (term && !text.includes(term)) visible = false;
      if (status==='unread' && row.dataset.read==='1') visible = false;
      if (status==='read' && row.dataset.read==='0') visible = false;
      if (star==='starred' && row.dataset.starred!=='1') visible = false;
      row.dataset.filtered = visible ? '1' : '0';
    });
    currentPage = 1;
    renderPage();
  }

  function sortRows(){
    const rows = dataRows();
    rows.sort((a,b) => {
      let av, bv;
      if (sortState.key==='date'){ av=+a.dataset.date; bv=+b.dataset.date; }
      else { av=a.dataset[sortState.key].toLowerCase(); bv=b.dataset[sortState.key].toLowerCase(); }
      return av<bv ? -1*sortState.dir : av>bv ? 1*sortState.dir : 0;
    });
    rows.forEach(r => { tbody.appendChild(r); const nr=noteRowFor(r.dataset.id); if(nr) tbody.appendChild(nr); });
  }

  function renderPage(){
    const rows = dataRows();
    const visible = rows.filter(r => r.dataset.filtered!=='0');
    const totalPages = Math.max(1, Math.ceil(visible.length/pageSize));
    if (currentPage>totalPages) currentPage=totalPages;
    rows.forEach(r => { r.classList.add('hidden-row'); const nr=noteRowFor(r.dataset.id); if(nr) nr.classList.add('hidden-row'); });
    visible.slice((currentPage-1)*pageSize, currentPage*pageSize).forEach(r => r.classList.remove('hidden-row'));
    const pag = document.getElementById('pagination');
    pag.innerHTML = '';
    if (totalPages<=1) return;
    const prev = document.createElement('button');
    prev.innerHTML='<i class="fas fa-chevron-left"></i>'; prev.disabled=currentPage===1;
    prev.onclick=()=>{ currentPage--; renderPage(); }; pag.appendChild(prev);
    for (let i=1; i<=totalPages; i++){
      const b=document.createElement('button'); b.textContent=i;
      if(i===currentPage) b.classList.add('active');
      b.onclick=()=>{ currentPage=i; renderPage(); }; pag.appendChild(b);
    }
    const next=document.createElement('button');
    next.innerHTML='<i class="fas fa-chevron-right"></i>'; next.disabled=currentPage===totalPages;
    next.onclick=()=>{ currentPage++; renderPage(); }; pag.appendChild(next);
  }

  function updateBulkBar(){
    const checked=tbody.querySelectorAll('.rowSelect:checked');
    selCountEl.textContent=checked.length;
    bulkBar.classList.toggle('show', checked.length>0);
  }

  searchInput.addEventListener('input', applyFilters);
  statusFilter.addEventListener('change', applyFilters);
  starFilter.addEventListener('change', applyFilters);

  table.querySelectorAll('th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const key=th.dataset.sort;
      sortState.dir=(sortState.key===key) ? -sortState.dir : 1;
      sortState.key=key;
      table.querySelectorAll('th.sortable i').forEach(i=>i.className='fas fa-sort');
      th.querySelector('i').className=sortState.dir===1?'fas fa-sort-up':'fas fa-sort-down';
      sortRows(); renderPage();
    });
  });

  selectAll.addEventListener('change', () => {
    tbody.querySelectorAll('tr:not(.hidden-row):not(.note-row) .rowSelect').forEach(cb=>cb.checked=selectAll.checked);
    updateBulkBar();
  });
  tbody.addEventListener('change', e => { if(e.target.classList.contains('rowSelect')) updateBulkBar(); });

  document.getElementById('exportCsvBtn').addEventListener('click', () => {
    const rows=dataRows().filter(r=>r.dataset.filtered!=='0');
    const header=['Status','Starred','Name','Email','Phone','Subject','Message','Date'];
    const lines=[header.join(',')];
    rows.forEach(r => {
      const cells=r.querySelectorAll('td');
      const vals=[
        r.dataset.read==='1'?'Read':'New', r.dataset.starred==='1'?'Yes':'No',
        cells[3].innerText, cells[4].innerText, cells[5].innerText, cells[6].innerText,
        cells[7].innerText.replace(/[\r\n,]+/g,' '), cells[8].innerText
      ].map(v=>`"${(v||'').replace(/"/g,'""')}"`);
      lines.push(vals.join(','));
    });
    const blob=new Blob([lines.join('\n')],{type:'text/csv'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download=`messages-${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); toast('CSV exported');
  });

  async function markRead(id, row){
    try {
      const res=await fetch(`/admin/messages/${id}/read`,{method:'POST'});
      const r=await res.json();
      if(r.success){
        const btn=row.querySelector('[data-action="toggle-read"]');
        btn.textContent='Read'; btn.classList.remove('unread'); btn.classList.add('read');
        row.classList.remove('unread-row');
        if(row.dataset.read==='0'){
          row.dataset.read='1';
          const el=document.getElementById('ov-unread');
          if(el) el.textContent=Math.max(0,parseInt(el.textContent)-1);
        }
      }
      return r.success;
    } catch { return false; }
  }

  async function toggleStar(id, row, btn){
    try {
      const res=await fetch(`/admin/messages/${id}/star`,{method:'POST'});
      const r=await res.json();
      if(r.success){
        const nowStarred=row.dataset.starred!=='1';
        row.dataset.starred=nowStarred?'1':'0';
        btn.classList.toggle('active',nowStarred);
        btn.querySelector('i').className=(nowStarred?'fas':'far')+' fa-star';
        const el=document.getElementById('ov-starred');
        if(el) el.textContent=Math.max(0,parseInt(el.textContent)+(nowStarred?1:-1));
      }
      return r.success;
    } catch { return false; }
  }

  async function deleteMsg(id, row){
    try {
      const res=await fetch(`/admin/messages/${id}`,{method:'DELETE'});
      const r=await res.json();
      if(r.success){
        row.classList.add('removing');
        const nr=noteRowFor(id);
        setTimeout(()=>{
          row.remove(); if(nr) nr.remove();
          const el=document.getElementById('ov-total');
          if(el) el.textContent=Math.max(0,parseInt(el.textContent)-1);
          if(dataRows().length===0) table.style.display='none'; else renderPage();
        },300);
      }
      return r.success;
    } catch { return false; }
  }

  document.getElementById('markAllReadBtn').addEventListener('click', async () => {
    const unread=dataRows().filter(r=>r.dataset.read==='0');
    if(!unread.length){ toast('Nothing to mark','error'); return; }
    let ok=0; for(const row of unread) if(await markRead(row.dataset.id,row)) ok++;
    toast(`Marked ${ok} message(s) as read`);
  });

  document.getElementById('bulkReadBtn').addEventListener('click', async () => {
    const rows=Array.from(tbody.querySelectorAll('.rowSelect:checked')).map(cb=>cb.closest('tr'));
    let ok=0; for(const row of rows) if(row.dataset.read==='0'&&await markRead(row.dataset.id,row)) ok++;
    toast(`Marked ${ok} message(s) as read`); updateBulkBar();
  });

  document.getElementById('bulkStarBtn').addEventListener('click', async () => {
    const rows=Array.from(tbody.querySelectorAll('.rowSelect:checked')).map(cb=>cb.closest('tr'));
    let ok=0;
    for(const row of rows){
      const btn=row.querySelector('[data-action="toggle-star"]');
      if(row.dataset.starred!=='1'&&await toggleStar(row.dataset.id,row,btn)) ok++;
    }
    toast(`Starred ${ok} message(s)`); updateBulkBar();
  });

  document.getElementById('bulkDeleteBtn').addEventListener('click', async () => {
    const rows=Array.from(tbody.querySelectorAll('.rowSelect:checked')).map(cb=>cb.closest('tr'));
    if(!rows.length) return;
    if(!confirm(`Delete ${rows.length} message(s) permanently?`)) return;
    let ok=0; for(const row of rows) if(await deleteMsg(row.dataset.id,row)) ok++;
    toast(`Deleted ${ok} message(s)`); updateBulkBar();
  });

  /* Save note */
  tbody.addEventListener('click', async e => {
    const saveBtn = e.target.closest('.note-save');
    if (!saveBtn) return;
    const id = saveBtn.dataset.id;
    const textarea = saveBtn.closest('.note-box').querySelector('textarea');
    try {
      const res = await fetch(`/admin/messages/${id}/note`, {
        method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({note:textarea.value})
      });
      const r = await res.json();
      toast(r.success ? 'Note saved' : 'Failed to save note', r.success ? 'success' : 'error');
    } catch { toast('Failed to save note','error'); }
  });

  table.addEventListener('click', async e => {
    const btn = e.target.closest('button');
    if (!btn || btn.classList.contains('note-save')) return;
    const row = btn.closest('tr');
    if (!row || row.classList.contains('note-row')) return;
    const id = row.dataset.id;
    if (btn.dataset.action==='toggle-read'){
      if(row.dataset.read==='1') return;
      if(!await markRead(id,row)) toast('Failed to update','error');
    }
    if (btn.dataset.action==='toggle-star'){
      if(!await toggleStar(id,row,btn)) toast('Failed to update','error');
    }
    if (btn.dataset.action==='toggle-note'){
      const nr=noteRowFor(id);
      if(nr){ nr.classList.toggle('open'); nr.classList.remove('hidden-row'); }
    }
    if (btn.dataset.action==='delete'){
      if(!confirm('Delete this message permanently?')) return;
      const ok=await deleteMsg(id,row);
      toast(ok ? 'Message deleted' : 'Failed to delete', ok ? 'success' : 'error');
    }
  });

  dataRows().forEach(r => r.dataset.filtered='1');
  renderPage();
}