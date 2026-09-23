"use client"

import { useState } from "react";
import { Ellipsis } from "lucide-react";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Discussion } from "@/src/types/models";
import { useRouter } from "next/navigation";
import { CustomAlertDialog } from "../custom/alert-dialog";
import { deleteDiscussion, updateDiscussionStatus } from "@/src/lib/actions/discussion-actions";
import DiscussionFormDialog from "./discussion-form-dialog";
import { DiscussionStatus } from "@/src/types/enums";
import { useToast } from "@/src/hooks/use-toast";

export function DiscussionDropdownMenu({ discussion, showVisit = true }: { discussion: Discussion, showVisit?: boolean }) {
    const [editOpen, setEditOpen] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleUpdateStatus = async (status: DiscussionStatus) => {
        const res = await updateDiscussionStatus(discussion.id!, status);
        toast({
            description: res.message,
            variant: res.success ? "default" : "destructive",
        });

        // Refresh the page if the user is on the discussion page
        if (!showVisit) {
            router.refresh();
        }
    }


    const handleDelete = async () => {
        const res = await deleteDiscussion(discussion.id!);
        toast({
            description: res.message,
            variant: res.success ? "default" : "destructive",
        });

        // Redirect to user profile discussions page if deletion is successful
        if (res.success) {
            router.push("/profile/discussions");
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-6 w-6 p-0"><Ellipsis size={15} /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="w-36"
                    // Keep focus from jumping back to the trigger so the edit dialog can receive it
                    onCloseAutoFocus={(event) => event.preventDefault()}
                >
                    <DropdownMenuGroup>
                        {showVisit &&
                            <DropdownMenuItem
                                title="Visit discussion page"
                                className="px-4"
                                onClick={() => router.push(`/discussions/${discussion.id}`)}
                            >
                                Visit
                            </DropdownMenuItem>
                        }
                        {/* Open edit dialog outside the menu — nesting traps focus/pointer events */}
                        <DropdownMenuItem
                            title="Edit"
                            className="px-4"
                            onSelect={() => {
                                // Defer until the dropdown fully closes and Radix clears
                                // body { pointer-events: none }, otherwise the dialog is inert.
                                setTimeout(() => setEditOpen(true), 0);
                            }}
                        >
                            Edit
                        </DropdownMenuItem>
                        {discussion.status === DiscussionStatus.OPEN ?
                            <DropdownMenuItem
                                title="Do not allow new replies"
                                className="px-4"
                                onClick={() => handleUpdateStatus(DiscussionStatus.CLOSED)}
                            >
                                Close
                            </DropdownMenuItem> :
                            <DropdownMenuItem
                                title="Allow new replies"
                                className="px-4"
                                onClick={() => handleUpdateStatus(DiscussionStatus.OPEN)}
                            >
                                Open
                            </DropdownMenuItem>
                        }
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onSelect={(event) => {
                            event.preventDefault(); // Prevent dialog from closing
                        }}
                        className="hover:text-destructive">
                        <CustomAlertDialog
                            triggerText="Delete"
                            buttonVariant="ghost"
                            confirmButtonVariant="destructive"
                            title="Are you Sure ?"
                            description="This action cannot be undone."
                            confirmText="Delete discussion"
                            onConfirm={handleDelete}
                            buttonClass="h-full hover:text-destructive pl-0"
                        />
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            {editOpen && (
                <DiscussionFormDialog
                    open={editOpen}
                    onOpenChange={setEditOpen}
                    data={{
                        id: discussion.id,
                        title: discussion.title,
                        body: discussion.body,
                        category: discussion.category,
                        tags: discussion.tags,
                        files: discussion.files ?? undefined,
                        creator: discussion.creator?.id,
                    }}
                />
            )}
        </>
    )
}
