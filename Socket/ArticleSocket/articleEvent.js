const mongoose = require("mongoose");
const ArticleModel = require("../../Models/ArticleModel");

exports.addLike = async (io, socket, data) => {
  const article = await ArticleModel.findById(data.article);
  if (!article) {
    return res.status(404).json({ message: "Not Article Found" });
  }
  if (String(article.user) !== String(data.user)) {
    if (
      !article.like.includes(data.user) &&
      !article.unlike.includes(data.user)
    ) {
      const count = await ArticleModel.findByIdAndUpdate(data.article, {
        $addToSet: { like: data.user },
      });
    }
    if (
      !article.like.includes(data.user) &&
      article.unlike.includes(data.user)
    ) {
      const count = await ArticleModel.findByIdAndUpdate(data.article, {
        $addToSet: { like: data.user },
        $pull: { unlike: data.user },
      });
    }
    if (
      article.like.includes(data.user) &&
      !article.unlike.includes(data.user)
    ) {
      const count = await ArticleModel.findByIdAndUpdate(data.article, {
        $pull: { like: data.user },
      });
    }
  }
};

exports.addUnLike = async (io, socket, data) => {
  const article = await ArticleModel.findById(data.article);
  if (!article) {
    return res.status(404).json({ message: "Not Article Found" });
  }
  if (String(article.user) !== String(data.user)) {
    if (
      !article.unlike.includes(data.user) &&
      !article.like.includes(data.user)
    ) {
      const count = await ArticleModel.findByIdAndUpdate(data.article, {
        $addToSet: { unlike: data.user },
      });
    }
    if (
      !article.unlike.includes(data.user) &&
      article.like.includes(data.user)
    ) {
      const count = await ArticleModel.findByIdAndUpdate(data.article, {
        $addToSet: { unlike: data.user },
        $pull: { like: data.user },
      });
    }
    if (
      article.unlike.includes(data.user) &&
      !article.like.includes(data.user)
    ) {
      const count = await ArticleModel.findByIdAndUpdate(data.article, {
        $pull: { unlike: data.user },
      });
    }
  }
};

exports.get = async (io, socket, id) => {
  const count = await ArticleModel.findById(id);
  socket.broadcast.emit("S2C_GET", count);
  socket.emit("S2C_GET", count);
};
