import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';

export interface Repository {
    id: string;
    url: string;
    owner: string;
    repo: string;
}

export const useRepositories = () => {
    const queryClient = useQueryClient();

    const reposQuery = useQuery({
        queryKey: ['repositories'],
        queryFn: async () => {
            const { data } = await api.get<Repository[]>('/repositories');
            return data;
        },
    });

    const addRepoMutation = useMutation({
        mutationFn: async (newRepo: { url: string; owner: string; repo: string; secret?: string }) => {
            const { data } = await api.post('/repositories', newRepo);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['repositories'] });
        },
    });

    const deleteRepoMutation = useMutation({
        mutationFn: async (repoId: string) => {
            const { data } = await api.delete(`/repositories/${repoId}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['repositories'] });
        },
    });

    const updateRepoMutation = useMutation({
        mutationFn: async ({ id, repo }: { id: string; repo: { url: string; owner: string; repo: string; secret?: string } }) => {
            const { data } = await api.put(`/repositories/${id}`, repo);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['repositories'] });
        },
    });

    return { reposQuery, addRepoMutation, deleteRepoMutation, updateRepoMutation };
};
