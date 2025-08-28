/**
 * Example User service to demonstrate service pattern with database integration
 */

import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { UserRepository } from '../repositories/user.repository';
import { Injectable, InjectConfig } from '../common';
import { ConfigService } from '../config';

export type CreateUserDto = {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export type UpdateUserDto = {
  name?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
}

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    @InjectConfig() private readonly configService: ConfigService
  ) {}

  /**
   * Create a new user
   */
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { name, email, password, role = 'user' } = createUserDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const saltRounds = this.configService.get('security.bcrypt.saltRounds', 10);
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    return user;
  }

  /**
   * Find user by ID
   */
  async findById(id: number): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  /**
   * Get all users with pagination
   */
  async findAll(page = 1, limit = 10) {
    return this.userRepository.findAll(page, limit);
  }

  /**
   * Update user
   */
  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if email is being updated and if it's already taken
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new Error('Email already taken');
      }
    }

    return this.userRepository.update(id, updateUserDto);
  }

  /**
   * Delete user
   */
  async deleteUser(id: number): Promise<boolean> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    return this.userRepository.delete(id);
  }

  /**
   * Verify user password
   */
  async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  /**
   * Change user password
   */
  async changePassword(id: number, oldPassword: string, newPassword: string): Promise<boolean> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify old password
    const isOldPasswordValid = await this.verifyPassword(user, oldPassword);
    if (!isOldPasswordValid) {
      throw new Error('Invalid old password');
    }

    // Hash new password
    const saltRounds = this.configService.get('security.bcrypt.saltRounds', 10);
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    const updatedUser = await this.userRepository.update(id, { password: hashedPassword });
    return !!updatedUser;
  }

  /**
   * Search users
   */
  async searchUsers(term: string): Promise<User[]> {
    return this.userRepository.search(term);
  }

  /**
   * Get user statistics
   */
  async getUserStats() {
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.findActiveUsers();
    const adminUsers = await this.userRepository.findByRole('admin');

    return {
      total: totalUsers,
      active: activeUsers.length,
      inactive: totalUsers - activeUsers.length,
      admins: adminUsers.length,
    };
  }

  /**
   * Activate user
   */
  async activateUser(id: number): Promise<User | null> {
    return this.userRepository.update(id, { isActive: true });
  }

  /**
   * Deactivate user
   */
  async deactivateUser(id: number): Promise<User | null> {
    return this.userRepository.update(id, { isActive: false });
  }
}