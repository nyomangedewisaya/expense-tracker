// server/prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Helper untuk membuat tanggal mundur (H-0, H-1, dst)
const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

async function main() {
  console.log('🌱 Mulai Seeding Database...');

  // 1. BERSIHKAN DATA LAMA
  // Urutan delete penting untuk menghindari foreign key constraint error
  await prisma.budget.deleteMany();
  await prisma.transfer.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.category.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Database lama dibersihkan.');

  const hashedPassword = await bcrypt.hash('123456', 10);

  // ==========================================
  // USER 1: Budi (Karyawan)
  // Skenario: Rutin, Gaji UMR, Tabungan
  // ==========================================
  const user1 = await prisma.user.create({
    data: { name: 'Budi Santoso', email: 'budi@example.com', password: hashedPassword },
  });

  const wBudiBCA = await prisma.wallet.create({ data: { user_id: user1.id, name: 'BCA Utama', type: 'bank', initial_balance: 5000000 } });
  const wBudiCash = await prisma.wallet.create({ data: { user_id: user1.id, name: 'Dompet Saku', type: 'cash', initial_balance: 200000 } });

  const cBudiGaji = await prisma.category.create({ data: { user_id: user1.id, name: 'Gaji', type: 'income', color: '#10B981' } }); // Hijau
  const cBudiMakan = await prisma.category.create({ data: { user_id: user1.id, name: 'Makanan', type: 'expense', color: '#F59E0B' } }); // Kuning
  const cBudiTransport = await prisma.category.create({ data: { user_id: user1.id, name: 'Transport', type: 'expense', color: '#6366F1' } }); // Indigo

  // Transaksi Budi (Sample)
  await prisma.transaction.createMany({
    data: [
      { user_id: user1.id, wallet_id: wBudiBCA.id, category_id: cBudiGaji.id, amount: 7500000, description: 'Gaji Bulanan', transaction_date: daysAgo(25) },
      { user_id: user1.id, wallet_id: wBudiCash.id, category_id: cBudiMakan.id, amount: 25000, description: 'Nasi Rames', transaction_date: daysAgo(2) },
    ]
  });

  console.log('✅ User 1 (Budi) Created');

  // ==========================================
  // USER 2: Siti (Mahasiswa)
  // Skenario: Uang Saku, Skincare, Jajan
  // ==========================================
  const user2 = await prisma.user.create({
    data: { name: 'Siti Aminah', email: 'siti@example.com', password: hashedPassword },
  });

  const wSitiGopay = await prisma.wallet.create({ data: { user_id: user2.id, name: 'GoPay', type: 'ewallet', initial_balance: 300000 } });
  const wSitiCash = await prisma.wallet.create({ data: { user_id: user2.id, name: 'Dompet Pink', type: 'cash', initial_balance: 50000 } });

  const cSitiSaku = await prisma.category.create({ data: { user_id: user2.id, name: 'Uang Saku', type: 'income', color: '#3B82F6' } }); // Biru
  const cSitiSkincare = await prisma.category.create({ data: { user_id: user2.id, name: 'Skincare', type: 'expense', color: '#EC4899' } }); // Pink
  const cSitiJajan = await prisma.category.create({ data: { user_id: user2.id, name: 'Jajan', type: 'expense', color: '#D946EF' } }); // Fuchsia

  await prisma.budget.create({
    data: { user_id: user2.id, category_id: cSitiSkincare.id, amount: 200000, start_date: daysAgo(30), end_date: daysAgo(0) }
  });

  console.log('✅ User 2 (Siti) Created');

  // ==========================================
  // USER 3: Yahya (Freelancer / Developer)
  // Skenario: 10 Hari berturut-turut, Server, Kopi, Project
  // ==========================================
  const user3 = await prisma.user.create({
    data: { name: 'Yahya Developer', email: 'yahya@example.com', password: hashedPassword },
  });

  // Wallet Yahya
  const wYahyaJago = await prisma.wallet.create({ data: { user_id: user3.id, name: 'Bank Jago', type: 'bank', initial_balance: 8000000 } });
  const wYahyaPaypal = await prisma.wallet.create({ data: { user_id: user3.id, name: 'PayPal', type: 'ewallet', initial_balance: 5000000 } });
  const wYahyaCash = await prisma.wallet.create({ data: { user_id: user3.id, name: 'Cash', type: 'cash', initial_balance: 300000 } });

  // Kategori Yahya
  const cYahyaProject = await prisma.category.create({ data: { user_id: user3.id, name: 'Proyek Web', type: 'income', color: '#10B981' } }); // Emerald
  const cYahyaServer = await prisma.category.create({ data: { user_id: user3.id, name: 'Server & Tools', type: 'expense', color: '#EF4444' } }); // Red
  const cYahyaFnb = await prisma.category.create({ data: { user_id: user3.id, name: 'Food & Coffee', type: 'expense', color: '#F97316' } }); // Orange
  const cYahyaInternet = await prisma.category.create({ data: { user_id: user3.id, name: 'Internet', type: 'expense', color: '#0EA5E9' } }); // Sky Blue
  const cYahyaEdu = await prisma.category.create({ data: { user_id: user3.id, name: 'Course/Buku', type: 'expense', color: '#8B5CF6' } }); // Violet

  // ARRAY TRANSAKSI 10 HARI TERAKHIR (Dihitung mundur dari Hari Ini)
  const yahyaTransactions = [
    // Hari ini (H-0)
    {
      wallet: wYahyaCash, category: cYahyaFnb, amount: 28000,
      desc: 'Kopi Susu Gula Aren', date: daysAgo(0)
    },
    // Kemarin (H-1)
    {
      wallet: wYahyaJago, category: cYahyaServer, amount: 155000,
      desc: 'Perpanjang VPS DigitalOcean', date: daysAgo(1)
    },
    // H-2
    {
      wallet: wYahyaPaypal, category: cYahyaProject, amount: 2500000,
      desc: 'DP Project Landing Page', date: daysAgo(2)
    },
    // H-3
    {
      wallet: wYahyaCash, category: cYahyaFnb, amount: 45000,
      desc: 'Makan Siang Ayam Bakar', date: daysAgo(3)
    },
    // H-4
    {
      wallet: wYahyaJago, category: cYahyaInternet, amount: 350000,
      desc: 'Bayar Wifi IndiHome', date: daysAgo(4)
    },
    // H-5
    {
      wallet: wYahyaJago, category: cYahyaEdu, amount: 120000,
      desc: 'Ebook Laravel Advanced', date: daysAgo(5)
    },
    // H-6
    {
      wallet: wYahyaCash, category: cYahyaFnb, amount: 15000,
      desc: 'Air Mineral & Snack', date: daysAgo(6)
    },
    // H-7
    {
      wallet: wYahyaPaypal, category: cYahyaServer, amount: 200000,
      desc: 'Langganan ChatGPT Plus', date: daysAgo(7)
    },
    // H-8
    {
      wallet: wYahyaJago, category: cYahyaFnb, amount: 150000,
      desc: 'Traktir Tim (Makan malam)', date: daysAgo(8)
    },
    // H-9
    {
      wallet: wYahyaPaypal, category: cYahyaProject, amount: 1200000,
      desc: 'Pelunasan Fix Bug Web', date: daysAgo(9)
    },
  ];

  // Insert Loop Transaksi Yahya
  for (const trx of yahyaTransactions) {
    await prisma.transaction.create({
      data: {
        user_id: user3.id,
        wallet_id: trx.wallet.id,
        category_id: trx.category.id,
        amount: trx.amount,
        description: trx.desc,
        transaction_date: trx.date,
      }
    });
  }

  // [BARU] Transfer Yahya: Withdraw PayPal ke Jago (Dilakukan di H-2 setelah dapat DP)
  await prisma.transfer.create({
    data: {
      user_id: user3.id,
      from_wallet_id: wYahyaPaypal.id,
      to_wallet_id: wYahyaJago.id,
      amount: 1000000,
      description: 'Withdraw sebagian Project',
      transaction_date: daysAgo(2) // Sesuai tanggal dapat DP
    }
  });

  // [BARU] Budget Yahya: Membatasi pengeluaran Server bulanan
  await prisma.budget.create({
    data: {
      user_id: user3.id,
      category_id: cYahyaServer.id,
      amount: 500000, // Budget 500rb
      start_date: daysAgo(30), // Anggap awal bulan
      end_date: daysAgo(-5)    // Anggap akhir bulan
    }
  });

  console.log('✅ User 3 (Yahya) Created dengan data 10 hari terakhir.');
  console.log('🎉 Seeding Selesai!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });