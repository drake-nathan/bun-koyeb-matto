import { z } from "zod";
import { type InferSchemaType, Schema } from "mongoose";

export const tokenSchema = new Schema({
  token_id: { type: Number, required: true },
  project_id: { type: Number, required: true },
  project_name: { type: String, required: true },
  project_slug: { type: String, required: true },
  width_ratio: { type: Number },
  height_ratio: { type: Number },
  aspect_ratio: { type: Number, required: true },
  image: { type: String },
  image_mid: { type: String },
  image_small: { type: String },
  image_updated_at: { type: Date },
  svg: { type: String },
});

export type TokenSchema = InferSchemaType<typeof tokenSchema>;

export const tokenZod = z.object({
  token_id: z.number(),
  project_id: z.number(),
  project_name: z.string(),
  project_slug: z.string(),
  width_ratio: z.number().optional(),
  height_ratio: z.number().optional(),
  aspect_ratio: z.number(),
  image: z.string().optional(),
  image_mid: z.string().optional(),
  image_small: z.string().optional(),
  image_updated_at: z.date().optional(),
  svg: z.string(),
});

export type Token = z.infer<typeof tokenZod>;
