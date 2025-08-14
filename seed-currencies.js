const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedCurrencies() {
  const currencies = [
    { currency_code: 'USD', currency_name: 'US Dollar' },
    { currency_code: 'EUR', currency_name: 'Euro' },
    { currency_code: 'GBP', currency_name: 'British Pound' },
    { currency_code: 'UGX', currency_name: 'Ugandan Shilling' },
  ];

  for (const currency of currencies) {
    await prisma.currency.upsert({
      where: { currency_code: currency.currency_code },
      update: {},
      create: currency,
    });
  }

  console.log('Currencies seeded successfully');
}

seedCurrencies()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });