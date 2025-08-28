/**
 * Example User repository to demonstrate repository pattern
 */

import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { InjectRepository, Injectable } from '../common';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>
  ) {}

  /**
   * Create a new user
   */
  async create(userData: Partial<User>): Promise<User> {
    const user = this.repository.create(userData);
    return this.repository.save(user);
  }

  /**
   * Find user by ID
   */
  async findById(id: number): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  /**
   * Find all users with pagination
   */
  async findAll(page = 1, limit = 10): Promise<{
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const [users, total] = await this.repository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update user
   */
  async update(id: number, updateData: Partial<User>): Promise<User | null> {
    await this.repository.update(id, updateData);
    return this.findById(id);
  }

  /**
   * Delete user
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Check if user exists by email
   */
  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.repository.count({ where: { email } });
    return count > 0;
  }

  /**
   * Find users by role
   */
  async findByRole(role: string): Promise<User[]> {
    return this.repository.find({ where: { role } });
  }

  /**
   * Find active users
   */
  async findActiveUsers(): Promise<User[]> {
    return this.repository.find({ where: { isActive: true } });
  }

  /**
   * Count total users
   */
  async count(): Promise<number> {
    return this.repository.count();
  }

  /**
   * Search users by name or email
   */
  async search(term: string): Promise<User[]> {
    return this.repository
      .createQueryBuilder('user')
      .where('user.name ILIKE :term OR user.email ILIKE :term', {
        term: `%${term}%`,
      })
      .getMany();
  }
}