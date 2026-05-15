import mongoose from 'mongoose';
import { env } from '../config/env';
import { Category } from '../models/Category.model';
import { Department } from '../models/Department.model';

const categories = [
  { name: 'pothole',     slaHours: 48  },
  { name: 'streetlight', slaHours: 72  },
  { name: 'garbage',     slaHours: 24  },
  { name: 'water',       slaHours: 12  },
  { name: 'drainage',    slaHours: 36  },
  { name: 'power',       slaHours: 8   },
  { name: 'other',       slaHours: 96  },
];

const departments = [
  { name: 'Roads & Highways' },
  { name: 'Street Lighting' },
  { name: 'Waste Management' },
  { name: 'Water & Sanitation' },
  { name: 'Drainage & Flood Control' },
  { name: 'Power & Utilities' },
  { name: 'General Services' },
];

async function seed() {
  await mongoose.connect(env.MONGODB_URI);
  console.log('Connected to MongoDB');

  for (const cat of categories) {
    await Category.updateOne({ name: cat.name }, { $set: cat }, { upsert: true });
    console.log(`  category: ${cat.name} (${cat.slaHours}h SLA)`);
  }

  for (const dept of departments) {
    await Department.updateOne({ name: dept.name }, { $set: dept }, { upsert: true });
    console.log(`  department: ${dept.name}`);
  }

  console.log('Seed complete.');
  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });
