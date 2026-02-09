import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Settings as SettingsIcon, Save, ExternalLink, HelpCircle } from "lucide-react";
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
    google_chat_webhook_url: z.string().url("Please enter a valid URL").or(z.literal("")).optional(),
    slack_webhook_url: z.string().url("Please enter a valid URL").or(z.literal("")).optional(),
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

                        <div className="space-y-4 pt-4 border-t">
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center justify-between">
                                    Google Chat Webhook URL
                                    <a
                                        href="https://developers.google.com/workspace/chat/quickstart/webhooks"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] text-blue-500 hover:underline flex items-center gap-1"
                                    >
                                        Official Docs <ExternalLink className="h-2.5 w-2.5" />
                                    </a>
                                </label>
                                <Input
                                    placeholder="https://chat.googleapis.com/v1/spaces/..."
                                    {...register("google_chat_webhook_url")}
                                />
                                {errors.google_chat_webhook_url && (
                                    <p className="text-xs text-destructive">
                                        {errors.google_chat_webhook_url.message}
                                    </p>
                                )}
                            </div>

                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-3">
                                <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider">
                                    <HelpCircle className="h-4 w-4" />
                                    How to generate this URL
                                </div>
                                <ol className="text-xs text-blue-800 space-y-2 list-decimal list-inside leading-relaxed">
                                    <li>Open <strong>Google Chat</strong> and go to the space where you want reports.</li>
                                    <li>Click the space name at the top &gt; <strong>Apps & integrations</strong>.</li>
                                    <li>Select <strong>Webhooks</strong> &gt; <strong>Add webhook</strong>.</li>
                                    <li>Enter a name (e.g., "Commit Agent") and click <strong>Save</strong>.</li>
                                    <li>Copy the generated URL and paste it above.</li>
                                </ol>
                            </div>

                            <div className="space-y-4 pt-4 border-t">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center justify-between">
                                        Slack Webhook URL
                                        <a
                                            href="https://api.slack.com/messaging/webhooks"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[10px] text-blue-500 hover:underline flex items-center gap-1"
                                        >
                                            Official Docs <ExternalLink className="h-2.5 w-2.5" />
                                        </a>
                                    </label>
                                    <Input
                                        placeholder="https://hooks.slack.com/services/..."
                                        {...register("slack_webhook_url")}
                                    />
                                    {errors.slack_webhook_url && (
                                        <p className="text-xs text-destructive">
                                            {errors.slack_webhook_url.message}
                                        </p>
                                    )}
                                </div>

                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                                    <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider">
                                        <HelpCircle className="h-4 w-4" />
                                        How to generate Slack URL
                                    </div>
                                    <ol className="text-xs text-slate-800 space-y-2 list-decimal list-inside leading-relaxed">
                                        <li>Create a <strong>Slack App</strong> at <a href="https://api.slack.com/apps" target="_blank" className="font-bold underline">api.slack.com/apps</a>.</li>
                                        <li>Go to <strong>Incoming Webhooks</strong> and toggle it to **On**.</li>
                                        <li>Click <strong>Add New Webhook to Workspace</strong>.</li>
                                        <li>Pick a channel for the notifications and click <strong>Authorize</strong>.</li>
                                        <li>Copy the **Webhook URL** and paste it above.</li>
                                    </ol>
                                </div>
                            </div>
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
