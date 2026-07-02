const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema(
  {
    visitorId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    ip: {
      type: String,
      default: "Unknown",
    },

    city: {
      type: String,
      default: "Unknown",
    },

    region: {
      type: String,
      default: "Unknown",
    },

    country: {
      type: String,
      default: "Unknown",
    },

    device: {
      type: String,
      default: "Unknown",
    },

    browser: {
      type: String,
      default: "Unknown",
    },

    firstVisit: {
      type: Date,
      default: Date.now,
    },

    lastVisit: {
      type: Date,
      default: Date.now,
    },

    pages: [
      {
        page: {
          type: String,
          required: true,
        },

        visitedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Visitor", visitorSchema);