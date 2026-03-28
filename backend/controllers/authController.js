const User = require('../models/User');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

exports.studentLogin = async (req, res) => {
  const { prn } = req.body;
  if (!prn) return res.status(400).json({ message: 'PRN is required' });

  try {
    let user = await User.findOne({ prn });
    if (!user) {
      // Automatic registration for new students as per request
      user = new User({ prn });
      await user.save();
    }

    const token = jwt.sign({ id: user._id, prn: user.prn, role: 'student' }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user, message: 'Student Login Successful' });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  try {
    const admin = await Admin.findOne({ email });
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin._id, email: admin.email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, admin: { email: admin.email }, message: 'Admin Login Successful' });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
