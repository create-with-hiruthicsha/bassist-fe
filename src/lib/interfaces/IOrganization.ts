export interface Organization {
  id: string;
  name: string;
  created_at: string;
}

export interface OrganizationMember {
  user_id: string;
  organization_id: string;
  role: 'owner' | 'member';
  created_at: string;
}

export interface OrganizationWithRole extends Organization {
  role: 'owner' | 'member';
}
