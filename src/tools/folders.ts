import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { canvaRequest, formatResult, getAccessToken } from "../services/canva-client.js";

export function registerFolderTools(server: McpServer): void {
  server.registerTool("canva_create_folder", {
    title: "Create Folder",
    description: "Create a new folder in Canva.",
    inputSchema: {
      name: z.string().min(1).describe("Name of the folder"),
      parentFolderId: z.string().optional().describe("Parent folder ID (optional)"),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
  }, async ({ name, parentFolderId }) => {
    const token = getAccessToken();
    const body: Record<string, unknown> = { name };
    if (parentFolderId) body.parent_folder_id = parentFolderId;
    const res = await canvaRequest("POST", "/v1/folders", token, body);
    return { content: [{ type: "text", text: formatResult(res.data, res.error) }] };
  });

  server.registerTool("canva_get_folder", {
    title: "Get Folder",
    description: "Get details of a Canva folder by folderId.",
    inputSchema: {
      folderId: z.string().min(1).describe("The folder ID"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  }, async ({ folderId }) => {
    const token = getAccessToken();
    const res = await canvaRequest("GET", `/v1/folders/${folderId}`, token);
    return { content: [{ type: "text", text: formatResult(res.data, res.error) }] };
  });

  server.registerTool("canva_update_folder", {
    title: "Update Folder",
    description: "Update a Canva folder's name by folderId.",
    inputSchema: {
      folderId: z.string().min(1).describe("The folder ID"),
      name: z.string().min(1).describe("New name for the folder"),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
  }, async ({ folderId, name }) => {
    const token = getAccessToken();
    const res = await canvaRequest("PATCH", `/v1/folders/${folderId}`, token, { name });
    return { content: [{ type: "text", text: formatResult(res.data, res.error) }] };
  });

  server.registerTool("canva_delete_folder", {
    title: "Delete Folder",
    description: "Delete a Canva folder by folderId. Moves it to trash.",
    inputSchema: {
      folderId: z.string().min(1).describe("The folder ID"),
    },
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  }, async ({ folderId }) => {
    const token = getAccessToken();
    const res = await canvaRequest("DELETE", `/v1/folders/${folderId}`, token);
    return { content: [{ type: "text", text: res.error ? `Error: ${res.error}` : "Folder deleted successfully." }] };
  });

  server.registerTool("canva_list_folder_items", {
    title: "List Folder Items",
    description: "List the items (designs, assets, sub-folders) inside a Canva folder.",
    inputSchema: {
      folderId: z.string().min(1).describe("The folder ID"),
      continuation: z.string().optional().describe("Continuation token for pagination"),
      itemType: z.enum(["folder", "design", "image", "video"]).optional().describe("Filter by item type"),
      sortBy: z.enum(["modified_descending", "modified_ascending", "title_descending", "title_ascending"]).optional().describe("Sort order"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  }, async ({ folderId, continuation, itemType, sortBy }) => {
    const token = getAccessToken();
    const res = await canvaRequest("GET", `/v1/folders/${folderId}/items`, token, undefined, {
      continuation, item_type: itemType, sort_by: sortBy,
    });
    return { content: [{ type: "text", text: formatResult(res.data, res.error) }] };
  });

  server.registerTool("canva_move_to_folder", {
    title: "Move Item to Folder",
    description: "Move a design or asset into a specific Canva folder.",
    inputSchema: {
      itemId: z.string().min(1).describe("The item ID (design or asset) to move"),
      folderId: z.string().min(1).describe("The target folder ID"),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
  }, async ({ itemId, folderId }) => {
    const token = getAccessToken();
    const res = await canvaRequest("POST", "/v1/folders/move", token, { item_id: itemId, folder_id: folderId });
    return { content: [{ type: "text", text: res.error ? `Error: ${res.error}` : "Item moved successfully." }] };
  });
}
