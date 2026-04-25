import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { canvaRequest, formatResult, getAccessToken } from "../services/canva-client.js";

export function registerExportImportTools(server: McpServer): void {
  server.registerTool("canva_create_export", {
    title: "Create Export Job",
    description: "Export a Canva design to a file format (PDF, PNG, JPG, SVG, PPTX, MP4, GIF, etc.).",
    inputSchema: {
      designId: z.string().min(1).describe("The design ID to export"),
      format: z.enum(["pdf", "png", "jpg", "svg", "pptx", "mp4", "gif"]).describe("Export format"),
      exportQuality: z.enum(["regular", "professional", "ultra"]).optional().describe("Export quality (pdf only)"),
      pageRange: z.object({
        from: z.number().int().min(1).optional(),
        to: z.number().int().min(1).optional(),
      }).optional().describe("Page range to export"),
      exportBleed: z.boolean().optional().describe("Include bleed in export (pdf only)"),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
  }, async ({ designId, format, exportQuality, pageRange, exportBleed }) => {
    const token = getAccessToken();
    const formatObj: Record<string, unknown> = { type: format };
    if (exportQuality) formatObj.quality = exportQuality;
    if (exportBleed !== undefined) formatObj.export_bleed = exportBleed;
    const body: Record<string, unknown> = { design_id: designId, format: formatObj };
    if (pageRange) body.page_range = pageRange;
    const res = await canvaRequest("POST", "/v1/exports", token, body);
    return { content: [{ type: "text", text: formatResult(res.data, res.error) }] };
  });

  server.registerTool("canva_get_export", {
    title: "Get Export Job",
    description: "Get the status and result of an export job by exportId.",
    inputSchema: {
      exportId: z.string().min(1).describe("The export job ID"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  }, async ({ exportId }) => {
    const token = getAccessToken();
    const res = await canvaRequest("GET", `/v1/exports/${exportId}`, token);
    return { content: [{ type: "text", text: formatResult(res.data, res.error) }] };
  });

  server.registerTool("canva_create_import", {
    title: "Create Design Import Job",
    description: "Import a design file into Canva (e.g. PPTX, PDF). Returns a job ID to poll.",
    inputSchema: {
      title: z.string().optional().describe("Title for the imported design"),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
  }, async ({ title }) => {
    const token = getAccessToken();
    const body: Record<string, unknown> = {};
    if (title) body.title = title;
    const res = await canvaRequest("POST", "/v1/imports", token, body);
    return { content: [{ type: "text", text: formatResult(res.data, res.error) }] };
  });

  server.registerTool("canva_get_import", {
    title: "Get Design Import Job",
    description: "Get the status and result of a design import job by jobId.",
    inputSchema: {
      jobId: z.string().min(1).describe("The import job ID"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  }, async ({ jobId }) => {
    const token = getAccessToken();
    const res = await canvaRequest("GET", `/v1/imports/${jobId}`, token);
    return { content: [{ type: "text", text: formatResult(res.data, res.error) }] };
  });

  server.registerTool("canva_create_url_import", {
    title: "Create URL Design Import Job",
    description: "Import a design from a public URL into Canva.",
    inputSchema: {
      url: z.string().url().describe("Public URL of the file to import"),
      title: z.string().optional().describe("Title for the imported design"),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
  }, async ({ url, title }) => {
    const token = getAccessToken();
    const body: Record<string, unknown> = { url };
    if (title) body.title = title;
    const res = await canvaRequest("POST", "/v1/url-imports", token, body);
    return { content: [{ type: "text", text: formatResult(res.data, res.error) }] };
  });

  server.registerTool("canva_get_url_import", {
    title: "Get URL Design Import Job",
    description: "Get the status and result of a URL design import job by jobId.",
    inputSchema: {
      jobId: z.string().min(1).describe("The URL import job ID"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  }, async ({ jobId }) => {
    const token = getAccessToken();
    const res = await canvaRequest("GET", `/v1/url-imports/${jobId}`, token);
    return { content: [{ type: "text", text: formatResult(res.data, res.error) }] };
  });
}
