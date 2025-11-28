// jamp-core.js — STABLE VERSION 
(async () => {
    const nodes = [
        "https://meogit3.github.io/jamp-node1",
        "https://sensational-flan-f91a18.netlify.app",
        "https://jampcorenodev3.vercel.app",
        "https://meoasisgit1.github.io/jampcorenodefive",
        "https://meogit2.github.io/jampnode3"
    ].filter(Boolean); // Dynamic nodes

    if (nodes.length === 0) {
        console.error("No nodes configured!");
        return;
    }

    console.log(`JAMP CORE LOADED — ${nodes.length} nodes connected`);

    window.JAMP = {
        nodes,
        fallback: () => ({
            set: (k,v) => localStorage.setItem('jamp_'+k, JSON.stringify(v)),
            get: (k) => JSON.parse(localStorage.getItem('jamp_'+k) || 'null'),
            list: () => Object.keys(localStorage).filter(k=>k.startsWith('jamp_')).map(k=>k.slice(5))
        }),

        async call(path, body = null) {
            for (const node of this.nodes) {
                try {
                    const res = await fetch(node + path, body ? {method:'POST',body:JSON.stringify(body),headers:{'Content-Type':'application/json'}} : {});
                    if (res.ok) return await res.json();
                } catch(e) {}
            }
            return this.fallback();
        },

        set: (k,v) => this.call('/api.php?a=set&k='+k, v),
        get: (k) => this.call('/api.php?a=get&k='+k).then(r => r?.value ?? null),
        list: () => this.call('/api.php?a=list').then(r => r || []),

        health: async () => {
            const checks = await Promise.all(this.nodes.map(n => fetch(n+'/health.json').then(r=>r.ok).catch(()=>false)));
            console.log(`JAMP Health: ${checks.filter(Boolean).length}/${this.nodes.length} nodes online`);
        }
    };

    setInterval(JAMP.health, 30000);
    JAMP.health();

    console.log("JAMP CORE READY — Test: await JAMP.set('hello','world')");
})();
