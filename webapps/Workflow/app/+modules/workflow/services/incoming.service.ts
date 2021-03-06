import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';

import { AppService, DataService } from '../../../services';
import { Incoming } from '../models';
import { xhrHeaders, createURLSearchParams, parseResponseObjects, serializeObj, transformPostResponse } from '../../../utils/utils';

@Injectable()
export class WorkflowIncomingService {

    constructor(
        private http: Http,
        private appService: AppService,
        private dataService: DataService
    ) { }

    fetch(params: any, retry = 1) {
        return this.dataService.get('/Workflow/p', params, retry);
    }

    fetchIncomings(queryParams = {}) {
        return this.http.get('/Workflow/p?id=incoming-view', {
            headers: xhrHeaders(),
            search: createURLSearchParams(queryParams)
        })
            .map(response => {
                let data = parseResponseObjects(response.json().objects);
                return data;
            })
            .catch(error => this.appService.handleError(error));
    }

    fetchIncomingById(id: string) {
        let url = '/Workflow/p?id=incoming-form&docid=' + (id !== 'new' ? id : '');

        return this.http.get(url, { headers: xhrHeaders() })
            .map(response => {
                let data = parseResponseObjects(response.json().objects);
                let incoming = <any>data.incoming;
                if (!incoming.id) {
                    incoming.id = '';
                }
                if (data.fsid) {
                    incoming.fsid = data.fsid;
                }
                if (data.ACL) {
                    incoming.acl = data.ACL;
                }
                if (data.attachment) {
                    incoming.attachments = data.attachment.list;
                }
                return {
                    incoming: <Incoming>incoming,
                    actions: data.actions
                }
            })
            .catch(error => this.appService.handleError(error));
    }

    doAction(actionId: string) {
        return this.http.put('/Workflow/p?id=incoming-view&_action=' + actionId, '', { headers: xhrHeaders() })
            .map(response => transformPostResponse(response))
            .catch(error => this.appService.handleError(error));
    }
}
