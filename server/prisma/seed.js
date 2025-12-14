// server/prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Mulai Seeding Database...');

  // 1. BERSIHKAN DATA LAMA
  // Urutan delete penting: Child -> Parent
  await prisma.transaction.deleteMany();
  await prisma.transfer.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Database lama dibersihkan.');

  const hashedPassword = await bcrypt.hash('123456', 10);

  // ==========================================
  // USER 1: Budi (Karyawan)
  // Skenario: Rutin ambil uang tunai di ATM & Budget Makan
  // ==========================================
  const user1 = await prisma.user.create({
    data: { name: 'Budi Santoso', email: 'budi@example.com', password: hashedPassword },
  });

  // Wallet
  const bca = await prisma.wallet.create({ data: { user_id: user1.id, name: 'BCA Utama', type: 'bank', initial_balance: 5000000 } });
  const cash = await prisma.wallet.create({ data: { user_id: user1.id, name: 'Dompet Tunai', type: 'cash', initial_balance: 500000 } });

  // Kategori
  const catGaji = await prisma.category.create({ data: { user_id: user1.id, name: 'Gaji Bulanan', type: 'income', color: '#10B981' } });
  const catMakan = await prisma.category.create({ data: { user_id: user1.id, name: 'Makan Siang', type: 'expense', color: '#F59E0B' } });
  const catTransport = await prisma.category.create({ data: { user_id: user1.id, name: 'Bensin', type: 'expense', color: '#6366F1' } });

  // Transaksi
  await prisma.transaction.createMany({
    data: [
      { user_id: user1.id, wallet_id: bca.id, category_id: catGaji.id, amount: 8000000, description: 'Gaji Bulan Januari', transaction_date: new Date('2025-01-25') },
      { user_id: user1.id, wallet_id: cash.id, category_id: catMakan.id, amount: 25000, description: 'Nasi Padang', transaction_date: new Date('2025-01-26') },
      { user_id: user1.id, wallet_id: cash.id, category_id: catTransport.id, amount: 30000, description: 'Isi Pertalite', transaction_date: new Date('2025-01-27') },
    ]
  });

  // [BARU] Transfer: Budi tarik tunai dari ATM (BCA -> Cash)
  await prisma.transfer.create({
    data: {
      user_id: user1.id,
      from_wallet_id: bca.id,
      to_wallet_id: cash.id,
      amount: 500000,
      description: 'Tarik Tunai ATM',
      transaction_date: new Date('2025-01-28')
    }
  });

  // [BARU] Budget: Budi membatasi uang makan maksimal 1.5 Juta/bulan
  await prisma.budget.create({
    data: {
      user_id: user1.id,
      category_id: catMakan.id,
      amount: 1500000,
      start_date: new Date('2025-01-01'),
      end_date: new Date('2025-01-31')
    }
  });

  console.log('✅ User 1 (Budi) Created');

  // ==========================================
  // USER 2: Siti (Mahasiswa)
  // Skenario: Pindah saldo GoPay ke Teman/Cash & Budget Skincare
  // ==========================================
  const user2 = await prisma.user.create({
    data: { name: 'Siti Aminah', email: 'siti@example.com', password: hashedPassword },
  });

  // Wallet (Kita tambah Dompet Tunai agar bisa transfer)
  const gopay = await prisma.wallet.create({ data: { user_id: user2.id, name: 'GoPay', type: 'ewallet', initial_balance: 500000 } });
  const dompetSiti = await prisma.wallet.create({ data: { user_id: user2.id, name: 'Dompet Pink', type: 'cash', initial_balance: 50000 } });

  // Kategori
  const catSaku = await prisma.category.create({ data: { user_id: user2.id, name: 'Uang Saku', type: 'income', color: '#3B82F6' } });
  const catJajan = await prisma.category.create({ data: { user_id: user2.id, name: 'Jajan Kampus', type: 'expense', color: '#EC4899' } });
  const catSkincare = await prisma.category.create({ data: { user_id: user2.id, name: 'Skincare', type: 'expense', color: '#D946EF' } });

  // Transaksi
  await prisma.transaction.create({
    data: { user_id: user2.id, wallet_id: gopay.id, category_id: catSaku.id, amount: 500000, description: 'Kiriman Ortu', transaction_date: new Date('2025-02-01') }
  });
  await prisma.transaction.create({
    data: { user_id: user2.id, wallet_id: gopay.id, category_id: catJajan.id, amount: 15000, description: 'Beli Seblak', transaction_date: new Date('2025-02-02') }
  });

  // [BARU] Transfer: Siti mencairkan GoPay ke uang tunai
  await prisma.transfer.create({
    data: {
      user_id: user2.id,
      from_wallet_id: gopay.id,
      to_wallet_id: dompetSiti.id,
      amount: 100000,
      description: 'Cairin GoPay buat pegangan',
      transaction_date: new Date('2025-02-03')
    }
  });

  // [BARU] Budget: Siti budget skincare 200rb (Hampir habis kalau beli serum mahal)
  await prisma.budget.create({
    data: {
      user_id: user2.id,
      category_id: catSkincare.id, // Budget khusus Skincare
      amount: 200000,
      start_date: new Date('2025-02-01'),
      end_date: new Date('2025-02-28')
    }
  });

  console.log('✅ User 2 (Siti) Created');

  // ==========================================
  // USER 3: Yahya (Freelancer)
  // Skenario: Withdraw PayPal ke Bank Lokal & Budget Server
  // ==========================================
  const user3 = await prisma.user.create({
    data: { name: 'Yahya Developer', email: 'yahya@example.com', password: hashedPassword },
  });

  // Wallet
  const jago = await prisma.wallet.create({ data: { user_id: user3.id, name: 'Bank Jago', type: 'bank', initial_balance: 1000000 } });
  const paypal = await prisma.wallet.create({ data: { user_id: user3.id, name: 'PayPal', type: 'ewallet', initial_balance: 2000000 } });

  // Kategori
  const catProyek = await prisma.category.create({ data: { user_id: user3.id, name: 'Proyek Web', type: 'income', color: '#8B5CF6' } });
  const catServer = await prisma.category.create({ data: { user_id: user3.id, name: 'Sewa Server', type: 'expense', color: '#EF4444' } });

  // Transaksi
  await prisma.transaction.create({
    data: { user_id: user3.id, wallet_id: paypal.id, category_id: catProyek.id, amount: 3500000, description: 'Project React JS', transaction_date: new Date('2025-02-10') }
  });
  await prisma.transaction.create({
    data: { user_id: user3.id, wallet_id: jago.id, category_id: catServer.id, amount: 150000, description: 'Bayar VPS', transaction_date: new Date('2025-02-11') }
  });

  // [BARU] Transfer: Yahya withdraw uang dari PayPal ke Bank Jago
  await prisma.transfer.create({
    data: {
      user_id: user3.id,
      from_wallet_id: paypal.id,
      to_wallet_id: jago.id,
      amount: 1500000, // Withdraw 1.5 Juta
      description: 'Withdraw PayPal ke Bank',
      transaction_date: new Date('2025-02-12')
    }
  });

  // [BARU] Budget: Yahya membatasi biaya Server maksimal 500rb
  await prisma.budget.create({
    data: {
      user_id: user3.id,
      category_id: catServer.id,
      amount: 500000,
      start_date: new Date('2025-02-01'),
      end_date: new Date('2025-02-28')
    }
  });

  console.log('✅ User 3 (Yahya) Created');
  console.log('🎉 Seeding Selesai! Siap digunakan.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });