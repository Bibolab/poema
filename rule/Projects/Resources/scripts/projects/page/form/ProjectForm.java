package projects.page.form;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.eclipse.persistence.exceptions.DatabaseException;

import com.exponentus.common.model.Attachment;
import com.exponentus.env.EnvConst;
import com.exponentus.env.Environment;
import com.exponentus.exception.SecureException;
import com.exponentus.localization.LanguageCode;
import com.exponentus.scripting._Exception;
import com.exponentus.scripting._POJOListWrapper;
import com.exponentus.scripting._Session;
import com.exponentus.scripting._Validation;
import com.exponentus.scripting._WebFormData;
import com.exponentus.scripting.event._DoPage;
import com.exponentus.server.Server;
import com.exponentus.user.IUser;
import com.exponentus.util.Util;
import com.exponentus.webserver.servlet.UploadedFile;

import administrator.dao.UserDAO;
import projects.dao.ProjectDAO;
import projects.model.Project;
import projects.model.constants.ProjectStatusType;
import staff.dao.OrganizationDAO;

public class ProjectForm extends _DoPage {

	@Override
	public void doGET(_Session session, _WebFormData formData) {

		IUser<Long> user = session.getUser();
		Project entity;
		String id = formData.getValueSilently("docid");
		if (!id.isEmpty()) {
			ProjectDAO dao = new ProjectDAO(session);
			entity = dao.findById(UUID.fromString(id));
			addValue("formsesid", Util.generateRandomAsText());

			String attachmentId = formData.getValueSilently("attachment");
			if (!attachmentId.isEmpty() && entity.getAttachments() != null) {
				Attachment att = entity.getAttachments().stream().filter(it -> it.getIdentifier().equals(attachmentId)).findFirst().get();

				try {
					String filePath = getTmpDirPath() + File.separator + Util.generateRandomAsText("qwertyuiopasdfghjklzxcvbnm", 10)
					        + att.getRealFileName();
					File attFile = new File(filePath);
					FileUtils.writeByteArrayToFile(attFile, att.getFile());
					showFile(filePath, att.getRealFileName());
					Environment.fileToDelete.add(filePath);
				} catch (IOException ioe) {
					Server.logger.errorLogEntry(ioe);
				}
				return;
			}
		} else {
			entity = new Project();
			entity.setAuthor(user);
			entity.setRegDate(new Date());
			String fsId = formData.getValueSilently(EnvConst.FSID_FIELD_NAME);
			addValue("formsesid", fsId);
			List<String> formFiles = null;
			Object obj = session.getAttribute(fsId);
			if (obj == null) {
				formFiles = new ArrayList<String>();
			} else {
				formFiles = (List<String>) obj;
			}

			List<UploadedFile> filesToPublish = new ArrayList<UploadedFile>();

			for (String fn : formFiles) {
				UploadedFile uf = (UploadedFile) session.getAttribute(fsId + "_file" + fn);
				if (uf == null) {
					uf = new UploadedFile();
					uf.setName(fn);
					session.setAttribute(fsId + "_file" + fn, uf);
				}
				filesToPublish.add(uf);
			}
			addContent(new _POJOListWrapper(filesToPublish, session));
		}

		addContent(entity);
		// Embedding related resources
		addContent(entity.getCustomer());
		// TODO add other related resources by embed parameters ?
		// addContent(entity.getManager());

		startSaveFormTransact(entity);
	}

