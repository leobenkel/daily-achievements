define([
    'jquery',
    'lodash',
],
    function ($, _) {
        let rootURL = 'https://api.github.com';

        return function (name, githubUsername, token) {
            let myself = this;
            myself.name = name;
            myself.authToken = token;
            myself.githubUsername = githubUsername;
            myself.organizationName = myself.githubUsername;
            myself.databaseStorageRepoName = `daily-achievements-${myself.name}`;

            myself.getData = function (table, id) {
                let my_atob = atob;
                return $.ajax({
                    url: `${rootURL}/repos/${myself.organizationName}/${myself.databaseStorageRepoName}`
                        + `/contents/db/${table}/${id}.json`,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader(
                            "Authorization",
                            "Basic " + btoa(`${myself.githubUsername}:${myself.authToken}`));
                        xhr.setRequestHeader(
                            'Accept', 'application/vnd.github.v3+json'
                        );
                    },
                    type: 'GET',
                })
                    .then(function (data) {
                        let content = my_atob(data.content);
                        let parsed = $.parseJSON(content);
                        return Promise.resolve({
                            data: parsed,
                            sha: data.sha
                        });
                    })
                    .catch(function (error) {
                        if (error.statusText === 'Not Found') {
                            return Promise.resolve({
                                data: null,
                                sha: null,
                            });
                        }

                        return Promise.reject(error);
                    });
            };

            myself.getTable = function (table) {
                let my_atob = atob;
                return $.ajax({
                    url: `${rootURL}/repos/${myself.organizationName}/${myself.databaseStorageRepoName}`
                        + `/contents/db/${table}`,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader(
                            "Authorization",
                            "Basic " + btoa(`${myself.githubUsername}:${myself.authToken}`));
                        xhr.setRequestHeader(
                            'Accept', 'application/vnd.github.v3+json'
                        );
                    },
                    type: 'GET',
                })
                    .then(function (data) {
                        console.log(data);
                        // let content = my_atob(data.content);
                        // let parsed = $.parseJSON(content);
                        // return Promise.resolve({
                        //     data: parsed,
                        //     sha: data.sha
                        // });
                        throw 'need implementation';
                    })
                    .catch(function (error) {
                        if (error.responseJSON.message == "This repository is empty.") {
                            return Promise.resolve({
                                data: []
                            });
                        }

                        return Promise.reject(error);
                    });
            }

            myself.setData = function (table, id, value) {
                let my_atob = atob;

                return myself.getData(table, id).then(function (data) {
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
                        url: `${rootURL}/repos/${myself.organizationName}/${myself.databaseStorageRepoName}`
                            + `/contents/db/${table}/${id}.json`,
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader(
                                "Authorization",
                                "Basic " + btoa(`${myself.githubUsername}:${myself.authToken}`));
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
                        });
                });
            };


            myself.createDatabase = function () {
                // https://stackoverflow.com/a/13315588/3357831
                // curl -i -H 'Authorization: token TOKENHERE' -d '{"name":":NAME"}' https://api.github.com/user/repos
                let data = {
                    name: `${myself.databaseStorageRepoName}`,
                    description: `Database of ${myself.name} for https://daily-achievements.netlify.app/`,
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
                return $.ajax({
                    url: `${rootURL}/user/repos`,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader(
                            "Authorization",
                            "Basic " + btoa(`${myself.githubUsername}:${myself.authToken}`));
                        xhr.setRequestHeader(
                            'Accept', 'application/vnd.github.v3+json'
                        );
                    },
                    dataType: 'json',
                    method: 'POST',
                    data: JSON.stringify(data),
                })
                    .then(function (data) {
                        return Promise.resolve({
                            success: true,
                            data: data
                        });
                    })
                    .catch(function (error) {
                        if (error.responseJSON.errors[0].message == "name already exists on this account") {
                            return Promise.resolve({
                                success: true
                            })
                        }

                        return Promise.reject(error);
                    });
            };

            return myself;
        };
    });