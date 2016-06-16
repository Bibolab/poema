import { Injectable, Inject } from '@angular/core';
import { Http, Headers, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { TranslateService } from 'ng2-translate/ng2-translate';

import { ReferenceService } from './reference.service';
import { Project, Task, TaskType, Tag, User, Attachment } from '../models';
import { serializeObj } from '../utils/obj-utils';

const TASK_VIEW = 'p?id=task-view';
const TASK_FORM = 'p?id=task-form';
const HEADERS = new Headers({
    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
    'Accept': 'application/json'
});

@Injectable()
export class TaskService {

    constructor(
        private http: Http,
        private translate: TranslateService,
        private referenceService: ReferenceService
    ) { }

    createURLSearchParams(_params): URLSearchParams {
        let params: URLSearchParams = new URLSearchParams();
        for (let p in _params) {
            if (_params[p]) {
                params.set(encodeURIComponent(p), encodeURIComponent(_params[p]));
            }
        }
        return params;
    }

    getTaskPriorityType() {
        return this.translate.get(['urgent', 'high', 'medium', 'normal']).map(t => [
            { value: 'URGENT', text: t.urgent },
            { value: 'HIGH', text: t.high },
            { value: 'MEDIUM', text: t.medium },
            { value: 'NORMAL', text: t.normal, default: true }
        ]);
    }

    getTaskStatusType() {
        return this.translate.get(['draft', 'waiting', 'processed', 'finished']).map(t => [
            { value: 'DRAFT', text: t.draft, default: true },
            { value: 'WAITING', text: t.waiting },
            { value: 'PROCESSED', text: t.processed },
            { value: 'FINISHED', text: t.finished }
        ]);
    }

    getTasks(params = {}) {
        return this.http.get(TASK_VIEW, {
            headers: HEADERS,
            search: this.createURLSearchParams(params)
        })
            .map(response => response.json().objects[0])
            .map(data => {
                return {
                    tasks: <Task[]>data.list,
                    meta: data.meta
                }
            });
    }

    getTaskById(taskId: string) {
        if (taskId === 'new') {
            return Observable.of(<Task>this.makeTask({}));
        }

        return this.http.get(TASK_FORM + '&taskId=' + taskId, { headers: HEADERS })
            .map(response => <Task>this.makeTask(response.json().objects[1]));
    }

    saveTask(task: Task) {
        let url = TASK_FORM + (task.id ? '&taskId=' + task.id : '');
        return this.http.post(url, this.serializeTask(task), { headers: HEADERS })
            .map(response => this.transformPostResponse(response))
            .catch(error => Observable.throw(this.transformPostResponse(error)));
    }

    deleteTask(task: Task) {
        return this.http.delete(TASK_VIEW);
    }

    private transformPostResponse(response: Response) {
        let json = response.json();
        return {
            ok: json.type === 'DOCUMENT_SAVED',
            message: json.captions ? json.captions.type : json.message,
            validation: json.validation,
            redirectURL: json.redirectURL,
            type: json.type
        };
    }

    private makeTask(json: any): Task {
        let task: Task = new Task();

        task.id = json.id;
        task.regDate = json.regDate;
        task.wasRead = json.wasRead;

        if (json.projectId) {
            task.project = new Project();
            task.project.id = json.projectId;
        }

        if (json.parentTaskId) {
            task.parent = new Task();
            task.parent.id = json.parentTaskId;
        }

        task.children = [];

        if (json.taskTypeId) {
            task.taskType = new TaskType();
            task.taskType.id = json.taskTypeId;
        }

        task.status = json.status || 'DRAFT';
        task.priority = json.priority || 'NORMAL';
        task.body = json.body;

        if (json.assigneeUserId) {
            task.assignee = new User();
            task.assignee.id = json.assigneeUserId;
        }

        task.startDate = json.startDate;
        task.dueDate = json.dueDate;

        if (json.tagIds) {
            task.tags = json.tagIds.map(id => {
                let t = new Tag();
                t.id = id;
                return t;
            });
        }
        task.attachments = [];


        // "projectId",
        // "childrenTaskIds",
        // "status",
        // "priority",
        // "body",
        // "attachments",
        // "customerObservation",
        // "tagIds",
        // "taskTypeId",
        // "url",
        // "assigneeUserId",

        return task;
    }

    //
    private serializeTask(task: Task): string {
        return serializeObj({
            projectId: task.project.id,
            taskTypeId: task.taskType.id || '',
            status: task.status,
            priority: task.priority,
            body: task.body,
            assigneeUserId: task.assignee.id,
            startDate: task.startDate,
            dueDate: task.dueDate,
            tagIds: Array.isArray(task.tags) ? task.tags.map(it => it.id) : '',
            fileIds: Array.isArray(task.attachments) ? task.attachments.join(',') : ''
        });
    }
}
