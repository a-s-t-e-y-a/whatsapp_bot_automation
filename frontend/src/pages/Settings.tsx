import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Settings as SettingsIcon, Save } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

const settingsSchema = z.object({
    github_token: z.string().optional(),
    wa_group_id: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
    const { settingsQuery, updateSettingsMutation } = useSettings();
    const [showToken, setShowToken] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsSchema),
        values: settingsQuery.data || {},
    });

    const onSubmit = (data: SettingsFormValues) => {
        updateSettingsMutation.mutate(data);
    };

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="flex items-center gap-3">
                <SettingsIcon className="h-8 w-8" />
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground">
                        Configure your GitHub integration and notification preferences.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>GitHub Integration</CardTitle>
                    <CardDescription>
                        Configure your GitHub Personal Access Token to enable commit analysis for private repositories.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                GitHub Personal Access Token
                            </label>
                            <div className="flex gap-2">
                                <Input
                                    type={showToken ? "text" : "password"}
                                    placeholder="github_pat_xxxxxxxxxxxxx"
                                    {...register("github_token")}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowToken(!showToken)}
                                >
                                    {showToken ? "Hide" : "Show"}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Generate a token with <code>Contents: Read</code> and <code>Metadata: Read</code> permissions.
                            </p>
                            {errors.github_token && (
                                <p className="text-xs text-destructive">
                                    {errors.github_token.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                WhatsApp Group ID
                            </label>
                            <Input
                                placeholder="120363xxxxx@g.us"
                                {...register("wa_group_id")}
                            />
                            <p className="text-xs text-muted-foreground">
                                The WhatsApp group where daily updates will be sent.
                            </p>
                            {errors.wa_group_id && (
                                <p className="text-xs text-destructive">
                                    {errors.wa_group_id.message}
                                </p>
                            )}
                        </div>

                        <Button type="submit" disabled={updateSettingsMutation.isPending}>
                            <Save className="mr-2 h-4 w-4" />
                            {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
