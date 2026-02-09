import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';

export interface Settings {
    github_token?: string;
    wa_group_id?: string;
    google_chat_webhook_url?: string;
    slack_webhook_url?: string;
}

export const useSettings = () => {
    const queryClient = useQueryClient();

    const settingsQuery = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const { data } = await api.get<Settings>('/settings');
            return data;
        },
    });

    const updateSettingsMutation = useMutation({
        mutationFn: async (settings: Settings) => {
            const { data } = await api.put('/settings', settings);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
        },
    });

    return { settingsQuery, updateSettingsMutation };
};

export const useWhatsAppStatus = () => {
    const statusQuery = useQuery({
        queryKey: ['whatsapp-status'],
        queryFn: async () => {
            const { data } = await api.get<{ status: string; error?: string }>('/settings/whatsapp/status');
            return data;
        },
        refetchInterval: (query) => (query.state.data?.status === 'CONNECTED' ? 30000 : 5000),
    });

    const qrQuery = useQuery({
        queryKey: ['whatsapp-qr'],
        queryFn: async () => {
            const { data } = await api.get<{ qr?: string; error?: string }>('/settings/whatsapp/qr');
            return data;
        },
        enabled: statusQuery.data?.status === 'AWAITING_SCAN',
        refetchInterval: 10000,
    });

    return { statusQuery, qrQuery };
};

export const useWhatsAppGroups = () => {
    return useQuery({
        queryKey: ['whatsapp-groups'],
        queryFn: async () => {
            const { data } = await api.get<{ groups: { id: string; subject: string }[]; error?: string }>('/settings/whatsapp/groups');
            return data;
        },
        enabled: true,
        staleTime: 60000,
    });
};
