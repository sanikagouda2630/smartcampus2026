const Counter = require('../models/Counter');

/**
 * Generate a sequential, atomic Request ID like REQ-2026-0001
 * Uses findOneAndUpdate with $inc to prevent race conditions or duplicate IDs.
 */
async function generateRequestId() {
  const year = new Date().getFullYear();
  const counterId = `requestId_${year}`;

  const counter = await Counter.findOneAndUpdate(
    { _id: counterId },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const formattedSeq = String(counter.seq).padStart(4, '0');
  return `REQ-${year}-${formattedSeq}`;
}

module.exports = { generateRequestId };
