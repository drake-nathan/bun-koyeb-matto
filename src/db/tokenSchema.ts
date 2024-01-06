import { type InferSchemaType, Schema } from "mongoose";
import { z } from "zod";

export const tokenSchema = new Schema({
  aspect_ratio: { required: true, type: Number },
  height_ratio: { type: Number },
  image: { type: String },
  image_mid: { type: String },
  image_small: { type: String },
  image_updated_at: { type: Date },
  project_id: { required: true, type: Number },
  project_name: { required: true, type: String },
  project_slug: { required: true, type: String },
  svg: { type: String },
  token_id: { required: true, type: Number },
  width_ratio: { type: Number },
});

export type TokenSchema = InferSchemaType<typeof tokenSchema>;

export const tokenZod = z.object({
  aspect_ratio: z.number(),
  height_ratio: z.number().optional(),
  image: z.string().optional(),
  image_mid: z.string().optional(),
  image_small: z.string().optional(),
  image_updated_at: z.date().optional(),
  project_id: z.number(),
  project_name: z.string(),
  project_slug: z.string(),
  svg: z.string(),
  token_id: z.number(),
  width_ratio: z.number().optional(),
});

export type Token = z.infer<typeof tokenZod>;
