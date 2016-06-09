package projects.model;

import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.NamedQuery;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.validation.constraints.NotNull;

import com.exponentus.common.model.Attachment;
import com.exponentus.dataengine.jpa.SecureAppEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import projects.model.constants.TaskPriorityType;
import projects.model.constants.TaskStatusType;
import reference.model.Tag;
import reference.model.TaskType;

@JsonPropertyOrder({ "kind", "id", "author", "regDate", "wasRead", "projectId", "parentTaskId", "childrenTaskIds" })
@JsonInclude(JsonInclude.Include.NON_NULL)
@Entity
@Table(name = "tasks")
@NamedQuery(name = "Task.findAll", query = "SELECT m FROM Task AS m ORDER BY m.regDate")
public class Task extends SecureAppEntity<UUID> {

	@NotNull
	@ManyToOne(optional = true)
	@JoinColumn(nullable = false)
	private Project project;

	@ManyToOne(optional = false, fetch = FetchType.LAZY)
	@JoinColumn
	private Task parent;

	@OneToMany(mappedBy = "parent")
	private List<Task> children;

	@NotNull
	@ManyToOne(optional = false)
	@JoinColumn(nullable = false)
	private TaskType taskType;

	@Enumerated(EnumType.STRING)
	@Column(nullable = true, length = 10)
	private TaskStatusType status = TaskStatusType.UNKNOWN;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private TaskPriorityType priority = TaskPriorityType.NORMAL;

	@Column(length = 2048)
	private String body;

	private Long assignee;

	@Temporal(TemporalType.TIMESTAMP)
	private Date startDate;

	@Temporal(TemporalType.TIMESTAMP)
	private Date dueDate;

	@ManyToMany(fetch = FetchType.EAGER)
	@JoinTable(name = "task_tags")
	private List<Tag> tags;

	@OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
	@JoinTable(joinColumns = { @JoinColumn(name = "parent_id", referencedColumnName = "id") }, inverseJoinColumns = {
	        @JoinColumn(name = "attachment_id", referencedColumnName = "id") })
	private List<Attachment> attachments;

	@Column(name = "customer_observation")
	private boolean customerObservation;

	@JsonIgnore
	public Project getProject() {
		return project;
	}

	public void setProject(Project project) {
		this.project = project;
	}

	@JsonIgnore
	public Task getParent() {
		return parent;
	}

	public void setParent(Task parent) {
		this.parent = parent;
	}

	@JsonIgnore
	public List<Task> getChildren() {
		return children;
	}

	public void setChildren(List<Task> children) {
		this.children = children;
	}

	@JsonIgnore
	public TaskType getTaskType() {
		return taskType;
	}

	public void setTaskType(TaskType taskType) {
		this.taskType = taskType;
	}

	public TaskStatusType getStatus() {
		return status;
	}

	public void setStatus(TaskStatusType status) {
		this.status = status;
	}

	public TaskPriorityType getPriority() {
		return priority;
	}

	public void setPriority(TaskPriorityType priority) {
		this.priority = priority;
	}

	public String getBody() {
		return body;
	}

	public void setBody(String body) {
		this.body = body;
	}

	@JsonProperty("assigneeUserId")
	public Long getAssignee() {
		return assignee;
	}

	public void setAssignee(Long assignee) {
		this.assignee = assignee;
	}

	public Date getStartDate() {
		return startDate;
	}

	public void setStartDate(Date startDate) {
		this.startDate = startDate;
	}

	public Date getDueDate() {
		return dueDate;
	}

	public void setDueDate(Date dueDate) {
		this.dueDate = dueDate;
	}

	@JsonIgnore
	public List<Tag> getTags() {
		return tags;
	}

	public void setTags(List<Tag> tags) {
		this.tags = tags;
	}

	public List<Attachment> getAttachments() {
		return attachments;
	}

	public void setAttachments(List<Attachment> attachments) {
		this.attachments = attachments;
	}

	public String getProjectId() {
		return project.getIdentifier();
	}

	public String getParentTaskId() {
		return parent != null ? parent.getIdentifier() : null;
	}

	public List<String> getChildrenTaskIds() {
		return children.stream().map(it -> it.getIdentifier()).collect(Collectors.toList());
	}

	public String getTaskTypeId() {
		return taskType.getIdentifier();
	}

	public List<String> getTagIds() {
		return tags.stream().map(it -> it.getIdentifier()).collect(Collectors.toList());
	}
}
