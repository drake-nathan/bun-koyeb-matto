import type { Connection } from "mongoose";

import Bugsnag from "@bugsnag/js";
import { optimize } from "svgo";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

import { connectionFactory } from "./db/connectionFactory";
import {
  type ConversionInstance,
  conversionInstanceZod,
} from "./db/conversionInstanceSchema";
import {
  createConversionInstance,
  getLatestConverstionInstance,
  getToken,
  updateConversionInstance,
} from "./db/queries";
import { tokenZod } from "./db/tokenSchema";
import { envVars } from "./env.config";
import { updateCompositeImage } from "./images/updateCompositeImage";

Bugsnag.start({ apiKey: envVars.BUGSNAG_API_KEY });

Bun.serve({
  fetch: async (request) => {
    let conn: Connection | undefined;

    const updateInterval = 30; // minutes

    try {
      // SECTION: Connect to DB
      try {
        conn = await connectionFactory();
      } catch (error) {
        throw new Error("Failed to connect to Cosmos DB.", { cause: error });
      }

      console.info("Connected to Cosmos DB...");

      const url = new URL(request.url);
      const force = url.searchParams.get("force") === "true";
      const projectSlug =
        url.searchParams.get("projectSlug") ?? "100x10x1-a-goerli";

      // SECTION: Get latest conversion instance, if it exists
      let lastConversionInstance: ConversionInstance | undefined;
      try {
        const lastConversionInstanceRaw = await getLatestConverstionInstance(
          conn,
          projectSlug,
        );

        if (lastConversionInstanceRaw) {
          lastConversionInstance = conversionInstanceZod.parse(
            lastConversionInstanceRaw,
          );
        }
      } catch (error) {
        if (error instanceof ZodError) {
          throw new Error("Validation of conversion instance failed.", {
            cause: fromZodError(error),
          });
        }

        throw new Error("Failed to get latest conversion instance.", {
          cause: error,
        });
      }

      if (
        force ||
        !lastConversionInstance ||
        lastConversionInstance.started_at <
          new Date(Date.now() - 1000 * 60 * updateInterval)
      ) {
        const newConversionInstance = await createConversionInstance(
          conn,
          projectSlug,
        );

        lastConversionInstance = conversionInstanceZod.parse(
          newConversionInstance,
        );
      } else {
        const message = `Conversion instance started less than ${updateInterval.toString()} minutes ago, returning current image.`;
        console.info(message);
        return new Response(JSON.stringify(lastConversionInstance), {
          status: 200,
          statusText: message,
        });
      }

      // SECTION: Get and validate token
      const token = await getToken(conn, projectSlug, 0);

      if (!token || !token.svg) {
        return new Response("Token not found, or is missing SVG.", {
          status: 404,
        });
      }

      console.info("Token retrieved, validating with Zod schema...");

      const tokenValidated = tokenZod.parse(token);

      console.info("Token validated, checking if image needs updating...");

      const imageLastUpdated = tokenValidated.image_updated_at;

      // SECTION: Check if image needs updating
      if (
        !force &&
        imageLastUpdated &&
        imageLastUpdated > new Date(Date.now() - 1000 * 60 * updateInterval)
      ) {
        const message = `Image updated less than ${updateInterval.toString()} minutes ago, returning current image.`;
        console.info(message);
        return new Response(JSON.stringify(tokenValidated), {
          status: 200,
          statusText: message,
        });
      }

      // SECTION: Try to update image
      console.info("Optimizing SVG...");

      const svgOptimized = optimize(tokenValidated.svg).data;

      console.info("Attempting to update composite image...");

      const updatedToken = await updateCompositeImage({
        conn,
        projectId: token.project_id,
        projectSlug: token.project_slug,
        svg: svgOptimized,
        tokenId: token.token_id,
      });

      console.info("Composite image updated successfully.");
      await updateConversionInstance(conn, {
        ...lastConversionInstance,
        completed_at: new Date(),
        successful: true,
      });
      return new Response(JSON.stringify(updatedToken), {
        status: 200,
        statusText: "Composite image was successfully updated.",
      });
    } catch (error) {
      Bugsnag.notify(error as Error);

      return new Response(JSON.stringify(error), { status: 500 });
    } finally {
      if (conn) await conn.close();
    }
  },
});
