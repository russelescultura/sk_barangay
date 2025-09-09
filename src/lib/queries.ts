// SQL queries for direct database access
// Use these with mysql2 when Prisma doesn't meet your needs

export const userQueries = {
  // Get all users with pagination
  getAllUsers: `
    SELECT id, email, name, created_at, updated_at 
    FROM users 
    ORDER BY created_at DESC 
    LIMIT ? OFFSET ?
  `,
  
  // Get user by ID
  getUserById: `
    SELECT id, email, name, created_at, updated_at 
    FROM users 
    WHERE id = ?
  `,
  
  // Create new user
  createUser: `
    INSERT INTO users (id, email, name, created_at, updated_at) 
    VALUES (?, ?, ?, NOW(), NOW())
  `,
  
  // Update user
  updateUser: `
    UPDATE users 
    SET email = ?, name = ?, updated_at = NOW() 
    WHERE id = ?
  `,
  
  // Delete user
  deleteUser: `
    DELETE FROM users 
    WHERE id = ?
  `,
} 