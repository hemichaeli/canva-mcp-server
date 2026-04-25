import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { canvaRequest, formatResult, getAccessToken } from "../services/canva-client.js";

export function registerCommentTools(server: McpServer): void {
  server.registerTool("canva_create_design_comment", {
    title: "Create Design Comment",
    description: "Create a new comment thread on a Canva design.",
    inputSchema: {
      designId: z.string().min(1).describe("The design ID"),
      message: z.string().min(1).describe("Comment text"),
      pageIndex: z.number().int().optional().describe("Page index (0-based)"),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
  }, async ({ designId, message, pageIndex }) => {
    const token = getAccessToken();
    const body: Record<string, unknown> = { message };
    if (pageIndex !== undefined) body.page_index = pageIndex;
    const res = await canvaRequest("POST", `/v1/designs/${designId}/comments`, token, body);
    return { content: [{ type: "text", text: formatResult(res.data, res.error) }] };
  });

  server.registerTool("canva_get_design_comment", {
    title: "Get Design Comment Thread",
    description: "Get a comment thread on a Canva design by threadId.",
    inputSchema: {
      designId: z.string().min(1).describe("The design ID"),
      threadId: z.string().min(1).describe("The comment thread ID"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  }, async ({ designId, threadId }) => {
    const token = getAccessToken();
    const res = await canvaRequest("GET", `/v1/designs/${designId}/comments/${threadId}`, token);
    return { content: [{ type: "text", text: formatResult(res.data, res.error) }] };
  });

  server.registerTool("canva_list_design_comment_replies", {
    title: "List Design Comment Replies",
    description: "List all replies on a comment thread in a Canva design.",
    inputSchema: {
      designId: z.string().min(1).describe("The design ID"),
      threadId: z.string().min(1).describe("The comment thread ID"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  }, async ({ designId, threadId }) => {
    const token = getAccessToken();
    const res = await canvaRequest("GET", `/v1/designs/${designId}/comments/${threadId}/replies`, token);
    return { content: [{ type: "text", text: formatResult(res.data, res.error) }] };
  });

  server.registerTool("canva_create_design_comment_reply", {
    title: "Create Design Comment Reply",
    description: "Reply to a comment thread on a Canva design.",
    inputSchema: {
      designId: z.string().min(1).describe("The design ID"),
      threadId: z.string().min(1).describe("The comment thread ID"),
      message: z.string().min(1).describe("Reply text"),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
  }, async ({ designId, threadId, message }) => {
    const token = getAccessToken();
    const res = await canvaRequest("POST", `/v1/designs/${designId}/comments/${threadId}/replies`, token, { message });
    return { content: [{ type: "text", text: formatResult(res.data, res.error) }] };
  });

  server.registerTool("canva_get_design_comment_reply", {
    title: "Get Design Comment Reply",
    description: "Get a specific reply in a comment thread on a Canva design.",
    inputSchema: {
      designId: z.string().min(1).describe("The design ID"),
      threadId: z.string().min(1).describe("The comment thread ID"),
      replyId: z.string().min(1).describe("The reply ID"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  }, async ({ designId, threadId, replyId }) => {
    const token = getAccessToken();
    const res = await canvaRequest("GET", `/v1/designs/${designId}/comments/${threadId}/replies/${replyId}`, token);
    return { content: [{ type: "text", text: formatResult(res.data, res.error) }] };
  });

  server.registerTool("canva_create_comment", {
    title: "Create Comment",
    description: "Create a comment using the generic comments endpoint.",
    inputSchema: {
      designId: z.string().min(1).describe("The design ID to comment on"),
      message: z.string().min(1).describe("Comment message"),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
  }, async ({ designId, message }) => {
    const token = getAccessToken();
    const res = await canvaRequest("POST", "/v1/comments", token, { design_id: designId, message });
    return { content: [{ type: "text", text: formatResult(res.data, res.error) }] };
  });

  server.registerTool("canva_create_comment_reply", {
    title: "Create Comment Reply",
    description: "Reply to a comment using the generic replies endpoint.",
    inputSchema: {
      commentId: z.string().min(1).describe("The comment ID to reply to"),
      message: z.string().min(1).describe("Reply message"),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
  }, async ({ commentId, message }) => {
    const token = getAccessToken();
    const res = await canvaRequest("POST", `/v1/comments/${commentId}/replies`, token, { message });
    return { content: [{ type: "text", text: formatResult(res.data, res.error) }] };
  });
}
