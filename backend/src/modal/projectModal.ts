import mongoose, { Schema, Document, Types } from "mongoose";

export type ProjectStatus =
  | "PLANNING"
  | "ACTIVE"
  | "ON_HOLD"
  | "COMPLETED"
  | "CANCELLED";

export type ProjectType =
  | "RESIDENTIAL"
  | "COMMERCIAL"
  | "MIXED_USE"
  | "INFRASTRUCTURE";

export interface IProject extends Document {
  companyId: Types.ObjectId;

  name: string;
  code: string;
  description?: string;

  projectType: ProjectType;
  status: ProjectStatus;

  startDate?: Date;
  expectedCompletionDate?: Date;
  actualCompletionDate?: Date;

  estimatedBudget?: number;
  actualCost?: number;

  location?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  };

  structure?: {
    totalTowers?: number;
    totalFloors?: number;
    totalUnits?: number;
  };

  projectManager?: Types.ObjectId;

  createdBy: Types.ObjectId;

  isDeleted: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company reference is required"],
      index: true,
    },

    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
    },

    code: {
      type: String,
      required: [true, "Project code is required"],
      unique: true,
      trim: true,
    },

    description: {
      type: String,
    },

    projectType: {
      type: String,
      enum: ["RESIDENTIAL", "COMMERCIAL", "MIXED_USE", "INFRASTRUCTURE"],
      required: true,
    },

    status: {
      type: String,
      enum: ["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"],
      default: "PLANNING",
      index: true,
    },

    startDate: Date,
    expectedCompletionDate: Date,
    actualCompletionDate: Date,

    estimatedBudget: {
      type: Number,
      min: [0, "Budget cannot be negative"],
    },

    actualCost: {
      type: Number,
      min: 0,
    },

    location: {
      address: String,
      city: String,
      state: String,
      country: String,
      pincode: String,
    },

    structure: {
      totalTowers: Number,
      totalFloors: Number,
      totalUnits: Number,
    },

    projectManager: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

ProjectSchema.pre<IProject>("validate", function () {
  if (this.actualCompletionDate && !this.startDate) {
    throw new Error("Start date required before completion");
  }

  if (
    this.expectedCompletionDate &&
    this.startDate &&
    this.expectedCompletionDate < this.startDate
  ) {
    throw new Error("Expected completion cannot be before start date");
  }
});

ProjectSchema.index({ companyId: 1 });
ProjectSchema.index({ code: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ isDeleted: 1 });
