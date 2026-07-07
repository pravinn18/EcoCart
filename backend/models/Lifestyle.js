import mongoose from "mongoose";

const lifestyleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
    },

    subtitle: {
      type: String,
      default: "",
    },

    image: {
      type: String,
      required: true,
    },

    public_id: {
      type: String,
      default: "",
    },

    link: {
      type: String,
      default: "/",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Lifestyle", lifestyleSchema);
