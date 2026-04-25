import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { canvaRequest, formatResult, getAccessToken } from "../services/canva-client.js";

export function registerDesignTools(server: McpServer): void {
  server.registerTool(
    "canva_list_designs",
    {
      title: "List Designs",
      description: "List designs for the authenticated user, with optional search query and pagination.",
      inputSchema: {
        query: z.string().optional().describe("Search query string"),
        continuation: z.string().optional().describe("Continuation token for pagination"),
        ownership: z.enum(["owned", "shared", "any"]).optional().describe("Filter by ownership"),
        sortBy: z.enum(["relevance", "modified_descending", "modified_ascending", "title_descending", "title_ascending"]).optional().describe("Sort order"),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    },
    async ({ query, continuation, ownership, sortBy }) => {
      const token = getAccessToken();
      const res = await canvaRequest("GET", "/v1/designs", token, undefined, {
        query, continuation, ownership, sort_by: sortBy,
      });
      return { content: [{ type: "text", text: formatResult(res.data, res.error) }] };
    }
  );

  server.registerTool(
    "canva_create_design",
    {
      title: "Create Design",
      description: "Create a new Canva design with optional title, design type, and dimensions.",
      inputSchema: {
        designType: z.string().optional().describe("Design type (e.g. 'presentation', 'doc', 'instagram_post')"),
        title: z.string().optional().describe("Title of the design"),
        width: z.number().optional().describe("Width in pixels (for custom size)"),
        height: z.number().optional().describe("Height in pixels (for custom size)"),
        unit: z.enum(["px", "cm", "mm", "in"]).optional().describe("Unit for width/height"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
    },
    async ({ designType, title, width, height, unit }) => {
      const token = getAccessToken();
      const body: Record<string, unknown> = {};
      if (designType) body.design_type = { type: "preset", name: designType };
      if (title) body.title = title;
      if (width && height) body.design_type = { type: "custom", width, height, unit: unit || "px" };
      const res = await canvaRequest("POST", "/v1/designs", token, body);
      return { content: [{ type: "text", text: formatResult(res.data, res.error) }] };
    }
  );

  server.registerTool(
    "canva_get_design",
    {
      title: "Get Design",
      description: "Get details of a specific Canva design by designId.",
      inputSchema: {
        designId: z.string().min(1).describe("The design ID"),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    },
    async ({ designId }) => {
      const token = getAccessToken();
      const res = await canvaRequest("GET", `/v1/designs/${designId}`, token);
      return { content: [{ type: "text", text: formatResult(res.data, res.error) }] };
    }
  );

  server.registerTool(
    "canva_get_design_pages",
    {
      title: "Get Design Pages",
      description: "Get a list of pages in a Canva design.",
      inputSchema: {
        designId: z.string().min(1).describe("The design ID"),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    },
    async ({ designId }) => {
      const token = getAccessToken();
      const res = await canvaRequest("GET", `/v1/designs/${designId}/pages`, token);
      return { content: [{ type: "text", text: formatResult(res.data, res.error) }] };
    }
  );

  server.registerTool(
    "canva_get_design_export_formats",
    {
      title: "Get Design Export Formats",
      description: "Get available export formats for a specific Canva design.",
      inputSchema: {
        designId: z.string().min(1).describe("The design ID"),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    },
    async ({ designId }) => {
      const token = getAccessToken();
      const res = await canvaRequest("GET", `/v1/designs/${designId}/export-formats`, token);
      return { content: [{ type: "text", text: formatResult(res.data, res.error) }] };
    }
  );
}
