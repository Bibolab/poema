package projects.page;

import com.exponentus.exception.SecureException;
import com.exponentus.scripting._Session;
import com.exponentus.scripting._WebFormData;
import com.exponentus.scripting.event._DoPage;
import projects.dao.DashboardDAO;
import projects.dao.ProjectDAO;
import projects.model.Dashboard;
import projects.model.Project;

import java.util.UUID;

public class DashboardPage extends _DoPage {

    @Override
    public void doGET(_Session session, _WebFormData formData) {
        DashboardDAO dashboardDAO = new DashboardDAO(session);
        Dashboard dashboard = dashboardDAO.findUserDashboard(session.getUser());
        if (dashboard == null) {
            addValue("dashboard", "not_found");
            return;
        }

        String projectId = formData.getValueSilently("projectId");
        if (projectId.isEmpty()) {
            addContent(dashboard.getProjects()); // user dashboard projects
            return;
        }

        // project data
        ProjectDAO projectDAO = new ProjectDAO(session);
        Project project = projectDAO.findById(projectId);

    }

    @Override
    public void doPOST(_Session session, _WebFormData formData) {
        String projectId = formData.getValueSilently("projectId");
        if (projectId.isEmpty()) {
            setBadRequest();
            return;
        }

        try {
            DashboardDAO dashboardDAO = new DashboardDAO(session);
            Dashboard dashboard = dashboardDAO.findUserDashboard(session.getUser());
            if (dashboard == null) {
                dashboard = dashboardDAO.add(new Dashboard());
            }

            ProjectDAO projectDAO = new ProjectDAO(session);
            Project project = projectDAO.findById(projectId);
            dashboard.getProjects().add(project);
            dashboardDAO.update(dashboard);
        } catch (SecureException e) {
            setBadRequest();
            logError(e);
        }
    }

    @Override
    public void doDELETE(_Session session, _WebFormData formData) {
        String projectId = formData.getValueSilently("projectId");
        if (projectId.isEmpty()) {
            setBadRequest();
            return;
        }

        DashboardDAO dashboardDAO = new DashboardDAO(session);
        Dashboard dashboard = dashboardDAO.findUserDashboard(session.getUser());
        if (dashboard == null) {
            setBadRequest();
            return;
        }

        try {
            Project project = new Project();
            project.setId(UUID.fromString(projectId));
            dashboard.getProjects().remove(project);
            dashboardDAO.update(dashboard);
        } catch (SecureException e) {
            setBadRequest();
            logError(e);
        }
    }
}
