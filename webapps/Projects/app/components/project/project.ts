import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ROUTER_DIRECTIVES } from '@angular/router';
import { FormBuilder, Validators, ControlGroup, Control, FORM_DIRECTIVES } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { TranslatePipe, TranslateService } from 'ng2-translate/ng2-translate';

import { NotificationService } from '../../shared/notification';
import { DatepickerDirective } from '../../shared/datepicker/datepicker';
import { DROPDOWN_DIRECTIVES } from '../../shared/dropdown';
import { MarkdownEditorComponent } from '../../shared/markdown';
import { SwitchButtonComponent } from '../../shared/switch-button';
import { OrganizationInputComponent, UserInputComponent } from '../shared';
import { AttachmentsComponent } from '../attachment/attachments';
import { TextTransformPipe } from '../../pipes';
import { ProjectService } from '../../services';
import { Project, Organization, User, Attachment } from '../../models';

@Component({
    selector: 'project',
    template: require('./templates/project.html'),
    directives: [
        ROUTER_DIRECTIVES,
        FORM_DIRECTIVES,
        DROPDOWN_DIRECTIVES,
        SwitchButtonComponent,
        OrganizationInputComponent,
        UserInputComponent,
        AttachmentsComponent,
        MarkdownEditorComponent,
        DatepickerDirective
    ],
    providers: [FormBuilder],
    pipes: [TranslatePipe, TextTransformPipe]
})

export class ProjectComponent {
    private sub: any;
    isReady = false;
    isNew = true;
    isEditable = true;
    project: Project;
    form: ControlGroup;
    projectStatusTypes: any;

    constructor(
        private store: Store<any>,
        private router: Router,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private translate: TranslateService,
        private projectService: ProjectService,
        private notifyService: NotificationService
    ) {
        this.form = this.formBuilder.group({
            name: ['', Validators.required],
            status: [''],
            customerUserId: [''],
            managerUserId: [''],
            programmerUserId: [''],
            testerUserId: [''],
            observerUserIds: [''],
            comment: [''],
            finishDate: [''],
            attachments: ['']
        });
    }

    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            this.projectService.fetchProjectById(params['projectId']).subscribe(
                project => {
                    this.project = project;
                    this.isNew = this.project.id == '';
                    this.isEditable = this.isNew || this.project.editable;
                    this.isReady = true;
                    this.loadData();
                },
                error => this.handleXhrError(error)
            );
        });
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    get title() {
        if (this.isNew) {
            return 'new_project';
        } else {
            return 'project';
        }
    }

    loadData() {
        this.projectService.getProjectStatusTypes().subscribe(pst => this.projectStatusTypes = pst);
    }

    saveProject() {
        let noty = this.notifyService.process(this.translate.instant('wait_while_document_save')).show();
        this.projectService.saveProject(this.project).subscribe(
            response => {
                noty.set({ type: 'success', message: response.message });
                this.close();
                return response;
            },
            error => {
                noty.remove();
                this.handleXhrError(error);
                return error;
            },
            () => noty.remove(1500)
        );
    }

    deleteProject() {
        this.projectService.deleteProject([this.project]).subscribe(
            data => this.close(),
            error => this.handleXhrError(error)
        );
    }

    close() {
        this.router.navigate(['/projects']);
    }

    handleXhrError(errorResponse) {
        console.log(errorResponse);
        if (errorResponse.status === 401) {
            this.router.navigate(['/login']);
        } else {
            this.notifyService.error(errorResponse.message).show().remove(2000);
        }
    }

    setStatus(value) {
        this.project.status = value;
    }

    setCustomer(customer: Organization) {
        this.project.customerId = customer.id;
    }

    setManager(user: User[]) {
        this.project.managerUserId = user[0].id;
    }

    setProgrammer(user: User[]) {
        this.project.programmerUserId = user[0].id;
    }

    setTester(user: User[]) {
        this.project.testerUserId = user[0].id;
    }

    setObserver(observers: User[]) {
        this.project.observerUserIds = observers.map(it => it.id);
    }

    removeObserver(observer: User, $event) {
        this.project.observerUserIds.forEach((id, index) => {
            if (id === observer.id) {
                this.project.observerUserIds.splice(index, 1);
            }
        });

        $event.stopPropagation();
    }

    setFinishDate(date) {
        this.project.finishDate = date;
    }

    setProjectComment(text: string) {
        this.project.comment = text;
    }

    addAttachment(file) {
        let att: Attachment = new Attachment();
        att.realFileName = file.files[0];
        if (!this.project.attachments) {
            this.project.attachments = [];
        }
        if (!this.project.fsid) {
            this.project.fsid = '' + Date.now();
        }
        this.project.attachments.push(att);
    }

    deleteAttachment(attachment: Attachment) {
        this.projectService.deleteProjectAttachment(this.project, attachment).subscribe(r => {
            this.project.attachments = this.project.attachments.filter(it => it.id != attachment.id);
        });
    }
}
