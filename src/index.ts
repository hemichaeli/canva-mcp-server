import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import { registerAssetTools } from "./tools/assets.js";
import { registerDesignTools } from "./tools/designs.js";
import { registerCommentTools } from "./tools/comments.js";
import { registerExportImportTools } from "./tools/exports-imports.js";
import { registerFolderTools } from "./tools/folders.js";
import {
  registerBrandTemplateTools,
  registerAutofillTools,
  registerResizeTools,
  registerUserTools,
  registerAuthTools,
} from "./tools/misc.js";

function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "canva-mcp-server",
    version: "1.0.0",
  });

  registerAssetTools(server);
  registerDesignTools(server);
  registerCommentTools(server);
  registerExportImportTools(server);
  registerFolderTools(server);
  registerBrandTemplateTools(server);
  registerAutofillTools(server);
  registerResizeTools(server);
  registerUserTools(server);
  registerAuthTools(server);

  return server;
}

const app = express();

// SSE transport - /sse + /messages (do NOT use express.json() on /messages)
const sseTransports = new Map<string, SSEServerTransport>();

app.get("/sse", async (req, res) => {
  const transport = new SSEServerTransport("/messages", res);
  const server = createMcpServer();
  sseTransports.set(transport.sessionId, transport);
  res.on("close", () => {
    sseTransports.delete(transport.sessionId);
  });
  await server.connect(transport);
});

app.post("/messages", async (req, res) => {
  const sessionId = req.query.sessionId as string;
  const transport = sseTransports.get(sessionId);
  if (!transport) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  await transport.handlePostMessage(req, res);
});

// Streamable HTTP transport - /mcp
app.use("/mcp", express.json());

app.post("/mcp", async (req, res) => {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  const server = createMcpServer();
  res.on("close", () => transport.close());
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", server: "canva-mcp-server", version: "1.0.0" });
});

const port = parseInt(process.env.PORT || "3000");
app.listen(port, () => {
  console.error(`Canva MCP server running on port ${port}`);
  console.error(`SSE endpoint: http://localhost:${port}/sse`);
  console.error(`Streamable HTTP endpoint: http://localhost:${port}/mcp`);
});
