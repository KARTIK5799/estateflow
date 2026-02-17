import mongoose, { Schema, Document, Types } from "mongoose";
import {
  CompanyEmailType,
  CompanyType,
  IndustryType,
} from "../enums/company";
import {
  SubscriptionPlan,
  SubscriptionStatus,
} from "../enums/subscription";

export interface ICompany extends Document {
  companyName: string;
  legalName: string;

  emails: {
    type: CompanyEmailType;
    email: string;
    isVerified: boolean;
  }[];

  countryCode: string;
  phone?: string;

  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    landmark?: string;
  };

  registrationDetails?: {
    gstNumber?: string;
    panNumber?: string;
    cinNumber?: string;
    taxId?: string;
  };

  companyType?: CompanyType;
  industry?: IndustryType;

  subscription: {
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    maxUsers: number;
    maxProjects: number;
    trialEndsAt?: Date;
    subscriptionEndsAt?: Date;
  };

  policies: {
    allowProjectDeletion: boolean;
    allowUserDeletion: boolean;
    allowDataExport: boolean;
  };

  createdByRole: "SUPER_ADMIN" | "SELF_REGISTERED";

  isVerified: boolean;
  isActive: boolean;
  isDeleted: boolean;

  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>(
  {
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },

    legalName: {
      type: String,
      required: [true, "Legal name is required"],
      trim: true,
    },

    emails: [
      {
        type: {
          type: String,
          enum: Object.values(CompanyEmailType) as string[],
          required: [true, "Email type is required"],
        },
        email: {
          type: String,
          required: [true, "Email is required"],
          lowercase: true,
          trim: true,
        },
        isVerified: {
          type: Boolean,
          default: false,
        },
      },
    ],

    countryCode: {
      type: String,
      required: [true, "Country code is required"],
    },

    phone: {
      type: String,
    },

    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      pincode: String,
      landmark: String,
    },

    registrationDetails: {
      gstNumber: String,
      panNumber: String,
      cinNumber: String,
      taxId: String,
    },

    companyType: {
      type: String,
      enum: Object.values(CompanyType) as string[],
    },

    industry: {
      type: String,
      enum: Object.values(IndustryType) as string[],
    },

    subscription: {
      plan: {
        type: String,
        enum: Object.values(SubscriptionPlan) as string[],
        default: SubscriptionPlan.BASIC,
      },
      status: {
        type: String,
        enum: Object.values(SubscriptionStatus) as string[],
        default: SubscriptionStatus.TRIAL,
      },
      maxUsers: { type: Number, default: 10 },
      maxProjects: { type: Number, default: 3 },
      trialEndsAt: Date,
      subscriptionEndsAt: Date,
    },

    policies: {
      allowProjectDeletion: { type: Boolean, default: false },
      allowUserDeletion: { type: Boolean, default: false },
      allowDataExport: { type: Boolean, default: true },
    },

    createdByRole: {
      type: String,
      enum: ["SUPER_ADMIN", "SELF_REGISTERED"],
      required: [true, "Creator role is required"],
    },

    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);



CompanySchema.pre<ICompany>("validate", function () {
  if (!this.emails || this.emails.length === 0) {
    throw new Error("At least one email is required");
  }

  const hasPrimary = this.emails.some(
    (email) => email.type === CompanyEmailType.PRIMARY
  );

  if (!hasPrimary) {
    throw new Error("At least one PRIMARY email is required");
  }
});



CompanySchema.index({ companyName: 1 });
CompanySchema.index({ "emails.email": 1 });
CompanySchema.index({ isDeleted: 1 });
CompanySchema.index({ isActive: 1 });

export default mongoose.model<ICompany>("Company", CompanySchema);
