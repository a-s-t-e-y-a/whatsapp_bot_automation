import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Github, RefreshCw, Pencil, Trash2 } from "lucide-react";
import { useRepositories, type Repository } from "@/hooks/useRepositories";

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
    const [deleteRepoId, setDeleteRepoId] = useState<string | null>(null);
    const [editingRepo, setEditingRepo] = useState<Repository | null>(null);
    const { reposQuery, addRepoMutation, deleteRepoMutation, updateRepoMutation } = useRepositories();

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
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Repositories</CardTitle>
                        <Github className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {reposQuery.data?.length || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Automation Status</CardTitle>
                        <RefreshCw className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Active</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Monitored Repositories</CardTitle>
                    <CardDescription>
                        Repositories currently being tracked for daily work updates.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {reposQuery.isLoading ? (
                        <div className="flex justify-center py-8">Loading repositories...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Owner</TableHead>
                                    <TableHead>URL</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reposQuery.data?.map((repo: Repository) => (
                                    <TableRow key={repo.id}>
                                        <TableCell className="font-medium">{repo.repo}</TableCell>
                                        <TableCell>{repo.owner}</TableCell>
                                        <TableCell className="text-muted-foreground truncate max-w-xs">
                                            {repo.url}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onEdit(repo)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setDeleteRepoId(repo.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {reposQuery.data?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8">
                                            No repositories registered yet.
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
