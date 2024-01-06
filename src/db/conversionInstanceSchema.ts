import { ObjectId } from "mongodb";
import { type InferSchemaType, Schema } from "mongoose";
import { z } from "zod";

export const conversionInstanceSchema = new Schema({
  completed_at: { type: Date },
  project_slug: { required: true, type: String },
  started_at: { required: true, type: Date },
  successful: { type: Boolean },
});

conversionInstanceSchema.index({ started_at: 1 });

export type ConversionInstanceSchema = InferSchemaType<
  typeof conversionInstanceSchema
>;

export const conversionInstanceZod = z.object({
  _id: z.instanceof(ObjectId),
  completed_at: z.date().optional(),
  project_slug: z.string(),
  started_at: z.date(),
  successful: z.boolean().optional(),
});

export type ConversionInstance = z.infer<typeof conversionInstanceZod>;
