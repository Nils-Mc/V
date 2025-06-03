export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Logging bei Besuch von /log
    if (url.pathname === "/log") {
      const ip = request.headers.get("cf-connecting-ip") || "Unknown";
      const ua = request.headers.get("user-agent") || "N/A";
      const time = new Date().toISOString();

      // Vorhandene Logs abrufen
      let logs = await env.VISIT_LOGS.get("entries");
      logs = logs ? JSON.parse(logs) : [];

      logs.push({ ip, ua, time });

      // Maximal 100 Einträge speichern
      await env.VISIT_LOGS.put("entries", JSON.stringify(logs.slice(-100)));

      return new Response("Logged.", { status: 200 });
    }

    // Besucherliste abrufen
    if (url.pathname === "/visits") {
      const logs = await env.VISIT_LOGS.get("entries");
      return new Response(logs || "[]", {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Statische Dateien von Cloudflare Pages bereitstellen
    return fetch(`https://how2virus.de${url.pathname}`);
  }
};
