import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Settings as SettingsIcon, Save, ExternalLink, HelpCircle, RefreshCw, CheckCircle2, XCircle, Users } from "lucide-react";
import { useSettings, useWhatsAppStatus, useWhatsAppGroups } from "@/hooks/useSettings";
import QRCode from "react-qr-code";

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
    const { statusQuery, qrQuery } = useWhatsAppStatus();
    const { data: groupsData, isLoading: groupsLoading, refetch: refetchGroups } = useWhatsAppGroups();
    const [showToken, setShowToken] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsSchema),
        values: settingsQuery.data || {},
    });

    const onSubmit = (data: SettingsFormValues) => {
        updateSettingsMutation.mutate(data);
    };

    const selectGroup = (id: string) => {
        setValue("wa_group_id", id);
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>Core Configuration</CardTitle>
                        <CardDescription>
                            Configure your GitHub integration and notification webhooks.
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

                            <Button type="submit" disabled={updateSettingsMutation.isPending} className="w-full">
                                <Save className="mr-2 h-4 w-4" />
                                {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            WhatsApp Connection
                            <div className={`flex items-center gap-2 text-xs font-normal border px-2 py-1 rounded-full ${statusQuery.data?.status === 'CONNECTED'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : statusQuery.data?.status === 'AWAITING_SCAN'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                {statusQuery.data?.status === 'CONNECTED' ? (
                                    <CheckCircle2 className="h-3 w-3" />
                                ) : statusQuery.data?.status === 'AWAITING_SCAN' ? (
                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                ) : (
                                    <XCircle className="h-3 w-3" />
                                )}
                                {statusQuery.data?.status || 'UNKNOWN'}
                            </div>
                        </CardTitle>
                        <CardDescription>
                            Link your WhatsApp account using Baileys bridge to receive reports in groups.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center p-8 space-y-6">
                        {statusQuery.data?.status === 'CONNECTED' ? (
                            <div className="w-full space-y-6">
                                <div className="text-center space-y-4">
                                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-lg">Connected</h3>
                                        <p className="text-xs text-muted-foreground">
                                            Your account is active and ready.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-4 border-t">
                                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        <span className="flex items-center gap-2">
                                            <Users className="h-3.5 w-3.5" />
                                            Select a Group
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 px-2 text-[10px]"
                                            onClick={() => refetchGroups()}
                                            disabled={groupsLoading}
                                        >
                                            <RefreshCw className={`h-3 w-3 mr-1 ${groupsLoading ? 'animate-spin' : ''}`} />
                                            Refresh
                                        </Button>
                                    </div>
                                    <div className="max-h-[200px] overflow-y-auto space-y-1 pr-2 thin-scrollbar">
                                        {groupsData?.groups?.length ? (
                                            groupsData.groups.map(g => (
                                                <button
                                                    key={g.id}
                                                    onClick={() => selectGroup(g.id)}
                                                    className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-100 transition-colors text-sm flex items-center justify-between group"
                                                >
                                                    <div className="flex flex-col truncate">
                                                        <span className="truncate font-medium">{g.subject}</span>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {(g as any).participants} members {(g as any).isAnnouncement ? '• Announcement' : ''}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                                                        Select
                                                    </span>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="text-center py-4 text-xs text-muted-foreground italic">
                                                {groupsLoading ? 'Loading groups...' : 'No groups found'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : statusQuery.data?.status === 'AWAITING_SCAN' && qrQuery.data?.qr ? (
                            <div className="space-y-6 text-center">
                                <div className="bg-white p-4 rounded-xl shadow-sm border mx-auto inline-block">
                                    <QRCode value={qrQuery.data.qr} size={256} />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Scan this QR code with WhatsApp</p>
                                    <p className="text-xs text-muted-foreground max-w-[280px]">
                                        Open WhatsApp on your phone &gt; Linked Devices &gt; Link a Device.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center space-y-4 py-8">
                                <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                                    <RefreshCw className="h-8 w-8 text-slate-400 animate-spin" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Connecting to Bridge...</p>
                                    <p className="text-xs text-muted-foreground">Make sure the whatsapp-bridge service is running.</p>
                                </div>
                            </div>
                        )}

                        <div className="w-full pt-4 border-t text-[10px] text-muted-foreground italic text-center">
                            Connection is managed via a dedicated Node.js bridge using Baileys protocol.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
