const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

const getProfile = async (req, res) => {
  try {
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
      } 
    });

    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  const { name, email } = req.body;
  
  try {
    if (!name || !email) {
        return res.status(400).json({ message: "Nama dan Email wajib diisi" });
    }

    const existingUser = await prisma.user.findFirst({
      where: { 
          email: email, 
          NOT: { id: req.user.id }
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
    console.error("Error update profile:", error);
    res.status(500).json({ message: error.message });
  }
};

const changePassword = async (req, res) => {
  const { old_password, new_password } = req.body;
  
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    const isMatch = await bcrypt.compare(old_password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Password lama salah" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

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