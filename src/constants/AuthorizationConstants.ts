export class AuthorizationConstants {
    public static AuthzConfig = {
        excluded_paths: [],
        resource_urls: {
            "/todo-svc/v1/task": {
                "get": {
                    resources: ["todo"],
                    action_required: "Read",
                },
                "put": {
                    resources: ["todo"],
                    action_required: "Create"
                },
                "patch": {
                    resources: ["todo"],
                    action_required: "Update"
                },
                "delete": {
                    resources: ["todo"],
                    action_required: "Delete"
                },
            }
        },
        accepted_actions: ["Create", "Read", "Update", "Delete"]
    };

    public static Actions = {
        "read": "Read",
        "add": "Create",
        "edit": "Update",
        "delete": "Delete",
    };
}