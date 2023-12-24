import Bugsnag from "@bugsnag/js";
import { type Connection } from "mongoose";

import { connectionFactory } from "./db/connectionFactory";
import { getToken } from "./db/queries";
import { tokenZod } from "./db/tokenSchema";
import { envVars } from "./env.config";
import { updateCompositeImage } from "./images/updateCompositeImage";

Bugsnag.start({ apiKey: envVars.BUGSNAG_API_KEY });

Bun.serve({
  fetch: async (request) => {
    let conn: Connection | undefined;

    try {
      conn = await connectionFactory();

      const url = new URL(request.url);
      const force = url.searchParams.get("force") === "true";
      const projectSlug = url.searchParams.get("projectSlug");

      const token = await getToken(conn, projectSlug ?? "100x10x1-a-goerli", 0);

      if (!token || !token.svg) {
        return new Response("Token not found, or is missing SVG.", {
          status: 404,
        });
      }

      const tokenValidated = tokenZod.parse(token);

      const imageLastUpdated = tokenValidated.image_updated_at;

      if (
        !force &&
        imageLastUpdated &&
        imageLastUpdated > new Date(Date.now() - 1000 * 60 * 10)
      ) {
        return new Response(JSON.stringify(tokenValidated), {
          status: 200,
          statusText:
            "Image updated less than 10 minutes ago, returning current image",
        });
      }

      const updatedToken = await updateCompositeImage({
        conn,
        svg: tokenValidated.svg,
        projectId: token.project_id,
        projectSlug: token.project_slug,
        tokenId: token.token_id,
      });

      return new Response(JSON.stringify(updatedToken), { status: 200 });
    } catch (error) {
      Bugsnag.notify(error as Error);

      return new Response(JSON.stringify(error), { status: 500 });
    } finally {
      if (conn) conn.close();
    }
  },
});
