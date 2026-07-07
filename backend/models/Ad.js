import mongoose from "mongoose";

const adSchema = new mongoose.Schema(
  {
    image: String,

    title: String,

    subtitle: String,

    promotionText: {
      type: String,
      default: "",
    },

    buttonText: {
      type: String,
      default: "Shop Now",
    },

    link: {
      type: String,
      default: "/",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Ad", adSchema);
