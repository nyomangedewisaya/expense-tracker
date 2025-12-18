const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seeding...');

  // 1. Bersihkan data lama (Urutan penting karena Foreign Key)
  await prisma.transfer.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.category.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Old data cleaned.');

  // Password default untuk semua user: 'password123'
  const hashedPassword = await bcrypt.hash('password123', 10);

  // --- DEFINISI DATA USER ---

  const usersData = [
    {
      name: 'Budi Santoso',
      email: 'budi.normal@example.com',
      persona: 'NORMAL', // Gaji standar, pengeluaran wajar
      wallets: [
        { name: 'Bank BCA', type: 'bank', balance: 5000000 },
        { name: 'GoPay', type: 'ewallet', balance: 200000 },
        { name: 'Tunai', type: 'cash', balance: 150000 },
      ],
    },
    {
      name: 'Kevin Sultan',
      email: 'kevin.boros@example.com',
      persona: 'BOROS', // Gaji besar, pengeluaran sangat besar (lifestyle)
      wallets: [
        { name: 'Credit Card', type: 'bank', balance: 50000000 },
        { name: 'Bank Mandiri', type: 'bank', balance: 10000000 },
        { name: 'OVO', type: 'ewallet', balance: 5000000 },
      ],
    },
    {
      name: 'Siti Aminah',
      email: 'siti.hemat@example.com',
      persona: 'HEMAT', // Gaji menengah, sangat irit, rajin menabung
      wallets: [
        { name: 'Bank Jago (Tabungan)', type: 'bank', balance: 25000000 },
        { name: 'Dompet Pasar', type: 'cash', balance: 50000 },
      ],
    },
    {
      name: 'Rian Creative',
      email: 'rian.freelance@example.com',
      persona: 'FREELANCE', // Penghasilan tidak tentu tanggalnya, dompet banyak
      wallets: [
        { name: 'Jenius', type: 'bank', balance: 3000000 },
        { name: 'PayPal', type: 'ewallet', balance: 8000000 },
        { name: 'Cash', type: 'cash', balance: 300000 },
      ],
    },
    {
      name: 'Dinda Mahasiswa',
      email: 'dinda.student@example.com',
      persona: 'STUDENT', // Uang saku pas-pasan, transaksi receh
      wallets: [
        { name: 'ShopeePay', type: 'ewallet', balance: 50000 },
        { name: 'Dompet Saku', type: 'cash', balance: 200000 },
      ],
    },
  ];

  // --- PROSES SEEDING PER USER ---

  for (const userData of usersData) {
    // 1. Buat User
    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
      },
    });

    console.log(`👤 Created user: ${user.name} (${userData.persona})`);

    // 2. Buat Wallet
    const createdWallets = [];
    for (const w of userData.wallets) {
      const wallet = await prisma.wallet.create({
        data: {
          user_id: user.id,
          name: w.name,
          type: w.type,
          initial_balance: w.balance,
        },
      });
      createdWallets.push(wallet);
    }

    // 3. Buat Kategori (Disesuaikan dengan Persona)
    const categories = [];
    let incomeCats = [];
    let expenseCats = [];

    if (userData.persona === 'NORMAL') {
      incomeCats = [{ name: 'Gaji Bulanan', color: '#10B981' }];
      expenseCats = [
        { name: 'Makan & Minum', color: '#F59E0B' },
        { name: 'Transportasi', color: '#3B82F6' },
        { name: 'Tagihan Listrik', color: '#EF4444' },
      ];
    } else if (userData.persona === 'BOROS') {
      incomeCats = [{ name: 'Hasil Bisnis', color: '#10B981' }];
      expenseCats = [
        { name: 'Shopping', color: '#EC4899' },
        { name: 'Party & Hiburan', color: '#8B5CF6' },
        { name: 'Fine Dining', color: '#F59E0B' },
        { name: 'Travel', color: '#06B6D4' },
      ];
    } else if (userData.persona === 'HEMAT') {
      incomeCats = [{ name: 'Gaji Kantor', color: '#10B981' }];
      expenseCats = [
        { name: 'Belanja Sayur', color: '#F59E0B' },
        { name: 'Sedekah', color: '#3B82F6' },
        { name: 'Investasi', color: '#6366F1' }, // Expense tapi positif
      ];
    } else if (userData.persona === 'FREELANCE') {
      incomeCats = [{ name: 'Proyek Desain', color: '#10B981' }, { name: 'Royalti', color: '#34D399' }];
      expenseCats = [
        { name: 'Software Subs', color: '#6366F1' },
        { name: 'Kopi & Cafe', color: '#F59E0B' },
        { name: 'Gadget', color: '#3B82F6' },
      ];
    } else if (userData.persona === 'STUDENT') {
      incomeCats = [{ name: 'Kiriman Ortu', color: '#10B981' }];
      expenseCats = [
        { name: 'Jajan Kampus', color: '#F59E0B' },
        { name: 'Print Tugas', color: '#6B7280' },
        { name: 'Pulsa', color: '#EF4444' },
      ];
    }

    // Insert Categories
    for (const c of incomeCats) {
      const cat = await prisma.category.create({ data: { user_id: user.id, name: c.name, type: 'income', color: c.color } });
      categories.push(cat);
    }
    for (const c of expenseCats) {
      const cat = await prisma.category.create({ data: { user_id: user.id, name: c.name, type: 'expense', color: c.color } });
      categories.push(cat);
    }

    // 4. Buat Transaksi & Budget (Skenario Khusus)
    const today = new Date();
    const mainWallet = createdWallets[0];

    // --- SKENARIO NORMAL (Budi) ---
    if (userData.persona === 'NORMAL') {
      // Pemasukan
      await createTrx(user.id, mainWallet.id, categories[0].id, 7000000, 'Gaji Bulan Ini', daysAgo(5));
      
      // Pengeluaran
      const catMakan = categories.find(c => c.name === 'Makan & Minum');
      const catTrans = categories.find(c => c.name === 'Transportasi');
      
      await createTrx(user.id, createdWallets[1].id, catMakan.id, 25000, 'Makan Siang', daysAgo(2));
      await createTrx(user.id, createdWallets[1].id, catMakan.id, 30000, 'Makan Malam', daysAgo(1));
      await createTrx(user.id, createdWallets[1].id, catTrans.id, 15000, 'Ojek Online', daysAgo(3));

      // Budget: Makan 1.5jt
      await prisma.budget.create({
        data: {
          user_id: user.id,
          category_id: catMakan.id,
          amount: 1500000,
          start_date: firstDayOfMonth(),
          end_date: lastDayOfMonth(),
        }
      });
    }

    // --- SKENARIO BOROS (Kevin) ---
    if (userData.persona === 'BOROS') {
      // Pemasukan Besar
      await createTrx(user.id, mainWallet.id, categories[0].id, 50000000, 'Profit Q3', daysAgo(10));

      // Pengeluaran Gila-gilaan
      const catShop = categories.find(c => c.name === 'Shopping');
      const catParty = categories.find(c => c.name === 'Party & Hiburan');

      await createTrx(user.id, mainWallet.id, catShop.id, 5000000, 'Beli Sneakers Baru', daysAgo(5));
      await createTrx(user.id, mainWallet.id, catShop.id, 2000000, 'Baju Branded', daysAgo(4));
      await createTrx(user.id, createdWallets[2].id, catParty.id, 3000000, 'Traktir Teman Ultah', daysAgo(2));

      // Budget: Shopping 3jt (Tapi realita habis 7jt -> Over budget)
      await prisma.budget.create({
        data: {
          user_id: user.id,
          category_id: catShop.id,
          amount: 3000000,
          start_date: firstDayOfMonth(),
          end_date: lastDayOfMonth(),
        }
      });
    }

    // --- SKENARIO HEMAT (Siti) ---
    if (userData.persona === 'HEMAT') {
      // Pemasukan
      await createTrx(user.id, mainWallet.id, categories[0].id, 8000000, 'Gaji Pokok', daysAgo(7));

      // Pengeluaran Kecil
      const catSayur = categories.find(c => c.name === 'Belanja Sayur');
      const catInvest = categories.find(c => c.name === 'Investasi');

      await createTrx(user.id, createdWallets[1].id, catSayur.id, 15000, 'Sayur Bayam', daysAgo(3));
      await createTrx(user.id, createdWallets[1].id, catSayur.id, 20000, 'Ayam Potong', daysAgo(3));
      
      // Transfer ke Investasi besar
      await createTrx(user.id, mainWallet.id, catInvest.id, 4000000, 'Beli Reksadana', daysAgo(5));

      // Budget: Sayur 500rb
      await prisma.budget.create({
        data: {
          user_id: user.id,
          category_id: catSayur.id,
          amount: 500000,
          start_date: firstDayOfMonth(),
          end_date: lastDayOfMonth(),
        }
      });
    }

    // --- SKENARIO TRANSFER (Untuk semua user, contoh Rian Freelance) ---
    if (userData.persona === 'FREELANCE') {
        const catProyek = categories.find(c => c.name === 'Proyek Desain');
        await createTrx(user.id, createdWallets[1].id, catProyek.id, 5000000, 'Payment Client US', daysAgo(6)); // Masuk PayPal

        // Transfer dari PayPal ke Jenius
        await prisma.transfer.create({
            data: {
                user_id: user.id,
                from_wallet_id: createdWallets[1].id, // PayPal
                to_wallet_id: createdWallets[0].id,   // Jenius
                amount: 2000000,
                description: 'Withdrawal ke Bank Lokal',
                transaction_date: new Date(),
            }
        });
    }
  }

  console.log('✅ Seeding completed successfully!');
}

// --- HELPER FUNCTIONS ---

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function firstDayOfMonth() {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function lastDayOfMonth() {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

async function createTrx(userId, walletId, catId, amount, desc, date) {
  await prisma.transaction.create({
    data: {
      user_id: userId,
      wallet_id: walletId,
      category_id: catId,
      amount: amount,
      description: desc,
      transaction_date: date,
    }
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });