import mongoose, { Schema, Document, Types } from "mongoose";
import { Gender } from "../enums/gender";
import { EmployeeStatus } from "../enums/verificationStatus";




export interface IEmployeeProfile extends Document {
  userId: Types.ObjectId;
  companyId: Types.ObjectId;

  employeeCode: string;

  dateOfBirth?: Date;
  gender?: Gender;

  panNumber?: string;
  uanNumber?: string;
  aadhaarNumber?: string;

  bankDetails?: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
  };

  salaryStructure?: {
    basic: number;
    hra?: number;
    allowances?: number;
    pfApplicable: boolean;
    esiApplicable: boolean;
  };

  address?: {
    currentAddress?: string;
    permanentAddress?: string;
  };

  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };

  verificationStatus: EmployeeStatus;

  verifiedByHR?: Types.ObjectId;
  approvedByAdmin?: Types.ObjectId;

  isDeleted: boolean;

  createdAt: Date;
  updatedAt: Date;
}

/* ===========================
   SCHEMA
   =========================== */

const EmployeeProfileSchema = new Schema<IEmployeeProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      unique: true, // 🔥 1-to-1 mapping
      index: true,
    },

    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company reference is required"],
      index: true,
    },

    employeeCode: {
      type: String,
      required: [true, "Employee code is required"],
      unique: true,
      trim: true,
    },

    dateOfBirth: {
      type: Date,
    },

    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
    },

    panNumber: {
      type: String,
      uppercase: true,
      trim: true,
      validate: {
        validator: function (value: string) {
          if (!value) return true;
          return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value);
        },
        message: "Invalid PAN format",
      },
    },

    uanNumber: {
      type: String,
      trim: true,
    },

    aadhaarNumber: {
      type: String,
      trim: true,
    },

    bankDetails: {
      bankName: {
        type: String,
        trim: true,
      },
      accountNumber: {
        type: String,
        trim: true,
      },
      ifscCode: {
        type: String,
        uppercase: true,
        trim: true,
      },
    },

    salaryStructure: {
      basic: {
        type: Number,
        min: [0, "Basic salary cannot be negative"],
      },
      hra: {
        type: Number,
        min: 0,
      },
      allowances: {
        type: Number,
        min: 0,
      },
      pfApplicable: {
        type: Boolean,
        default: false,
      },
      esiApplicable: {
        type: Boolean,
        default: false,
      },
    },

    address: {
      currentAddress: String,
      permanentAddress: String,
    },

    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },

    verificationStatus: {
      type: String,
      enum:EmployeeStatus,
      default: EmployeeStatus.PENDING,
      index: true,
    },

    verifiedByHR: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    approvedByAdmin: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

/* ===========================
   BUSINESS VALIDATION
   =========================== */

EmployeeProfileSchema.pre<IEmployeeProfile>("validate", function () {
  // If HR verified, must have verifiedByHR
  if (
    this.verificationStatus === "HR_VERIFIED" &&
    !this.verifiedByHR
  ) {
    throw new Error("HR verifier reference required");
  }

  // If Admin approved, must have approvedByAdmin
  if (
    this.verificationStatus === "ADMIN_APPROVED" &&
    !this.approvedByAdmin
  ) {
    throw new Error("Admin approval reference required");
  }
});

/* ===========================
   INDEXES
   =========================== */

EmployeeProfileSchema.index({ userId: 1 });
EmployeeProfileSchema.index({ companyId: 1 });
EmployeeProfileSchema.index({ employeeCode: 1 });
EmployeeProfileSchema.index({ verificationStatus: 1 });

export default mongoose.model<IEmployeeProfile>(
  "EmployeeProfile",
  EmployeeProfileSchema
);
