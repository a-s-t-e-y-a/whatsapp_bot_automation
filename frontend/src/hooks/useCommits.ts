import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';

export interface CommitAnalysis {
    id: string;
    hash: string;
    message: string;
    author: string;
    timestamp: string;
    url: string;
    change_type: string;
    summary: string;
    details: string;
    impact_score: number;
    key_changes: string[];
    potential_issues: string[];
    technologies: string[];
    analysis_status: 'completed' | 'failed' | 'pending';
    error?: string;
}

export const useCommits = (repoId: string | null, params: { page?: number; limit?: number; date?: string } = {}) => {
    const commitsQuery = useQuery({
        queryKey: ['commits', repoId, params],
        queryFn: async () => {
            if (!repoId) return [];
            const encodedId = encodeURIComponent(repoId);
            const { data } = await api.get<CommitAnalysis[]>(`/repositories/${encodedId}/commits`, {
                params: {
                    page: params.page || 1,
                    limit: params.limit || 20,
                    date: params.date || undefined,
                }
            });
            return data;
        },
        enabled: !!repoId,
    });

    return { commitsQuery };
};
