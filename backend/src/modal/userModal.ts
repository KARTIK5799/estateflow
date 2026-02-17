import mongoose, { Schema, Document, Types } from "mongoose";
import bcrypt from "bcrypt";
import { Role } from "../enums/role";
import { UserStatus } from "../enums/verificationStatus";


export interface IUser extends Document {
  firstName: string;
  lastName?: string;

  email: string;
  password?: string;
  googleId?: string;

  role: Role;
  companyId?: Types.ObjectId;


  employeeProfileId?: Types.ObjectId;

  status: UserStatus;

  isEmailVerified: boolean;
  lastLoginAt?: Date;
  passwordChangedAt?: Date;

  isDeleted: boolean;

  comparePassword(candidatePassword: string): Promise<boolean>;
}

/* ===========================
   SCHEMA
   =========================== */

const UserSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
    },

    lastName: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      validate: {
        validator: function (value: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
        message: "Invalid email format",
      },
    },

    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters"],
      select: false, 
    },

    googleId: {
      type: String,
      index: true,
    },

    role: {
      type: String,
      enum: Object.values(Role) as string[],
      required: [true, "Role is required"],
      index: true,
    },

    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      index: true,
    },

    employeeProfileId: {
      type: Schema.Types.ObjectId,
      ref: "EmployeeProfile",
      unique: true,
      sparse: true,
    },

    status: {
      type: String,
      enum: UserStatus,
      default: UserStatus.INVITED,
      index: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    lastLoginAt: Date,

    passwordChangedAt: Date,

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

/* ===========================
   PASSWORD HASHING
   =========================== */

UserSchema.pre<IUser>("save", async function () {
  if (!this.isModified("password") || !this.password) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);

  this.passwordChangedAt = new Date();
});

/* ===========================
   PASSWORD COMPARE METHOD
   =========================== */

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

/* ===========================
   BUSINESS RULE VALIDATION
   =========================== */

UserSchema.pre<IUser>("validate", function () {

  if (this.role === Role.PLATFORM_SUPER_ADMIN && this.companyId) {
    throw new Error("Platform super admin cannot belong to a company");
  }

 
  if (this.role !== Role.COMPANY_ADMIN && !this.companyId) {
    throw new Error("User must belong to a company");
  }

 
  if (!this.password && !this.googleId) {
    throw new Error("User must have password or Google login");
  }
});

/* ===========================
   INDEXES
   =========================== */

UserSchema.index({ email: 1 });
UserSchema.index({ companyId: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ isDeleted: 1 });

/* ===========================
   EXPORT
   =========================== */

export default mongoose.model<IUser>("User", UserSchema);
