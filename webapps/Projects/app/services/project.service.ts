import { Injectable, Inject } from '@angular/core';
import { Http, Headers, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { TranslateService } from 'ng2-translate/ng2-translate';

import { Project } from '../models/project';
import { serializeObj } from '../utils/obj-utils';

const VIEW_URL = 'p?id=project-view';
const FORM_URL = 'p?id=project-form';
const HEADER = {
    headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        'Accept': 'application/json'
    })
};

@Injectable()
export class ProjectService {

    constructor(
        private http: Http,
        private translate: TranslateService
    ) { }

    getProjectStatusTypes() {
        return this.translate.get(['draft', 'processed', 'finished']).map(t => [
            { value: 'DRAFT', text: t.draft, default: true },
            { value: 'PROCESSED', text: t.processed },
            { value: 'FINISHED', text: t.finished }
        ]);
    }

    getProjects(_params = {}) {
        let params: URLSearchParams = new URLSearchParams();
        for (let p in _params) {
            params.set(p, _params[p]);
        }

        return this.http.get(VIEW_URL, {
            headers: HEADER.headers,
            search: params
        })
            .map(response => response.json().objects[0])
            .map(data => {
                return {
                    projects: <Project[]>data.list,
                    meta: data.meta
                }
            });
    }

    getProjectById(projectId: string) {
        return this.http.get(FORM_URL + '&docid=' + projectId, HEADER)
            .map(response => <Project>response.json().objects[1]);
    }

    saveProject(project: Project) {
        let url = FORM_URL + (project.id ? '&docid=' + project.id : '');
        return this.http.post(url, this.serializeProject(project), HEADER)
            .map(response => this.transformPostResponse(response))
            .catch(error => Observable.throw(this.transformPostResponse(error)));
    }

    deleteProject(projects: Project[]) {
        return this.http.delete(VIEW_URL);
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

    //
    private serializeProject(project: Project): string {
        return serializeObj({
            name: project.name,
            status: project.status,
            customerUserId: project.customerUserId || '',
            managerUserId: project.managerUserId || '',
            programmerUserId: project.programmerUserId || '',
            testerUserId: project.testerUserId || '',
            observerUserIds: Array.isArray(project.observerUserIds) ? project.observerUserIds.join(',') : project.observerUserIds,
            comment: project.comment,
            finishDate: project.finishDate ? project.finishDate.toString() : '',
            fileIds: project.fileIds ? project.fileIds.join(',') : ''
        });
    }
}