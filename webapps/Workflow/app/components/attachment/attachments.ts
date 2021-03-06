import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Http, Headers } from '@angular/http';

import { UploadService } from '../../services';
import { Attachment } from '../../models';

@Component({
    selector: 'attachments',
    templateUrl: './attachments.html',
    providers: [UploadService],
    host: {
        '[class.hidden]': 'isHidden'
    }
})

export class AttachmentsComponent {
    @Input() model: any;
    @Input() editable: boolean = false;
    @Output() upload = new EventEmitter<any>();
    @Output() delete = new EventEmitter<any>();

    private sub: any;
    private progress: number = 0;

    constructor(
        private http: Http,
        private uploadService: UploadService
    ) { }

    ngOnInit() {
        this.sub = this.uploadService.progress$.subscribe(progress => {
            if (progress && progress < 100) {
                this.progress = progress;
            } else {
                this.progress = 0;
            }
        });
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    isThumbnailSupported(att: Attachment): boolean {
        if (att.extension) {
            return ['jpeg', 'jpg', 'png', 'gif'].indexOf(att.extension) != -1;
        } else {
            return ['jpeg', 'jpg', 'png', 'gif'].indexOf(att.realFileName.toLowerCase().split('.').pop()) != -1;
        }
    }

    get isHidden() {
        return !this.editable && !this.model.attachments;
    }

    uploadFile(files: File[]) {
        this.uploadService.makeFileRequest('UploadFile?time=' + Date.now(), { fsid: this.model.fsid }, files).subscribe(response => {
            this.upload.emit({ response, files });
        });
    }
}
