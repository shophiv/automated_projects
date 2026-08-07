import { query } from '../../config/database';

export class AuthRepository {
  async createWorkspace(businessName: string, ownerName: string, email: string, phone: string, address: string) {
    const res = await query(
      `INSERT INTO retailer_workspaces (business_name, owner_name, email, phone, address, status)
       VALUES ($1, $2, $3, $4, $5, 'active') RETURNING id`,
      [businessName, ownerName, email, phone, address]
    );
    return res.rows[0].id;
  }

  async createUser(tenantId: string, name: string, email: string, passwordHash: string, role: string) {
    const res = await query(
      `INSERT INTO users (tenant_id, name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, tenant_id, name, email, role, created_at`,
      [tenantId, name, email, passwordHash, role]
    );
    return res.rows[0];
  }

  async findUserByEmail(email: string) {
    const res = await query(
      `SELECT u.*, r.status as workspace_status 
       FROM users u 
       JOIN retailer_workspaces r ON u.tenant_id = r.id 
       WHERE u.email = $1`,
      [email]
    );
    return res.rows[0] || null;
  }

  async findWorkspaceByEmail(email: string) {
    const res = await query(
      `SELECT * FROM retailer_workspaces WHERE email = $1`,
      [email]
    );
    return res.rows[0] || null;
  }

  async logAudit(tenantId: string | null, userId: string | null, action: string) {
    await query(
      `INSERT INTO audit_logs (tenant_id, user_id, action) VALUES ($1, $2, $3)`,
      [tenantId, userId, action]
    );
  }
}