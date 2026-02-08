import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';

export interface Settings {
    github_token?: string;
    wa_group_id?: string;
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
