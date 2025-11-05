import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminEmail = 'admin@lab.com'
  const adminPassword = 'admin123'
  
  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (existingAdmin) {
    console.log('✅ Admin user already exists')
  } else {
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
      },
    })
    console.log('✅ Created admin user:')
    console.log(`   Email: ${adminEmail}`)
    console.log(`   Password: ${adminPassword}`)
    console.log('   ⚠️  Please change the password after first login!')
  }

  // Create a test user (optional)
  const testUserEmail = 'user@lab.com'
  const testUserPassword = 'user123'
  
  const existingUser = await prisma.user.findUnique({
    where: { email: testUserEmail },
  })

  if (existingUser) {
    console.log('✅ Test user already exists')
  } else {
    const testUser = await prisma.user.create({
      data: {
        email: testUserEmail,
        name: 'Test User',
        password: await bcrypt.hash(testUserPassword, 10),
        role: 'USER',
      },
    })
    console.log('✅ Created test user:')
    console.log(`   Email: ${testUserEmail}`)
    console.log(`   Password: ${testUserPassword}`)
  }

  console.log('\n✨ Seeding completed!')
  console.log('\n📝 Login credentials:')
  console.log('   Admin: admin@lab.com / admin123')
  console.log('   User:  user@lab.com / user123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

