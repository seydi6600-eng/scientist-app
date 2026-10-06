export default {
  async fetch(request, env, ctx) {
    const SUPABASE_URL = "https://aqgacfnbiktutbkgrakq.supabase.co";

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        }
      });
    }

    const url = new URL(request.url);
    const targetUrl = SUPABASE_URL + url.pathname + url.search;

    const newHeaders = new Headers(request.headers);
    newHeaders.set("Origin", SUPABASE_URL);

    const newRequest = new Request(targetUrl, {
      method: request.method,
      headers: newHeaders,
      body: (request.method !== "GET" && request.method !== "HEAD") 
            ? await request.arrayBuffer() 
            : null,
      redirect: "follow",
    });

    const response = await fetch(newRequest);

    const newResponse = new Response(response.body, response);
    newResponse.headers.set("Access-Control-Allow-Origin", "*");
    newResponse.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    newResponse.headers.set("Access-Control-Allow-Headers", "*");

    return newResponse;
  }
};
