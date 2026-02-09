import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Github, RefreshCw, Pencil, Trash2, History, ExternalLink, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from "lucide-react";
import { useRepositories, type Repository } from "@/hooks/useRepositories";
import { useCommits } from "@/hooks/useCommits";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const repoSchema = z.object({
    url: z.string().url("Please enter a valid GitHub repository URL"),
    owner: z.string().min(1, "Owner is required"),
    repo: z.string().min(1, "Repo name is required"),
    secret: z.string().optional(),
});

type RepoFormValues = z.infer<typeof repoSchema>;

export default function Dashboard() {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isCommitsOpen, setIsCommitsOpen] = useState(false);
    const [deleteRepoId, setDeleteRepoId] = useState<string | null>(null);
    const [editingRepo, setEditingRepo] = useState<Repository | null>(null);
    const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
    const [commitPage, setCommitPage] = useState(1);
    const [filterDate, setFilterDate] = useState<string>("");

    const { reposQuery, addRepoMutation, deleteRepoMutation, updateRepoMutation } = useRepositories();
    const { commitsQuery } = useCommits(selectedRepo?.url || null, {
        page: commitPage,
        date: filterDate || undefined
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<RepoFormValues>({
        resolver: zodResolver(repoSchema),
    });

    const {
        register: registerEdit,
        handleSubmit: handleSubmitEdit,
        reset: resetEdit,
        setValue,
        formState: { errors: editErrors },
    } = useForm<RepoFormValues>({
        resolver: zodResolver(repoSchema),
    });

    const onSubmit = (data: RepoFormValues) => {
        addRepoMutation.mutate(data, {
            onSuccess: () => {
                setIsAddOpen(false);
                reset();
            },
        });
    };

    const onEdit = (repo: Repository) => {
        setEditingRepo(repo);
        setValue("url", repo.url);
        setValue("owner", repo.owner);
        setValue("repo", repo.repo);
        setIsEditOpen(true);
    };

    const onEditSubmit = (data: RepoFormValues) => {
        if (!editingRepo) return;
        updateRepoMutation.mutate(
            { id: editingRepo.id, repo: data },
            {
                onSuccess: () => {
                    setIsEditOpen(false);
                    setEditingRepo(null);
                    resetEdit();
                },
            }
        );
    };

    const onDelete = (repoId: string) => {
        deleteRepoMutation.mutate(repoId, {
            onSuccess: () => {
                setDeleteRepoId(null);
            },
        });
    };

    const onViewCommits = (repo: Repository) => {
        setSelectedRepo(repo);
        setCommitPage(1);
        setFilterDate("");
        setIsCommitsOpen(true);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return {
            date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
            time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    };

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Agent Dashboard</h1>
                    <p className="text-muted-foreground">
                        Manage your repositories and automated work updates.
                    </p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Repository
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <DialogHeader>
                                <DialogTitle>Register Repository</DialogTitle>
                                <DialogDescription>
                                    Enter the details of the GitHub repository you want to monitor.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Repository URL</label>
                                    <Input
                                        placeholder="https://github.com/owner/repo"
                                        {...register("url")}
                                    />
                                    {errors.url && (
                                        <p className="text-xs text-destructive">
                                            {errors.url.message}
                                        </p>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Owner</label>
                                        <Input placeholder="owner" {...register("owner")} />
                                        {errors.owner && (
                                            <p className="text-xs text-destructive">
                                                {errors.owner.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Repo Name</label>
                                        <Input placeholder="repo" {...register("repo")} />
                                        {errors.repo && (
                                            <p className="text-xs text-destructive">
                                                {errors.repo.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Webhook Secret (Optional)</label>
                                    <Input
                                        type="password"
                                        placeholder="Secret"
                                        {...register("secret")}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={addRepoMutation.isPending}>
                                    {addRepoMutation.isPending ? "Adding..." : "Add Repository"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Edit DIalog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <form onSubmit={handleSubmitEdit(onEditSubmit)}>
                        <DialogHeader>
                            <DialogTitle>Edit Repository</DialogTitle>
                            <DialogDescription>
                                Update the repository details.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Repository URL</label>
                                <Input
                                    placeholder="https://github.com/owner/repo"
                                    {...registerEdit("url")}
                                />
                                {editErrors.url && (
                                    <p className="text-xs text-destructive">
                                        {editErrors.url.message}
                                    </p>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Owner</label>
                                    <Input placeholder="owner" {...registerEdit("owner")} />
                                    {editErrors.owner && (
                                        <p className="text-xs text-destructive">
                                            {editErrors.owner.message}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Repo Name</label>
                                    <Input placeholder="repo" {...registerEdit("repo")} />
                                    {editErrors.repo && (
                                        <p className="text-xs text-destructive">
                                            {editErrors.repo.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Webhook Secret (Optional)</label>
                                <Input
                                    type="password"
                                    placeholder="Secret"
                                    {...registerEdit("secret")}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={updateRepoMutation.isPending}>
                                {updateRepoMutation.isPending ? "Updating..." : "Update Repository"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Commits Dialog */}
            <Dialog open={isCommitsOpen} onOpenChange={setIsCommitsOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <div className="flex items-center justify-between pr-8">
                            <div>
                                <DialogTitle className="flex items-center gap-2">
                                    <History className="h-5 w-5" />
                                    Recent Commits: {selectedRepo?.repo}
                                </DialogTitle>
                                <DialogDescription>
                                    Analyzed work updates from this repository.
                                </DialogDescription>
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <div className="relative">
                                    <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                    <Input
                                        type="date"
                                        value={filterDate}
                                        onChange={(e) => {
                                            setFilterDate(e.target.value);
                                            setCommitPage(1);
                                        }}
                                        className="pl-9 w-[180px] h-9"
                                    />
                                </div>
                                {filterDate && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setFilterDate("");
                                            setCommitPage(1);
                                        }}
                                        className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground"
                                    >
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </div>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto mt-4 pr-2 space-y-4">
                        {commitsQuery.isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                                <p className="text-muted-foreground">Analyzing commit history...</p>
                            </div>
                        ) : commitsQuery.data?.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                                <p className="text-muted-foreground">
                                    {filterDate
                                        ? `No commits found for ${new Date(filterDate).toLocaleDateString()}.`
                                        : "No commits analyzed yet."}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {filterDate ? "Try a different date or clear the filter." : "Push some code to see the AI analysis!"}
                                </p>
                            </div>
                        ) : (
                            commitsQuery.data?.map((commit) => {
                                const { date, time } = formatDate(commit.timestamp);
                                return (
                                    <Card key={commit.hash} className="overflow-hidden border-l-4 border-l-primary/50 hover:border-l-primary transition-all shadow-sm">
                                        <CardHeader className="py-4 bg-muted/30">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${commit.change_type === 'feature' ? 'bg-emerald-100 text-emerald-700' :
                                                            commit.change_type === 'bugfix' ? 'bg-rose-100 text-rose-700' :
                                                                commit.change_type === 'refactor' ? 'bg-amber-100 text-amber-700' :
                                                                    'bg-blue-100 text-blue-700'
                                                            }`}>
                                                            {commit.change_type}
                                                        </span>
                                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium bg-background px-2 py-0.5 rounded border">
                                                            <CalendarIcon className="h-3 w-3" /> {date}
                                                            <Clock className="h-3 w-3 ml-1" /> {time}
                                                        </div>
                                                        <span className="text-xs font-mono text-muted-foreground opacity-60">
                                                            {commit.hash.slice(0, 7)}
                                                        </span>
                                                    </div>
                                                    <CardTitle className="text-base leading-tight pt-1">
                                                        {commit.summary || commit.message}
                                                    </CardTitle>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${commit.impact_score >= 8 ? 'text-rose-600 bg-rose-50' :
                                                        commit.impact_score >= 5 ? 'text-amber-600 bg-amber-50' :
                                                            'text-emerald-600 bg-emerald-50'
                                                        }`}>
                                                        Impact: {commit.impact_score}/10
                                                    </div>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="py-4 space-y-4">
                                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                                {commit.details}
                                            </p>

                                            {commit.key_changes?.length > 0 && (
                                                <div className="space-y-2">
                                                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                                        Key Changes
                                                    </h4>
                                                    <ul className="grid grid-cols-1 gap-1">
                                                        {commit.key_changes.map((change, i) => (
                                                            <li key={i} className="text-sm flex items-start gap-2">
                                                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                                                                {change}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {commit.potential_issues?.length > 0 && (
                                                <div className="space-y-2 pt-2 border-t text-rose-700 bg-rose-50/50 p-3 rounded-md">
                                                    <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                                        <AlertCircle className="h-3 w-3" />
                                                        Insights & Issues
                                                    </h4>
                                                    <ul className="space-y-1">
                                                        {commit.potential_issues.map((issue, i) => (
                                                            <li key={i} className="text-xs list-disc list-inside">
                                                                {issue}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between pt-2">
                                                <div className="flex flex-wrap gap-1">
                                                    {commit.technologies?.map(tech => (
                                                        <span key={tech} className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md">
                                                            {tech}
                                                        </span>
                                                    ))}
                                                </div>
                                                <Button variant="outline" size="sm" asChild className="h-8">
                                                    <a href={commit.url} target="_blank" rel="noopener noreferrer">
                                                        View on GitHub <ExternalLink className="ml-1 h-3 w-3" />
                                                    </a>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })
                        )}
                    </div>

                    <DialogFooter className="mt-4 pt-4 border-t sticky bottom-0 bg-background">
                        <div className="flex w-full items-center justify-between">
                            <span className="text-xs text-muted-foreground font-medium">
                                Tracking page {commitPage}
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={commitPage === 1 || commitsQuery.isLoading}
                                    onClick={() => setCommitPage(prev => Math.max(1, prev - 1))}
                                    className="h-8 w-24"
                                >
                                    <ChevronLeft className="mr-1 h-4 w-4" />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={(commitsQuery.data?.length || 0) < 20 || commitsQuery.isLoading}
                                    onClick={() => setCommitPage(prev => prev + 1)}
                                    className="h-8 w-24"
                                >
                                    Next
                                    <ChevronRight className="ml-1 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteRepoId} onOpenChange={() => setDeleteRepoId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this repository from monitoring. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteRepoId && onDelete(deleteRepoId)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="overflow-hidden border-t-4 border-t-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Repositories</CardTitle>
                        <Github className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-blue-600">
                            {reposQuery.data?.length || 0}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Currently monitoring</p>
                    </CardContent>
                </Card>
                <Card className="overflow-hidden border-t-4 border-t-emerald-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Daily Analysis</CardTitle>
                        <RefreshCw className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-emerald-600">Active</div>
                        <p className="text-xs text-muted-foreground mt-1">AI agent is scanning commits</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                        <Github className="h-6 w-6" />
                        Monitored Repositories
                    </CardTitle>
                    <CardDescription>
                        Repositories currently being tracked for daily work updates.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {reposQuery.isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-muted-foreground">Loading repositories...</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[200px]">Repository</TableHead>
                                    <TableHead>Owner</TableHead>
                                    <TableHead className="hidden md:table-cell">URL</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reposQuery.data?.map((repo: Repository) => (
                                    <TableRow key={repo.id} className="group hover:bg-muted/50 transition-colors">
                                        <TableCell className="font-bold text-primary group-hover:text-primary/80">
                                            {repo.repo}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-[10px] uppercase font-bold">
                                                    {repo.owner.slice(0, 2)}
                                                </div>
                                                {repo.owner}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground truncate max-w-xs hidden md:table-cell">
                                            {repo.url}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => onViewCommits(repo)}
                                                    className="bg-primary/10 text-primary hover:bg-primary/20"
                                                >
                                                    <History className="mr-1.5 h-3.5 w-3.5" />
                                                    View Commits
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onEdit(repo)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setDeleteRepoId(repo.id)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {reposQuery.data?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-12">
                                            <div className="flex flex-col items-center justify-center space-y-2">
                                                <Github className="h-8 w-8 text-muted-foreground/30" />
                                                <p className="text-muted-foreground">No repositories registered yet.</p>
                                                <Button variant="outline" size="sm" onClick={() => setIsAddOpen(true)}>
                                                    Register your first repository
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
