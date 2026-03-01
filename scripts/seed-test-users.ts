import { connectToDatabase } from '@/lib/db/connection';
import { UserModel } from '@/lib/db/models/User';
import bcrypt from 'bcryptjs';

const testUsers = [
  { 
    email: 'super@mongohacks.test', 
    name: 'Super Admin', 
    role: 'super_admin' as const, 
    password: 'SuperAdmin123!' 
  },
  { 
    email: 'admin@mongohacks.test', 
    name: 'Admin User', 
    role: 'admin' as const, 
    password: 'Admin123!' 
  },
  { 
    email: 'organizer@mongohacks.test', 
    name: 'Event Organizer', 
    role: 'organizer' as const, 
    password: 'Organizer123!' 
  },
  { 
    email: 'marketer@mongohacks.test', 
    name: 'Marketing Manager', 
    role: 'marketer' as const, 
    password: 'Marketer123!' 
  },
  { 
    email: 'partner@mongohacks.test', 
    name: 'Sponsor Partner', 
    role: 'partner' as const, 
    password: 'Partner123!' 
  },
  { 
    email: 'judge@mongohacks.test', 
    name: 'Event Judge', 
    role: 'judge' as const, 
    password: 'Judge123!' 
  },
  { 
    email: 'mentor@mongohacks.test', 
    name: 'Hackathon Mentor', 
    role: 'mentor' as const, 
    password: 'Mentor123!' 
  },
  { 
    email: 'participant@mongohacks.test', 
    name: 'Participant User', 
    role: 'participant' as const, 
    password: 'Participant123!' 
  }
];

async function seedTestUsers() {
  console.log('🌱 Seeding test users...\n');

  try {
    await connectToDatabase();
    console.log('✅ Connected to database\n');

    let created = 0;
    let skipped = 0;

    for (const user of testUsers) {
      const existing = await UserModel.findOne({ email: user.email });
      
      if (existing) {
        console.log(`⏭️  Skipping ${user.email} (already exists)`);
        skipped++;
        continue;
      }

      const passwordHash = await bcrypt.hash(user.password, 10);
      
      await UserModel.create({
        email: user.email,
        name: user.name,
        role: user.role,
        passwordHash,
        emailVerified: true,
        needsPasswordSetup: false,
        notificationPreferences: {
          emailNotifications: true,
          eventReminders: true,
          teamInvites: true,
          projectUpdates: true,
          newsletter: false
        },
        banned: false
      });

      console.log(`✅ Created ${user.role.padEnd(12)} → ${user.email}`);
      created++;
    }

    console.log(`\n🎉 Test users seeded successfully!`);
    console.log(`   - Created: ${created}`);
    console.log(`   - Skipped: ${skipped}\n`);

    if (created > 0) {
      console.log('📋 Test Credentials:\n');
      testUsers.forEach(user => {
        console.log(`${user.role.toUpperCase()}:`);
        console.log(`  Email:    ${user.email}`);
        console.log(`  Password: ${user.password}\n`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding test users:', error);
    process.exit(1);
  }
}

seedTestUsers();
