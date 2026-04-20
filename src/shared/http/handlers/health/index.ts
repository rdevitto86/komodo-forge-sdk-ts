/**
 * Health check handler
 * @returns {Response} Response with status 200 and body "OK"
 */
const healthHandler = (): Response => new Response("OK", { 
  status: 200,
  headers: { "Content-Type": "application/json" }
});

export default healthHandler;
