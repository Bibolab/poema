package workflow.model;

/**
 * 
 * @author Kayra created 07-04-2016
 */

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.NamedQuery;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import com.exponentus.common.model.Attachment;
import com.exponentus.dataengine.jpa.SecureAppEntity;

import reference.model.DocumentLanguage;
import reference.model.DocumentType;
import staff.model.Organization;

@Entity
@Table(name = "outgoings")
@NamedQuery(name = "Outgoing.findAll", query = "SELECT m FROM Outgoing AS m ORDER BY m.regDate")
public class Outgoing extends SecureAppEntity<UUID> {

	@Column(name = "reg_number")
	private String regNumber;

	@Column(name = "applied_reg_date")
	private Date appliedRegDate;

	@OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
	@JoinTable(name = "outgoing_attachments", joinColumns = { @JoinColumn(name = "outgoing_id", referencedColumnName = "id") }, inverseJoinColumns = {
	        @JoinColumn(name = "attachment_id", referencedColumnName = "id") })
	private List<Attachment> attachments = new ArrayList<>();

	private Organization recipient;

	@Column(nullable = false)
	private String summary = "";

	private DocumentLanguage docLanguage;

	private DocumentType docType;

	@Override
	public List<Attachment> getAttachments() {
		return attachments;
	}

	public void setSummary(String summary) {
		this.summary = summary;
	}

	public String getRegNumber() {
		return regNumber;
	}

	public void setRegNumber(String regNumber) {
		this.regNumber = regNumber;
	}

	public Date getAppliedRegDate() {
		return appliedRegDate;
	}

	public void setAppliedRegDate(Date appliedRegDate) {
		this.appliedRegDate = appliedRegDate;
	}

	public Organization getRecipient() {
		return recipient;
	}

	public void setRecipient(Organization recipient) {
		this.recipient = recipient;
	}

	public String getSummary() {
		return summary;
	}

	@Override
	public void setAttachments(List<Attachment> attachments) {
		this.attachments = attachments;
	}

	public DocumentLanguage getDocLanguage() {
		return docLanguage;
	}

	public void setDocLanguage(DocumentLanguage docLanguage) {
		this.docLanguage = docLanguage;
	}

	public DocumentType getDocType() {
		return docType;
	}

	public void setDocType(DocumentType docType) {
		this.docType = docType;
	}
}
