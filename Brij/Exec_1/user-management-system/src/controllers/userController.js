const User = require('../models/User');
const Role = require('../models/Role');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      logger.warn('Registration attempt with existing email', { email, ip: req.ip });
      return res.status(409).json({ 
        error: 'Email already registered' 
      });
    }

    const user = await User.create({ email, password, name });
    const token = generateToken(user.id);

    logger.info('User registered successfully', { 
      userId: user.id, 
      email: user.email, 
      ip: req.ip 
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role_id: user.role_id
      },
      token
    });
  } catch (error) {
    logger.error('Registration error', { 
      error: error.message, 
      email: req.body.email, 
      ip: req.ip 
    });
    res.status(500).json({ 
      error: 'Registration failed' 
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      logger.warn('Login attempt with non-existent email', { email, ip: req.ip });
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }

    const isValidPassword = await User.validatePassword(password, user.password_hash);
    if (!isValidPassword) {
      logger.warn('Login attempt with invalid password', { 
        email, 
        userId: user.id, 
        ip: req.ip 
      });
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }

    const token = generateToken(user.id);

    logger.info('User logged in successfully', { 
      userId: user.id, 
      email: user.email, 
      ip: req.ip 
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role_name
      },
      token
    });
  } catch (error) {
    logger.error('Login error', { 
      error: error.message, 
      email: req.body.email, 
      ip: req.ip 
    });
    res.status(500).json({ 
      error: 'Login failed' 
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    const { password_hash, ...userProfile } = user;
    
    res.json({
      user: userProfile
    });
  } catch (error) {
    logger.error('Get profile error', { 
      error: error.message, 
      userId: req.params.id, 
      ip: req.ip 
    });
    res.status(500).json({ 
      error: 'Failed to retrieve user profile' 
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { name, email, password, role_id } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Check if user is trying to update role_id
    if (role_id !== undefined && role_id !== user.role_id) {
      // Only admin can update role_id
      const requestingUser = await User.findById(req.user.id);
      logger.info("request User for update profile", {
        requestingUser: requestingUser,
        UserForUpdate: user
      })
      
      if (!requestingUser || requestingUser.role_name !== 'admin') {
        logger.warn('Non-admin attempted to update role_id', {
          userId,
          requestedRoleId: role_id,
          requestingUserId: req.user.id,
          requestingUserRole: requestingUser?.role_name,
          ip: req.ip
        });
        return res.status(403).json({
          error: 'Only admin can update user role'
        });
      }
    }

    // Check email uniqueness if email is being updated
    if (email !== undefined && email !== user.email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(409).json({
          error: 'Email already in use'
        });
      }
    }

    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role_id !== undefined) updateData.role_id = role_id;
    
    // Hash password if provided
    if (password !== undefined) {
      const password_hash = await User.hashPassword(password);
      updateData.password = password_hash;
    }

    await User.update(userId, updateData);
    const updatedUser = await User.findById(userId);

    logger.info('User profile updated', {
      userId,
      updatedBy: req.user.id,
      fieldsUpdated: Object.keys(updateData),
      ip: req.ip
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    logger.error('Update profile error', {
      error: error.message,
      userId: req.params.id,
      ip: req.ip
    });
    res.status(500).json({
      error: 'Failed to update user profile'
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    await User.delete(userId);

    logger.info('User deleted', { 
      userId, 
      deletedBy: req.user.id, 
      ip: req.ip 
    });

    res.json({ 
      message: 'User deleted successfully' 
    });
  } catch (error) {
    logger.error('Delete user error', { 
      error: error.message, 
      userId: req.params.id, 
      ip: req.ip 
    });
    res.status(500).json({ 
      error: 'Failed to delete user' 
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    const sanitizedUsers = users.map(user => {
      const { password_hash, ...userData } = user;
      return userData;
    });

    res.json({ 
      users: sanitizedUsers 
    });
  } catch (error) {
    logger.error('Get all users error', { 
      error: error.message, 
      ip: req.ip 
    });
    res.status(500).json({ 
      error: 'Failed to retrieve users' 
    });
  }
};

const assignRole = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { role_id } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    const role = await Role.findById(role_id);
    if (!role) {
      return res.status(404).json({ 
        error: 'Role not found' 
      });
    }

    await User.update(userId, { role_id });
    const updatedUser = await User.findById(userId);

    logger.info('Role assigned to user', { 
      userId, 
      roleId: role_id, 
      assignedBy: req.user.id, 
      ip: req.ip 
    });

    res.json({
      message: 'Role assigned successfully',
      user: updatedUser
    });
  } catch (error) {
    logger.error('Assign role error', { 
      error: error.message, 
      userId: req.params.id, 
      roleId: req.body.role_id, 
      ip: req.ip 
    });
    res.status(500).json({ 
      error: 'Failed to assign role' 
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  deleteUser,
  getAllUsers,
  assignRole
};