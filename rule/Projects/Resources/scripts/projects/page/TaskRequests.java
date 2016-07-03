package projects.page;

import com.exponentus.common.model.Attachment;
import com.exponentus.env.Environment;
import com.exponentus.exception.SecureException;
import com.exponentus.scripting._Session;
import com.exponentus.scripting._WebFormData;
import com.exponentus.scripting.event._DoPage;
import org.apache.commons.io.IOUtils;
import org.eclipse.persistence.exceptions.DatabaseException;
import projects.dao.RequestDAO;
import projects.dao.TaskDAO;
import projects.model.Request;
import projects.model.Task;
import reference.model.RequestType;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;

public class TaskRequests extends _DoPage {

    @Override
    public void doGET(_Session session, _WebFormData formData) {
        setBadRequest();
    }

    @Override
    public void doPOST(_Session session, _WebFormData formData) {
        String taskId = formData.getValueSilently("taskId");
        String requestTypeId = formData.getValueSilently("requestTypeId");

        if (taskId.isEmpty() || requestTypeId.isEmpty()) {
            setBadRequest();
            return;
        }

        addRequest(session, taskId, requestTypeId, formData.getValueSilently("comment"));
    }

    @Override
    public void doPUT(_Session session, _WebFormData formData) {
        // resolution
    }

    @Override
    public void doDELETE(_Session session, _WebFormData formData) {
        setBadRequest();
    }

    private void addRequest(_Session session, String taskId, String requestTypeId, String comment) {
        try {
            RequestDAO requestDAO = new RequestDAO(session);
            TaskDAO taskDAO = new TaskDAO(session);
            Task task = taskDAO.findById(taskId);
            if (task == null) {
                setBadRequest();
                return;
            }

            RequestType requestType = new RequestType();
            requestType.setId(UUID.fromString(requestTypeId));

            Request request = new Request();
            request.setTask(task);
            request.setRequestType(requestType);
            request.setComment(comment);

            String[] fileNames = formData.getListOfValuesSilently("fileid");
            if (fileNames.length > 0) {
                File userTmpDir = new File(Environment.tmpDir + File.separator + session.getUser().getUserID());
                for (String fn : fileNames) {
                    File file = new File(userTmpDir + File.separator + fn);
                    InputStream is = new FileInputStream(file);
                    Attachment att = new Attachment();
                    att.setRealFileName(fn);
                    att.setFile(IOUtils.toByteArray(is));
                    request.getAttachments().add(att);
                }
            }

            requestDAO.add(request);

        } catch (DatabaseException | IOException e) {
            error(e);
            setBadRequest();
        } catch (SecureException e) {
            error(e);
            setBadRequest();
        }
    }
}