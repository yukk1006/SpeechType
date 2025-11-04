import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const categories = [
    { name: 'Shopping', type: 'expense' },
    { name: 'Meals', type: 'expense' },
    { name: 'Utilities', type: 'expense' },
    { name: 'Others', type: 'expense' },
    { name: 'Scholarship', type: 'income' },
    { name: 'Part-time', type: 'income' },
    { name: 'Others', type: 'income' },
  ]

  console.log('Start seeding categories...');

  for (const cat of categories) {
    const existing = await prisma.category.findFirst({
      where: { name: cat.name, type: cat.type }
    });

    if (!existing) {
      await prisma.category.create({ data: cat });
      console.log(`Created category: ${cat.name} (${cat.type})`);
    } else {
      console.log(`Skipped existing category: ${cat.name} (${cat.type})`);
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
