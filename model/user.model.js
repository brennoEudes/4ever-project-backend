import { Schema, model } from "mongoose";

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/gm,
  },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["ADMIN", "USER"], default: "USER" },
  createdAt: { type: Date, default: Date.now() },
  capsulesCreated: [
    { type: Schema.Types.ObjectId, ref: "Capsule" },
  ] /* Relacionamos o modelo do usuário c/ o modelo de cápsulas. Usamos o msm nome do outro model para referenciar! */,
});

export const UserModel = model("User", userSchema);
