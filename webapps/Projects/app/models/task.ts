import { Attachment } from './attachment';
import { Project } from './project';
import { Request } from './request';

export class Task {
    id: string = '';
    author: string;
    authorId: string;
    regDate: Date;
    editable: boolean = false;
    wasRead: boolean;
    fsid: string = '' + Date.now();
    acl: any = {};
    children: any = {};

    project: Project;
    projectId: string;
    parentTask: Task;
    parentTaskId: string;
    hasSubtasks: boolean;
    hasRequests: boolean;
    hasComments: boolean;
    taskTypeId: string;
    status: string = 'DRAFT';
    priority: string = 'NORMAL';
    regNumber: string;
    title: string;
    body: string;
    assigneeUserId: string;
    startDate: Date;
    dueDate: Date;
    tagIds: string[];
    observerUserIds: string[];
    customerObservation: boolean = false;
    cancellationComment: string;
    hasAttachments: boolean;
    attachmentIds: string[];

    attachments: Attachment[];
    requests: Request[];
}
