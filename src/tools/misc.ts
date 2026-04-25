import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { canvaRequest, formatResult, getAccessToken } from "../services/canva-client.js";

export function registerBrandTemplateTools(server: McpServer): void {
  server.registerTool("canva_list_brand_templates", {
    title: "List Brand Templates",
    description: "List brand templates available to the user.",
    inputSchema: {
      query: z.string().optional().describe("Search query"),
      continuation: z.string().optional().describe("Continuation token for pagination"),
      ownership: z.enum(["owned", "shared", "any"]).optional().describe("Filter by ownership"),
      sortBy: z.enum(["relevance", "modified_descending", "modified_ascending", "title_descending", "title_ascending"]).optional().describe("Sort order"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  }, async ({ query, continuation, ownership, sortBy }) => {
    const token = getAccessToken();
    const res = await canvaRequest("GET", "/v1/brand-templates", token, undefined, {
      query, continuation, ownership, sort_by: sortBy,
    });
    return { content: [{ type: "text", text: formatResult(res.data, res.error) }] };
  });

  server.registerTool("canva_get_brand_template", {
    title: "Get Brand Template",
    description: "Get details of a specific brand template by brandTemplateId.",
    inputSchema: {
      brandTemplateId: z.string().min(1).describe("The brand template ID"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  }, async ({ brandTemplateId }) => {
    const token = getAccessToken();
    const res = await canvaRequest("GET", `/v1/brand-templates/${brandTemplateId}`, token);
    return { content: [{ type: "text", text: formatResult(res.data, res.error) }] };
  });

  server.registerTool("canva_get_brand_template_dataset", {
    title: "Get Brand Template Dataset",
    description: "Get the dataset (autofill field structure) of a brand template.",
    inputSchema: {
      brandTemplateId: z.string().min(1).describe("The brand template ID"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  }, async ({ brandTemplateId }) => {
    const token = getAccessToken();
    const res = await canvaRequest("GET", `/v1/brand-templates/${brandTemplateId}/dataset`, token);
    return { content: [{ type: "text", text: formatResult(res.data, res.error) }] };
  });
}

export function registerAutofillTools(server: McpServer): void {
  server.registerTool("canva_create_autofill", {
    title: "Create Autofill Job",
    description: "Create an autofill job to populate a brand template with data. Returns a job ID to poll.",
    inputSchema: {
      brandTemplateId: z.string().min(1).describe("Brand template ID"),
      title: z.string().optional().describe("Title for the generated design"),
      data: z.record(z.unknown()).describe("Key-value data to populate the template fields"),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
  }, async ({ brandTemplateId, title, data }) => {
    const token = getAccessToken();
    const body: Record<string, unknown> = { brand_template_id: brandTemplateId, data };
    if (title) body.title = title;
    const res = await canvaRequest("POST", "/v1/autofills", token, body);
    return { content: [{ type: "text", text: formatResult(res.data, res.error) }] };
  });

  server.registerTool("canva_get_autofill", {
    title: "Get Autofill Job",
    description: "Get the status and result of an autofill job by jobId.",
    inputSchema: {
      jobId: z.string().min(1).describe("The autofill job ID"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  }, async ({ jobId }) => {
    const token = getAccessToken();
    const res = await canvaRequest("GET", `/v1/autofills/${jobId}`, token);
    return { content: [{ type: "text", text: formatResult(res.data, res.error) }] };
  });
}

export function registerResizeTools(server: McpServer): void {
  server.registerTool("canva_create_resize", {
    title: "Create Resize Job",
    description: "Resize a Canva design to a preset or custom size. Returns a job ID to poll.",
    inputSchema: {
      designId: z.string().min(1).describe("The design ID to resize"),
      designType: z.string().optional().describe("Preset design type name (e.g. 'instagram_post')"),
      width: z.number().optional().describe("Custom width in pixels"),
      height: z.number().optional().describe("Custom height in pixels"),
      unit: z.enum(["px", "cm", "mm", "in"]).optional().describe("Unit for custom dimensions"),
      title: z.string().optional().describe("Title for the resized design"),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
  }, async ({ designId, designType, width, height, unit, title }) => {
    const token = getAccessToken();
    const body: Record<string, unknown> = { design_id: designId };
    if (designType) {
      body.design_type = { type: "preset", name: designType };
    } else if (width && height) {
      body.design_type = { type: "custom", width, height, unit: unit || "px" };
    }
    if (title) body.title = title;
    const res = await canvaRequest("POST", "/v1/resizes", token, body);
    return { content: [{ type: "text", text: formatResult(res.data, res.error) }] };
  });

  server.registerTool("canva_get_resize", {
    title: "Get Resize Job",
    description: "Get the status and result of a resize job by jobId.",
    inputSchema: {
      jobId: z.string().min(1).describe("The resize job ID"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  }, async ({ jobId }) => {
    const token = getAccessToken();
    const res = await canvaRequest("GET", `/v1/resizes/${jobId}`, token);
    return { content: [{ type: "text", text: formatResult(res.data, res.error) }] };
  });
}

export function registerUserTools(server: McpServer): void {
  server.registerTool("canva_get_me", {
    title: "Get Current User",
    description: "Get information about the currently authenticated Canva user.",
    inputSchema: {},
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  }, async () => {
    const token = getAccessToken();
    const res = await canvaRequest("GET", "/v1/users/me", token);
    return { content: [{ type: "text", text: formatResult(res.data, res.error) }] };
  });

  server.registerTool("canva_get_user_profile", {
    title: "Get User Profile",
    description: "Get the profile information of the currently authenticated Canva user.",
    inputSchema: {},
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  }, async () => {
    const token = getAccessToken();
    const res = await canvaRequest("GET", "/v1/users/me/profile", token);
    return { content: [{ type: "text", text: formatResult(res.data, res.error) }] };
  });

  server.registerTool("canva_get_user_capabilities", {
    title: "Get User Capabilities",
    description: "Get the capabilities (features/permissions) of the currently authenticated Canva user.",
    inputSchema: {},
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  }, async () => {
    const token = getAccessToken();
    const res = await canvaRequest("GET", "/v1/users/me/capabilities", token);
    return { content: [{ type: "text", text: formatResult(res.data, res.error) }] };
  });
}

export function registerAuthTools(server: McpServer): void {
  server.registerTool("canva_oauth_token", {
    title: "OAuth Token Exchange",
    description: "Exchange an authorization code or refresh token for an access token.",
    inputSchema: {
      grantType: z.enum(["authorization_code", "refresh_token", "client_credentials"]).describe("OAuth grant type"),
      code: z.string().optional().describe("Authorization code (for authorization_code grant)"),
      refreshToken: z.string().optional().describe("Refresh token (for refresh_token grant)"),
      redirectUri: z.string().optional().describe("Redirect URI used in authorization"),
      codeVerifier: z.string().optional().describe("PKCE code verifier"),
      clientId: z.string().optional().describe("Client ID (overrides env var)"),
      clientSecret: z.string().optional().describe("Client secret (overrides env var)"),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
  }, async ({ grantType, code, refreshToken, redirectUri, codeVerifier, clientId, clientSecret }) => {
    const cid = clientId || process.env.CANVA_CLIENT_ID;
    const cs = clientSecret || process.env.CANVA_CLIENT_SECRET;
    if (!cid || !cs) return { content: [{ type: "text", text: "Error: CANVA_CLIENT_ID and CANVA_CLIENT_SECRET required" }] };
    const params = new URLSearchParams();
    params.append("grant_type", grantType);
    params.append("client_id", cid);
    params.append("client_secret", cs);
    if (code) params.append("code", code);
    if (refreshToken) params.append("refresh_token", refreshToken);
    if (redirectUri) params.append("redirect_uri", redirectUri);
    if (codeVerifier) params.append("code_verifier", codeVerifier);
    try {
      const res = await fetch("https://api.canva.com/rest/v1/oauth/token", {
        method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: params.toString(),
      });
      const data = await res.json();
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (err) {
      return { content: [{ type: "text", text: `Error: ${String(err)}` }] };
    }
  });

  server.registerTool("canva_oauth_introspect", {
    title: "OAuth Token Introspect",
    description: "Introspect an OAuth token to get its metadata and validity.",
    inputSchema: {
      token: z.string().min(1).describe("The token to introspect"),
      tokenTypeHint: z.enum(["access_token", "refresh_token"]).optional().describe("Token type hint"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  }, async ({ token, tokenTypeHint }) => {
    const cid = process.env.CANVA_CLIENT_ID;
    const cs = process.env.CANVA_CLIENT_SECRET;
    if (!cid || !cs) return { content: [{ type: "text", text: "Error: CANVA_CLIENT_ID and CANVA_CLIENT_SECRET required" }] };
    const params = new URLSearchParams({ token, client_id: cid, client_secret: cs });
    if (tokenTypeHint) params.append("token_type_hint", tokenTypeHint);
    try {
      const res = await fetch("https://api.canva.com/rest/v1/oauth/introspect", {
        method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: params.toString(),
      });
      const data = await res.json();
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (err) {
      return { content: [{ type: "text", text: `Error: ${String(err)}` }] };
    }
  });

  server.registerTool("canva_oauth_revoke", {
    title: "OAuth Token Revoke",
    description: "Revoke an OAuth access or refresh token.",
    inputSchema: {
      token: z.string().min(1).describe("The token to revoke"),
      tokenTypeHint: z.enum(["access_token", "refresh_token"]).optional().describe("Token type hint"),
    },
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  }, async ({ token, tokenTypeHint }) => {
    const cid = process.env.CANVA_CLIENT_ID;
    const cs = process.env.CANVA_CLIENT_SECRET;
    if (!cid || !cs) return { content: [{ type: "text", text: "Error: CANVA_CLIENT_ID and CANVA_CLIENT_SECRET required" }] };
    const params = new URLSearchParams({ token, client_id: cid, client_secret: cs });
    if (tokenTypeHint) params.append("token_type_hint", tokenTypeHint);
    try {
      const res = await fetch("https://api.canva.com/rest/v1/oauth/revoke", {
        method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: params.toString(),
      });
      return { content: [{ type: "text", text: res.ok ? "Token revoked successfully." : `Error: ${await res.text()}` }] };
    } catch (err) {
      return { content: [{ type: "text", text: `Error: ${String(err)}` }] };
    }
  });

  server.registerTool("canva_oidc_userinfo", {
    title: "OIDC User Info",
    description: "Get OIDC user info for the authenticated user.",
    inputSchema: {},
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  }, async () => {
    const token = getAccessToken();
    const res = await canvaRequest("GET", "/v1/oidc/userinfo", token);
    return { content: [{ type: "text", text: formatResult(res.data, res.error) }] };
  });

  server.registerTool("canva_get_connect_keys", {
    title: "Get Connect Keys",
    description: "Get the public keys used to verify Canva webhook payloads.",
    inputSchema: {},
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  }, async () => {
    const token = getAccessToken();
    const res = await canvaRequest("GET", "/v1/connect/keys", token);
    return { content: [{ type: "text", text: formatResult(res.data, res.error) }] };
  });

  server.registerTool("canva_get_app_jwks", {
    title: "Get App JWKS",
    description: "Get the JSON Web Key Set (public keys) of a Canva app for verifying JWTs.",
    inputSchema: {
      appId: z.string().min(1).describe("The Canva app ID"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  }, async ({ appId }) => {
    const token = getAccessToken();
    const res = await canvaRequest("GET", `/v1/apps/${appId}/jwks`, token);
    return { content: [{ type: "text", text: formatResult(res.data, res.error) }] };
  });
}
