import Lifestyle from "../models/Lifestyle.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

const streamUpload = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "lifestyle",
      },

      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      },
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export const getLifestyle = async (req, res) => {
  try {
    const data = await Lifestyle.find();

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const createLifestyle = async (req, res) => {
  try {
    let image = "";

    let public_id = "";

    if (req.file) {
      const result = await streamUpload(req.file.buffer);

      image = result.secure_url;

      public_id = result.public_id;
    }

    const item = await Lifestyle.create({
      title: req.body.title,

      subtitle: req.body.subtitle,

      link: req.body.link,

      image,

      public_id,
    });

    res.json(item);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteLifestyle = async (req, res) => {
  try {
    const item = await Lifestyle.findById(req.params.id);

    if (item) {
      if (item.public_id) {
        await cloudinary.uploader.destroy(item.public_id);
      }

      await item.deleteOne();
    }

    res.json({
      message: "Deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateLifestyle = async (req, res) => {
  const item = await Lifestyle.findById(req.params.id);

  item.title = req.body.title;

  item.subtitle = req.body.subtitle;

  item.link = req.body.link;

  await item.save();

  res.json(item);
};

export const updateLifestyleImage = async (req, res) => {
  try {
    const item = await Lifestyle.findById(req.params.id);

    if (item.public_id) {
      await cloudinary.uploader.destroy(item.public_id);
    }

    const result = await streamUpload(req.file.buffer);

    item.image = result.secure_url;

    item.public_id = result.public_id;

    await item.save();

    res.json(item);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
