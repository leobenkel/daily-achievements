define([
    'github',
    'jquery',
    'lodash',
],
    function (GitHub, $, _) {
        let rootURL = 'https://api.github.com';

        return function (name, githubUsername, token) {
            let authToken = token;
            let organizationName = githubUsername;
            let databaseStorageRepoName = `daily-achievements-${name}`;

            let authPayload = {
                username: githubUsername,
                token: authToken
            };
            // http://github-tools.github.io/github/docs/3.2.3/index.html
            let githubClient = new GitHub(authPayload);

            // http://github-tools.github.io/github/docs/3.2.3/GitHub.html#getOrganization
            let githubUserHandler = githubClient.getUser();

            let getDB = function () {
                // http://github-tools.github.io/github/docs/3.2.3/GitHub.html#getRepo
                return githubClient.getRepo(githubUsername, databaseStorageRepoName);
            }

            let manageErrors = function (error, defaultValue) {
                let repoIsCreatedButEmpty = function () {
                    return error.response.statusText == "Not Found" && error.response.data.message == "This repository is empty."
                }

                let failedToCreateRepo = function () {
                    return error.response.data.message == "Repository creation failed." && error.response.data.errors[0].message == "name already exists on this account";
                }

                let rowNotFound = function () {
                    return error.response.statusText == "Not Found" && error.response.data.message == "Not Found";
                }

                if (failedToCreateRepo() || repoIsCreatedButEmpty() || rowNotFound()) {
                    return Promise.resolve(defaultValue);
                }
                console.error(`Failed to handled:`, error);
                return Promise.reject(error);
            }

            let getData = function (table, id) {
                let my_atob = atob;
                return getDB().getContents(null, `db/${table}/${id}.json`, false)
                    .then(function (response) {
                        let data = response.data;
                        let content = my_atob(data.content);
                        let parsed = $.parseJSON(content);
                        return Promise.resolve({
                            data: parsed,
                            sha: data.sha
                        });
                    })
                    .catch(function (error) {
                        return manageErrors(error, {
                            data: null,
                            sha: null,
                        });
                    });
            };

            let getTable = function (table) {
                return getDB().getContents(null, `db/${table}`, false)
                    .then(function (response) {
                        let validData = response.data.map(function (e) {
                            return {
                                name: e.name.replaceAll('.json', ''),
                                fileName: e.name,
                                path: e.path,
                                sha: e.sha,
                                url: e.url,
                            };
                        });
                        return Promise.resolve({ data: validData });
                    })
                    .catch(function (error) {
                        return manageErrors(error, {
                            data: []
                        });
                    });
            }

            let setData = function (table, id, value) {
                let path = `db/${table}/${id}.json`;
                return getDB().getSha(null, path)
                    .then(function (response) {
                        let my_atob = atob;
                        let output = response.data;
                        output['data'] = $.parseJSON(my_atob(output.content));
                        return output;
                    })
                    .catch(function (error) {
                        return manageErrors(error, {
                            data: null,
                            sha: null,
                        });
                    })
                    .then(function (data) {
                        if (_.isEqual(value, data.data)) {
                            return Promise.resolve({
                                data: value,
                                sha: data.sha,
                            });
                        }

                        let content = btoa(JSON.stringify(value));
                        let dataToInsert = JSON.stringify({
                            message: `Insert data in '${table}' for ID: '${id}'`,
                            content: content,
                            sha: data.sha
                        });
                        let headers = {};
                        return $.ajax({
                            url: `${rootURL}/repos/${organizationName}/${databaseStorageRepoName}`
                                + `/contents/${path}`,
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader(
                                    "Authorization",
                                    "Basic " + btoa(`${githubUsername}:${authToken}`));
                                xhr.setRequestHeader(
                                    'Accept', 'application/vnd.github.v3+json'
                                );
                            },
                            dataType: 'json',
                            method: 'PUT',
                            headers: headers,
                            data: dataToInsert,
                        })
                            .then(function (data) {
                                return Promise.resolve({
                                    data: value,
                                    sha: data.content.sha
                                });
                            })
                            .catch(function (error) {
                                return manageErrors(error, {
                                    data: null,
                                    sha: null,
                                });
                            });
                    });
                // return getDB().writeFile(null, `db/${table}/${id}.json`, value, `Insert data in '${table}' for ID: '${id}'`, {
                //     encode: true,
                //     author: null,
                //     committer: null
                // })
                //     .then(function (data) {
                //         return Promise.resolve({
                //             data: value,
                //             sha: data.content.sha
                //         });
                //     });
            };

            let createDatabase = function () {
                // https://stackoverflow.com/a/13315588/3357831
                // curl -i -H 'Authorization: token TOKENHERE' -d '{"name":":NAME"}' https://api.github.com/user/repos
                let data = {
                    name: `${databaseStorageRepoName}`,
                    description: `Database of ${name} for https://daily-achievements.netlify.app/`,
                    visibility: "private",
                    private: true,
                    homepage: 'https://daily-achievements.netlify.app/',
                    has_issues: false,
                    has_projects: false,
                    has_wiki: false,
                    is_template: false,
                    auto_init: false,
                    delete_branch_on_merge: true
                };

                // http://github-tools.github.io/github/docs/3.2.3/Organization.html#createRepo
                return githubUserHandler.createRepo(data)
                    .then(function (data) {
                        return Promise.resolve({
                            success: true,
                            data: data
                        });
                    })
                    .catch(function (error) {
                        return manageErrors(error, {
                            success: true,
                            data: null
                        });
                    });
            };

            let getDatabaseLink = function () {
                return `https://github.com/${organizationName}/${databaseStorageRepoName}`;
            };

            return {
                createDatabase: createDatabase,
                getDatabaseLink: getDatabaseLink,
                getTable: getTable,
                getData: getData,
                setData: setData,
            };
        };
    });