package projects.dao;

import com.exponentus.dataengine.jpa.DAO;
import com.exponentus.scripting._Session;
import projects.model.Request;

import java.util.UUID;

public class RequestDAO extends DAO<Request, UUID> {

    public RequestDAO(_Session session) {
        super(Request.class, session);
    }
}
