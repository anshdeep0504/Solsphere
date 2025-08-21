const Machine = require('../models/Machine');
const { validationResult } = require('express-validator');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// @desc    Report machine health data
// @route   POST /api/report
// @access  Public
const reportHealthData = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { machineId, osVersion, diskEncryption, antivirus, sleep, cpu, ram } = req.body;

    const machineData = await Machine.create({
      machineId,
      osVersion,
      diskEncryption,
      antivirus,
      sleep,
      cpu,
      ram,
    });

    res.status(201).json(machineData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all machines with latest status
// @route   GET /api/machines
// @access  Public
const getMachines = async (req, res) => {
  try {
    let query = {};
    if (req.query.os) {
      query.osVersion = { $regex: req.query.os, $options: 'i' };
    }
    if (req.query.antivirus) {
      query.antivirus = req.query.antivirus;
    }
    if (req.query.diskEncryption) {
      query.diskEncryption = req.query.diskEncryption === 'Enabled'; // Convert to boolean
    }

    const machines = await Machine.aggregate([
      {
        $sort: { machineId: 1, timestamp: -1 }
      },
      {
        $group: {
          _id: '$machineId',
          doc: { $first: '$$ROOT' },
          lastCheckIn: { $last: '$timestamp' }
        }
      },
      {
        $replaceRoot: { newRoot: { $mergeObjects: ['$doc', { lastCheckIn: '$lastCheckIn' }] } }
      },
      {
        $match: query
      }
    ]);

    res.json(machines);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get machine history
// @route   GET /api/machines/:id/history
// @access  Public
const getMachineHistory = async (req, res) => {
  try {
    const machineHistory = await Machine.find({ machineId: req.params.id }).sort({ timestamp: -1 });
    res.json(machineHistory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Export data to CSV
// @route   GET /api/export/csv
// @access  Public
const exportToCSV = async (req, res) => {
  try {
    const machines = await Machine.aggregate([
      {
        $sort: { machineId: 1, timestamp: -1 }
      },
      {
        $group: {
          _id: '$machineId',
          doc: { $first: '$$ROOT' }
        }
      },
      {
        $replaceRoot: { newRoot: '$doc' }
      }
    ]);

    const csvWriter = createCsvWriter({
      path: 'machines.csv',
      header: [
        { id: 'machineId', title: 'Machine ID' },
        { id: 'timestamp', title: 'Timestamp' },
        { id: 'osVersion', title: 'OS Version' },
        { id: 'diskEncryption', title: 'Disk Encryption' },
        { id: 'antivirus', title: 'Antivirus' },
        { id: 'sleep', title: 'Sleep' },
        { id: 'cpu', title: 'CPU' },
        { id: 'ram', title: 'RAM' },
      ],
    });

    await csvWriter.writeRecords(machines);

    res.download('machines.csv');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  reportHealthData,
  getMachines,
  getMachineHistory,
  exportToCSV,
};