	@Override
	public void doPOST(_Session session, _WebFormData formData) {
		devPrint(formData);
		try {
			_Validation ve = validate(formData, session.getLang());
			if (ve.hasError()) {
				setBadRequest();
				setValidation(ve);
				return;
			}

			UserDAO userDAO = new UserDAO(session);
			OrganizationDAO organizationDAO = new OrganizationDAO(session);
			ProjectDAO dao = new ProjectDAO(session);
			Project entity;
			String id = formData.getValueSilently("docid");
			boolean isNew = id.isEmpty();

			if (isNew) {
				entity = new Project();
			} else {
				entity = dao.findById(id);
			}

			entity.setName(formData.getValue("name"));
			entity.setCustomer(organizationDAO.findById(formData.getValue("customerUserId")));
			entity.setManager(userDAO.findById(formData.getNumberValueSilently("managerUserId", 0)).getId());
			entity.setProgrammer(userDAO.findById(formData.getNumberValueSilently("programmerUserId", 0)).getId());
			entity.setTester(userDAO.findById(formData.getNumberValueSilently("testerUserId", 0)).getId());
			entity.setObservers(
			        Arrays.stream(formData.getListOfNumberValues("observerUserIds", 0)).map(Integer::longValue).collect(Collectors.toList()));
			entity.setComment(formData.getValue("comment"));
			entity.setStatus(ProjectStatusType.valueOf(formData.getValueSilently("status")));
			entity.setFinishDate(Util.convertStringToDate(formData.getValueSilently("finishDate")));

			String[] fileNames = formData.getListOfValuesSilently("fileid");
			if (fileNames.length > 0) {
				File userTmpDir = new File(Environment.tmpDir + File.separator + session.getUser().getUserID());
				for (String fn : fileNames) {
					File file = new File(userTmpDir + File.separator + fn);
					InputStream is = new FileInputStream(file);
					Attachment att = new Attachment();
					att.setRealFileName(fn);
					att.setFile(IOUtils.toByteArray(is));
					att.setAuthor(session.getUser());
					att.setForm("attachment");
					entity.getAttachments().add(att);
				}
			}

			if (isNew) {
				IUser<Long> user = session.getUser();
				entity.addReaderEditor(user);
				entity = dao.add(entity);
			} else {
				entity = dao.update(entity);
			}

			finishSaveFormTransact(entity);
		} catch (SecureException e) {
			setError(e);
		} catch (_Exception | DatabaseException | IOException e) {
			error(e);
			setBadRequest();
		}
	}

	private _Validation validate(_WebFormData formData, LanguageCode lang) {
		_Validation ve = new _Validation();

		if (formData.getValueSilently("name").isEmpty()) {
			ve.addError("name", "required", getLocalizedWord("field_is_empty", lang));
		}
		if (formData.getValueSilently("customerUserId").isEmpty()) {
			ve.addError("customerUserId", "required", getLocalizedWord("field_is_empty", lang));
		}
		if (formData.getNumberValueSilently("managerUserId", 0) == 0) {
			ve.addError("managerUserId", "required", getLocalizedWord("field_is_empty", lang));
		}
		if (formData.getNumberValueSilently("programmerUserId", 0) == 0) {
			ve.addError("programmerUserId", "required", getLocalizedWord("field_is_empty", lang));
		}
		if (formData.getNumberValueSilently("testerUserId", 0) == 0) {
			ve.addError("testerUserId", "required", getLocalizedWord("field_is_empty", lang));
		}
		if (formData.getListOfNumberValues("observerUserIds", 0)[0] == 0) {
			ve.addError("observerUserIds", "required", getLocalizedWord("field_is_empty", lang));
		}
		if (formData.getValueSilently("status").isEmpty()) {
			ve.addError("status", "required", getLocalizedWord("field_is_empty", lang));
		}
		if (formData.getValueSilently("finishDate").isEmpty()) {
			ve.addError("finishDate", "required", getLocalizedWord("field_is_empty", lang));
		}

		return ve;
	}

	@Override
	public void doDELETE(_Session session, _WebFormData formData) {
		String id = formData.getValueSilently("docid");
		String attachmentId = formData.getValueSilently("attachment");
		String attachmentName = formData.getValueSilently("att-name");

		if (id.isEmpty() || attachmentId.isEmpty() || attachmentName.isEmpty()) {
			return;
		}

		ProjectDAO dao = new ProjectDAO(session);
		Project entity = dao.findById(id);

		List<Attachment> atts = entity.getAttachments();
		List<Attachment> forRemove = atts.stream()
		        .filter(it -> attachmentId.equals(it.getIdentifier()) && it.getRealFileName().equals(attachmentName)).collect(Collectors.toList());
		atts.removeAll(forRemove);

		try {
			dao.update(entity);
		} catch (SecureException e) {
			setError(e);
		}
	}
}
