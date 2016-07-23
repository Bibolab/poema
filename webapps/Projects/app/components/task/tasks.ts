import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute, ROUTER_DIRECTIVES } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslatePipe } from 'ng2-translate/ng2-translate';

import { NotificationService } from '../../shared/notification';
import { TextTransformPipe, DateFormatPipe } from '../../pipes';
import { PaginationComponent } from '../../shared/pagination';
import { TaskFilterComponent } from './task-filter';
import { Task } from '../../models/task';
import { TaskService } from '../../services/task.service';
import { TaskListComponent } from './task-list';
import { TaskComponent } from './task';
import { TaskActions } from '../../actions';
import { ITasksState } from '../../reducers/tasks.reducer';

@Component({
    selector: 'tasks',
    template: require('./templates/tasks.html'),
    // changeDetection: ChangeDetectionStrategy.OnPush,
    directives: [ROUTER_DIRECTIVES, PaginationComponent, TaskListComponent, TaskFilterComponent],
    pipes: [DateFormatPipe, TranslatePipe, TextTransformPipe]
})

export class TasksComponent {
    private storeSub: any;
    private paramsSub: any;
    title: string;
    tasks: Task[];
    params: any = {};
    meta: any = {};
    filter: any = {};
    requestProcess: boolean = true;

    constructor(
        private store: Store<any>,
        private router: Router,
        private route: ActivatedRoute,
        private taskActions: TaskActions,
        private taskService: TaskService,
        private notifyService: NotificationService
    ) { }

    ngOnInit() {
        this.storeSub = this.store.select('tasks').subscribe((state: ITasksState) => {
            if (state) {
                this.tasks = state.tasks;
                this.meta = state.meta;
                // this.filter = state.filter
                this.requestProcess = false;
            }
        });

        this.paramsSub = this.route.params.subscribe(params => {
            let taskFor = params['for'];
            let projectId = params['projectId'];
            switch (taskFor) {
                case 'inbox':
                    this.title = 'tasks_assigned_to_me';
                    break;
                case 'my':
                    this.title = 'my_tasks';
                    break;
                default:
                    this.title = 'tasks';
                    break;
            }
            //
            this.params = params;
            this.loadData(Object.assign({}, this.params, this.filter));
        });
    }

    ngOnDestroy() {
        this.storeSub.unsubscribe();
        this.paramsSub.unsubscribe();
    }

    loadData(params) {
        this.requestProcess = true;
        this.taskService.fetchTasks(params).subscribe(payload => {
            this.store.dispatch(this.taskActions.fetchTasksFulfilled(payload.tasks, payload.meta));
        });
    }

    goToPage(params) {
        this.loadData(Object.assign({}, params, this.filter));
    }

    changeFilter(filter) {
        this.filter = filter;
        this.loadData(filter);
    }

    newTask() {
        this.router.navigate(['/task', 'new']);
    }

    deleteTask(task: Task) {
        this.taskService.deleteTask([task]).subscribe();
    }
}
