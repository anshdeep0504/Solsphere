const mongoose = require('mongoose');

const machineSchema = new mongoose.Schema(
  {
    machineId: {
      type: String,
      required: true,
      unique: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    osVersion: {
      type: String,
    },
    diskEncryption: {
      type: String,
    },
    antivirus: {
      type: String,
    },
    sleep: {
      type: String,
    },
    cpu: {
      type: String,
    },
    ram: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

machineSchema.index({ machineId: 1, timestamp: -1 });

const Machine = mongoose.model('Machine', machineSchema);

module.exports = Machine;