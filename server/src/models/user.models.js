import mongoose from "mongoose";
import bcrypt  from "bcrypt";
import jwt from "jsonwebtoken";
import mongoosePaginate from "mongoose-aggregate-paginate-v2";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is essential"],
      unique: true,
      trim: true,
      index: true, // searching optimized but reduced performance
    },
    email: {
      type: String,
      required: [true, "Email is essential"],
      lowercase: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is essential"],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return ;
  this.password = await bcrypt .hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt .compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id, //MongoDB id of the data
      email: this.email,
      username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    },
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id, //MongoDB id of the data
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    },
  );
};
userSchema.plugin(mongoosePaginate);
export const User = mongoose.model("User", userSchema);
