const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// HELPER: Konversi Tanggal ke String 'YYYY-MM-DD' sesuai Zona Waktu Jakarta
// Ini kuncinya agar tidak geser hari (UTC vs WIB)
const getWIBDateString = (date) => {
    return new Intl.DateTimeFormat('en-CA', { // en-CA formatnya YYYY-MM-DD
        timeZone: 'Asia/Jakarta',
    }).format(date);
};

// 1. SUMMARY DASHBOARD
const getDashboardSummary = async (req, res) => {
  const userId = req.user.id;

  try {
    // A. Hitung Saldo Real (Sama seperti sebelumnya)
    const wallets = await prisma.wallet.findMany({ where: { user_id: userId, deleted_at: null } });
    let totalBalance = 0;

    for (const wallet of wallets) {
        const incomeAgg = await prisma.transaction.aggregate({ _sum: { amount: true }, where: { wallet_id: wallet.id, deleted_at: null, category: { type: 'income' } } });
        const expenseAgg = await prisma.transaction.aggregate({ _sum: { amount: true }, where: { wallet_id: wallet.id, deleted_at: null, category: { type: 'expense' } } });
        const trfInAgg = await prisma.transfer.aggregate({ _sum: { amount: true }, where: { to_wallet_id: wallet.id, deleted_at: null } });
        const trfOutAgg = await prisma.transfer.aggregate({ _sum: { amount: true }, where: { from_wallet_id: wallet.id, deleted_at: null } });

        const balance = wallet.initial_balance 
            + (incomeAgg._sum.amount || 0) 
            - (expenseAgg._sum.amount || 0)
            + (trfInAgg._sum.amount || 0)
            - (trfOutAgg._sum.amount || 0);
        
        totalBalance += balance;
    }

    // B. Hitung Bulan Ini
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const thisMonthIncome = await prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { user_id: userId, deleted_at: null, category: { type: 'income' }, transaction_date: { gte: startOfMonth, lte: endOfMonth } }
    });

    const thisMonthExpense = await prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { user_id: userId, deleted_at: null, category: { type: 'expense' }, transaction_date: { gte: startOfMonth, lte: endOfMonth } }
    });

    res.json({
        total_balance: totalBalance,
        income_this_month: thisMonthIncome._sum.amount || 0,
        expense_this_month: thisMonthExpense._sum.amount || 0
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. CHART DATA (YANG KITA PERBAIKI)
const getDashboardChart = async (req, res) => {
    const userId = req.user.id;
    const { period } = req.query; // '7days' atau 'month'

    try {
        const now = new Date();
        let startDate = new Date();
        let endDate = new Date();

        // Tentukan Range
        if (period === 'month') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        } else {
            // 7 Hari ke belakang (termasuk hari ini)
            startDate = new Date();
            startDate.setDate(now.getDate() - 6);
            endDate = new Date();
        }

        // --- STEP 1: Buat Kerangka Tanggal (Map) ---
        // Kita loop tanggal satu per satu untuk memastikan sumbu X Chart lengkap
        const chartMap = new Map();
        let loopDate = new Date(startDate);
        
        // Loop sampai endDate
        while (loopDate <= endDate) {
            // Gunakan helper getWIBDateString agar tanggalnya KONSISTEN YYYY-MM-DD (WIB)
            // JANGAN pakai toISOString() karena itu UTC (bisa mundur sehari)
            const dateKey = getWIBDateString(loopDate); 
            
            // Format Label untuk UI (Contoh: "Sen 14")
            let label = "";
            if (period === 'month') {
                label = new Intl.DateTimeFormat('id-ID', { day: 'numeric' }).format(loopDate); // Tgl saja
            } else {
                label = new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: 'numeric' }).format(loopDate); // Hari + Tgl
            }

            chartMap.set(dateKey, {
                name: label,
                date: dateKey,
                income: 0,
                expense: 0
            });

            // Tambah 1 hari
            loopDate.setDate(loopDate.getDate() + 1);
        }

        // --- STEP 2: Ambil Data dari Database ---
        // Kita set jam query agar mencakup 00:00:00 s/d 23:59:59 di range tersebut
        const queryStart = new Date(startDate); queryStart.setHours(0,0,0,0);
        const queryEnd = new Date(endDate); queryEnd.setHours(23,59,59,999);

        const transactions = await prisma.transaction.findMany({
            where: {
                user_id: userId,
                deleted_at: null,
                transaction_date: {
                    gte: queryStart,
                    lte: queryEnd
                }
            },
            include: { category: true }
        });

        // --- STEP 3: Masukkan Data ke Kerangka ---
        transactions.forEach(trx => {
            // Konversi tanggal transaksi DB ke String WIB juga
            const trxDateKey = getWIBDateString(new Date(trx.transaction_date));

            // Jika tanggalnya ada di range chart kita, tambahkan angkanya
            if (chartMap.has(trxDateKey)) {
                const dayData = chartMap.get(trxDateKey);
                if (trx.category.type === 'income') {
                    dayData.income += trx.amount;
                } else {
                    dayData.expense += trx.amount;
                }
            }
        });

        // Ubah Map jadi Array untuk respon JSON
        const result = Array.from(chartMap.values());
        res.json(result);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

const getExpenseBreakdown = async (req, res) => {
    const userId = req.user.id;
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Ambil transaksi pengeluaran bulan ini
        const transactions = await prisma.transaction.findMany({
            where: {
                user_id: userId,
                deleted_at: null,
                category: { type: 'expense' },
                transaction_date: { gte: startOfMonth, lte: endOfMonth }
            },
            include: { category: true }
        });

        // Grouping data berdasarkan Nama Kategori
        const breakdown = transactions.reduce((acc, curr) => {
            const catName = curr.category.name;
            const catColor = curr.category.color || '#94a3b8'; // Default gray jika null
            
            if (!acc[catName]) {
                acc[catName] = { name: catName, value: 0, color: catColor };
            }
            acc[catName].value += curr.amount;
            return acc;
        }, {});

        // Ubah Object ke Array dan urutkan dari yang terbesar
        const result = Object.values(breakdown).sort((a, b) => b.value - a.value);

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboardSummary, getDashboardChart, getExpenseBreakdown };