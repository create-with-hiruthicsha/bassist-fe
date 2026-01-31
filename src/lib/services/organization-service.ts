import { Organization, OrganizationWithRole } from '../interfaces';
import { apiClient } from './api-client';

export const organizationService = {
	async createOrganization(name: string): Promise<Organization> {
		const response = await apiClient.post<Organization>('organizations', { name });
		return response;
	},

	async getOrganization(id: string): Promise<OrganizationWithRole> {
		const response = await apiClient.get<OrganizationWithRole>(`organizations/${id}`);
		return response;
	},

	async joinOrganization(joinCode: string): Promise<Organization> {
		const response = await apiClient.post<Organization>('organizations/join', { joinCode });
		return response;
	},

	async getJoinCode(id: string): Promise<string> {
		const response = await apiClient.get<{ joinCode: string }>(`organizations/${id}/join-code`);
		return response.joinCode;
	},

	async rotateJoinCode(id: string): Promise<string> {
		const response = await apiClient.post<{ joinCode: string }>(`organizations/${id}/rotate-join-code`, {});
		return response.joinCode;
	},

};
