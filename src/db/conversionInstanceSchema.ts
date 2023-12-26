import { ObjectId } from "mongodb";
import { type InferSchemaType, Schema } from "mongoose";
import { z } from "zod";

export const conversionInstanceSchema = new Schema({
  started_at: { type: Date, required: true },
  completed_at: { type: Date },
  project_slug: { type: String, required: true },
  successful: { type: Boolean },
});

export type ConversionInstanceSchema = InferSchemaType<
  typeof conversionInstanceSchema
>;

export const conversionInstanceZod = z.object({
  _id: z.instanceof(ObjectId),
  started_at: z.date(),
  completed_at: z.date().optional(),
  project_slug: z.string(),
  successful: z.boolean().optional(),
});

export type ConversionInstance = z.infer<typeof conversionInstanceZod>;
