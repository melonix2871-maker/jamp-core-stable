// jamp-core.js — FINAL DYNAMIC VERSION (uses GitHub Secrets)
(async () => {
    const nodes = [
        process.env.NODE1,
        process.env.NODE2,
        process.env.NODE3,
        process.env.NODE4,
        process.env.NODE5
    ].filter(Boolean); // Remove any empty

    if (nodes.length === 0) {
        console.error("No nodes configured! Add NODE1-NODE5 in GitHub Secrets");
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
