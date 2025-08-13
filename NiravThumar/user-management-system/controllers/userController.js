const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const logger = require('../utils/logger');

// Register a new user
const registerUser = async (req, res) => {
  try {
    const { email, password, first_name, last_name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: 'User with this email already exists' });
    }

    // Get default role (user)
    const defaultRole = await Role.findOne({ name: 'user' });
    if (!defaultRole) {
      return res.status(500).json({ message: 'Default role not found' });
    }

    // Create new user
    const user = new User({
      email,
      password_hash: password,
      role_id: defaultRole._id,
      first_name,
      last_name,
    });

    await user.save();

    // Create JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    });

    logger.info(`New user registered: ${user.email}`);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: defaultRole.name,
      },
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res
      .status(500)
      .json({ message: 'Error registering user', error: error.message });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).populate('role_id');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.last_login = new Date();
    await user.save();

    // Create JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    });

    logger.info(`User logged in: ${user.email}`);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role_id.name,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is trying to access their own profile or is admin
    if (req.user._id.toString() !== id && req.user.role_id.name !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(id).populate('role_id');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role_id.name,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch (error) {
    logger.error('Get user profile error:', error);
    res
      .status(500)
      .json({ message: 'Error retrieving user profile', error: error.message });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name } = req.body;

    // Check if user is trying to update their own profile or is admin
    if (req.user._id.toString() !== id && req.user.role_id.name !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only allow updating first_name and last_name for non-admin operations
    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;

    await user.save();

    res.json({
      message: 'User profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    });
  } catch (error) {
    logger.error('Update user profile error:', error);
    res
      .status(500)
      .json({ message: 'Error updating user profile', error: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(id);

    logger.info(`User deleted: ${user.email}`);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error('Delete user error:', error);
    res
      .status(500)
      .json({ message: 'Error deleting user', error: error.message });
  }
};

// Assign role to user
const assignRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find role
    const roleDoc = await Role.findOne({ name: role });
    if (!roleDoc) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Assign role
    user.role_id = roleDoc._id;
    await user.save();

    logger.info(`Role assigned to user: ${user.email} -> ${role}`);

    res.json({
      message: 'Role assigned successfully',
      user: {
        id: user._id,
        email: user.email,
        role: roleDoc.name,
      },
    });
  } catch (error) {
    logger.error('Assign role error:', error);
    res
      .status(500)
      .json({ message: 'Error assigning role', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  assignRole,
};
