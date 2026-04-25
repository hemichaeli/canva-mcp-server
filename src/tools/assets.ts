import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { canvaRequest, formatResult, getAccessToken } from "../services/canva-client.js";

export function registerAssetTools(server: McpServer): void {
  server.registerTool(
    "canva_get_asset",
    {
      title: "Get Asset",
      description: "Retrieve metadata of a Canva asset by its assetId.",
      inputSchema: {
        assetId: z.string().min(1).describe("The ID of the asset"),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    },
    async ({ assetId }) => {
      const token = getAccessToken();
      const res = await canvaRequest("GET", `/v1/assets/${assetId}`, token);
      return { content: [{ type: "text", text: formatResult(res.data, res.error) }] };
    }
  );

  server.registerTool(
    "canva_update_asset",
    {
      title: "Update Asset",
      description: "Update an asset's metadata (name, tags) by assetId.",
      inputSchema: {
        assetId: z.string().min(1).describe("The ID of the asset"),
        name: z.string().optional().describe("New name for the asset"),
        tags: z.array(z.string()).optional().describe("Array of tags"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
    },
    async ({ assetId, name, tags }) => {
      const token = getAccessToken();
      const body: Record<string, unknown> = {};
      if (name !== undefined) body.name = name;
      if (tags !== undefined) body.tags = tags;
      const res = await canvaRequest("PATCH", `/v1/assets/${assetId}`, token, body);
      return { content: [{ type: "text", text: formatResult(res.data, res.error) }] };
    }
  );

  server.registerTool(
    "canva_delete_asset",
    {
      title: "Delete Asset",
      description: "Delete (move to trash) a Canva asset by assetId.",
      inputSchema: {
        assetId: z.string().min(1).describe("The ID of the asset"),
      },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
    },
    async ({ assetId }) => {
      const token = getAccessToken();
      const res = await canvaRequest("DELETE", `/v1/assets/${assetId}`, token);
      return { content: [{ type: "text", text: res.error ? `Error: ${res.error}` : "Asset deleted successfully." }] };
    }
  );

  server.registerTool(
    "canva_create_asset_upload",
    {
      title: "Create Asset Upload Job",
      description: "Initiate an asset upload job. Returns a job ID and upload URL for uploading a file to Canva.",
      inputSchema: {
        name: z.string().min(1).describe("Name for the uploaded asset"),
        mimeType: z.string().optional().describe("MIME type of the file (e.g. image/png)"),
        folderId: z.string().optional().describe("Folder ID to upload into"),
        tags: z.array(z.string()).optional().describe("Tags for the asset"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
    },
    async ({ name, mimeType, folderId, tags }) => {
      const token = getAccessToken();
      const body: Record<string, unknown> = { name };
      if (mimeType) body.mime_type = mimeType;
      if (folderId) body.parent_folder_id = folderId;
      if (tags) body.tags = tags;
      const res = await canvaRequest("POST", "/v1/asset-uploads", token, body);
      return { content: [{ type: "text", text: formatResult(res.data, res.error) }] };
    }
  );

  server.registerTool(
    "canva_get_asset_upload",
    {
      title: "Get Asset Upload Job",
      description: "Get the status of an asset upload job by jobId.",
      inputSchema: {
        jobId: z.string().min(1).describe("The upload job ID"),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    },
    async ({ jobId }) => {
      const token = getAccessToken();
      const res = await canvaRequest("GET", `/v1/asset-uploads/${jobId}`, token);
      return { content: [{ type: "text", text: formatResult(res.data, res.error) }] };
    }
  );

  server.registerTool(
    "canva_create_url_asset_upload",
    {
      title: "Create URL Asset Upload Job",
      description: "Upload an asset to Canva from a public URL.",
      inputSchema: {
        url: z.string().url().describe("Public URL of the asset to upload"),
        name: z.string().min(1).describe("Name for the uploaded asset"),
        folderId: z.string().optional().describe("Folder ID to upload into"),
        tags: z.array(z.string()).optional().describe("Tags for the asset"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
    },
    async ({ url, name, folderId, tags }) => {
      const token = getAccessToken();
      const body: Record<string, unknown> = { url, name };
      if (folderId) body.parent_folder_id = folderId;
      if (tags) body.tags = tags;
      const res = await canvaRequest("POST", "/v1/url-asset-uploads", token, body);
      return { content: [{ type: "text", text: formatResult(res.data, res.error) }] };
    }
  );

  server.registerTool(
    "canva_get_url_asset_upload",
    {
      title: "Get URL Asset Upload Job",
      description: "Get the status of a URL asset upload job by jobId.",
      inputSchema: {
        jobId: z.string().min(1).describe("The URL upload job ID"),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    },
    async ({ jobId }) => {
      const token = getAccessToken();
      const res = await canvaRequest("GET", `/v1/url-asset-uploads/${jobId}`, token);
      return { content: [{ type: "text", text: formatResult(res.data, res.error) }] };
    }
  );
}
