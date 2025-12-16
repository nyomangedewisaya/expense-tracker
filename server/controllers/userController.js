const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

// GET PROFILE
const getProfile = async (req, res) => {
  try {
    // Pastikan req.user.id ada (dari middleware)
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { 
          id: true, 
          name: true, 
          email: true, 
          created_at: true 
          // Password jangan dikirim!
      } 
    });

    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE PROFILE
const updateProfile = async (req, res) => {
  const { name, email } = req.body;
  
  try {
    // Validasi input
    if (!name || !email) {
        return res.status(400).json({ message: "Nama dan Email wajib diisi" });
    }

    // Cek duplikasi email (Kecuali email milik user sendiri)
    const existingUser = await prisma.user.findFirst({
      where: { 
          email: email, 
          NOT: { id: req.user.id } // Abaikan user yang sedang login
      }
    });

    if (existingUser) {
        return res.status(400).json({ message: "Email sudah digunakan pengguna lain" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { 
          name: name, 
          email: email 
      },
      select: { id: true, name: true, email: true }
    });

    res.json({ message: "Profil berhasil diperbarui", user: updatedUser });
  } catch (error) {
    console.error("Error update profile:", error); // Cek terminal backend jika error
    res.status(500).json({ message: error.message });
  }
};

// CHANGE PASSWORD
const changePassword = async (req, res) => {
  const { old_password, new_password } = req.body;
  
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    // 1. Cek Password Lama
    const isMatch = await bcrypt.compare(old_password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Password lama salah" });

    // 2. Hash Password Baru
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    // 3. Update DB
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    res.json({ message: "Password berhasil diubah" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProfile, updateProfile, changePassword };