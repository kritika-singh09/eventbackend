const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Login with email or mobile
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body; // email can be email or mobile
    
    const user = await User.findOne({
      $or: [
        { email: email },
        { mobile: email }
      ],
      is_active: true
    });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Role-based redirect info
    let redirectTo = '/admin';
    if (user.role === 'Sales Staff') redirectTo = '/sales';
    if (user.role === 'Gate Staff') redirectTo = '/gate';

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        mobile: user.mobile,
        name: user.name,
        role: user.role
      },
      redirectTo
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create user (Admin only)
exports.createUser = async (req, res) => {
  try {
    const { email, mobile, password, role, name } = req.body;
    
    const user = await User.create({
      email,
      mobile,
      password,
      role,
      name
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        email: user.email,
        mobile: user.mobile,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all users (Admin only)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Register admin (No auth required - for initial setup)
exports.registerAdmin = async (req, res) => {
  try {
    const { email, mobile, password, name } = req.body;
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'Admin' });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }
    
    const admin = await User.create({
      email,
      mobile,
      password,
      role: 'Admin',
      name
    });

    res.status(201).json({
      message: 'Admin registered successfully',
      user: {
        id: admin._id,
        email: admin.email,
        mobile: admin.mobile,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update user (Admin only)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, mobile, name, role, is_active, password } = req.body;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (email !== undefined) user.email = email;
    if (mobile !== undefined) user.mobile = mobile;
    if (name !== undefined) user.name = name;
    if (role !== undefined) user.role = role;
    if (is_active !== undefined) user.is_active = is_active;
    if (password && password.trim() !== '') {
      user.password = password;
      user.plain_password = password;
    }

    await user.save();

    res.json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        email: user.email,
        mobile: user.mobile,
        name: user.name,
        role: user.role,
        is_active: user.is_active
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Register new user
exports.register = async (req, res) => {
  try {
    const { email, mobile, password, name, role = 'Sales Staff' } = req.body;
    
    const user = await User.create({
      email,
      mobile,
      password,
      role,
      name
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        mobile: user.mobile,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete user (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting the last admin
    if (user.role === 'Admin') {
      const adminCount = await User.countDocuments({ role: 'Admin', is_active: true });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last admin user' });
      }
    }

    await User.findByIdAndDelete(id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};