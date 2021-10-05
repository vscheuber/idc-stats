(function () {
    var start = Date.now();
    logger.debug("Stats: start");

    var pageSize = 10;
    var endpoint = "repo/tenantstats/daily";

    var managedJson = openidm.read("config/managed", null, ["*"]);

    var tenantStats = {
        "stats": {
            "tenant": {
                "teammembers": countUsers("teammember"),
                "roles": countInternalRoles(),
                "other": countCustomObjects(managedJson, null)
            },
            "realms": { 
                "alpha": {
                    "users": countUsers("alpha_user"),
                    "roles": countRoles("alpha_role"),
                    "organizations": countOrganizations("alpha_organization"),
                    "assignments": countAssignments("alpha_assignment"),
                    "other": countCustomObjects(managedJson, "alpha")
                },
                "bravo": {
                    "users": countUsers("bravo_user"),
                    "roles": countRoles("bravo_role"),
                    "organizations": countOrganizations("bravo_organization"),
                    "assignments": countAssignments("bravo_assignment"),
                    "other": countCustomObjects(managedJson, "bravo")
                }
            }
        },
        "elapsed": (Date.now() - start),
        "date": getGeneralizedTime(new Date())
    };

    result = openidm.create(endpoint, null, tenantStats);
    logger.debug("Stats: {}", JSON.stringify(tenantStats));

    /*
     * Convert a Date object to the generalized time format used in LDAP directories
     * 
     * e.g.: 20201009093416Z
     */
    function getGeneralizedTime(date) {
        var generalizedTime = ("")
            .concat(date.getFullYear())
            .concat(pad(date.getMonth()+1,2))
            .concat(pad(date.getDate(),2))
            .concat(pad(date.getHours(),2))
            .concat(pad(date.getMinutes(),2))
            .concat(pad(date.getSeconds(),2))
            .concat("Z").toString();
        return generalizedTime;
    }

    /*
     * Pad a number with leading zeroes
     * 
     * e.g.: pad(21,5) = 00021
     */
    function pad(num, size) {
        var s = "0000000000" + num;
        return s.substr(s.length-size);
    }

    function countUsers(moType) {
        var start = Date.now();
        var stats = {
            "type": moType,
            "total": 0,
            "active": 0,
            "elapsed": 0,
            "date": 0
        };
        var result = {
            "result": [],
            "resultCount": 0,
            "pagedResultsCookie": null,
            "totalPagedResultsPolicy": "NONE",
            "totalPagedResults": -1,
            "remainingPagedResults": -1
        };
        var params = {
            "_queryFilter": "true",
            "_pageSize": pageSize
        };
        do {
            if (result && result.pagedResultsCookie) {
                params["_pagedResultsCookie"] = result.pagedResultsCookie;
            }
            result = openidm.query("managed/"+moType, params, ["accountStatus"]);
            stats.total += result.resultCount;
            stats.active += result.result.filter(value => (value.accountStatus === 'active' || value.accountStatus === 'Active')).length;
        }
        while (result.pagedResultsCookie);

        stats.date = getGeneralizedTime(new Date());
        stats.elapsed = (Date.now() - start);
        //logger.debug("Stats: countUsers: {}: stats: {}", moType, stats);
        return stats;
    }

    function countInternalRoles() {
        var start = Date.now();
        var stats = {
            "type": "internal/role",
            "total": 0,
            "elapsed": 0,
            "date": 0
        };
        var result = {
            "result": [],
            "resultCount": 0,
            "pagedResultsCookie": null,
            "totalPagedResultsPolicy": "NONE",
            "totalPagedResults": -1,
            "remainingPagedResults": -1
        };
        var params = {
            "_queryFilter": "true",
            "_pageSize": pageSize
        };
        do {
            if (result && result.pagedResultsCookie) {
                params["_pagedResultsCookie"] = result.pagedResultsCookie;
            }
            result = openidm.query("internal/role", params, ["_id"]);
            stats.total += result.resultCount;
        }
        while (result.pagedResultsCookie);

        stats.date = getGeneralizedTime(new Date());
        stats.elapsed = (Date.now() - start);
        //logger.debug("Stats: countInternalRoles: {}: stats: {}", moType, stats);
        return stats;
    }

    function countRoles(moType) {
        var start = Date.now();
        var stats = {
            "type": moType,
            "total": 0,
            "used": 0,
            "elapsed": 0,
            "date": 0
        };
        var result = {
            "result": [],
            "resultCount": 0,
            "pagedResultsCookie": null,
            "totalPagedResultsPolicy": "NONE",
            "totalPagedResults": -1,
            "remainingPagedResults": -1
        };
        var params = {
            "_queryFilter": "true",
            "_pageSize": pageSize
        };
        do {
            if (result && result.pagedResultsCookie) {
                params["_pagedResultsCookie"] = result.pagedResultsCookie;
            }
            result = openidm.query("managed/"+moType, params, ["members"]);
            stats.total += result.resultCount;
            stats.used += result.result.filter(value => value.members.length > 0).length;
        }
        while (result.pagedResultsCookie);

        stats.date = getGeneralizedTime(new Date());
        stats.elapsed = (Date.now() - start);
        //logger.debug("Stats: countRoles: {}: stats: {}", moType, stats);
        return stats;
    }

    function countOrganizations(moType) {
        var start = Date.now();
        var stats = {
            "type": moType,
            "total": 0,
            "elapsed": 0,
            "date": 0
        };
        var result = {
            "result": [],
            "resultCount": 0,
            "pagedResultsCookie": null,
            "totalPagedResultsPolicy": "NONE",
            "totalPagedResults": -1,
            "remainingPagedResults": -1
        };
        var params = {
            "_queryFilter": "true",
            "_pageSize": pageSize
        };
        do {
            if (result && result.pagedResultsCookie) {
                params["_pagedResultsCookie"] = result.pagedResultsCookie;
            }
            result = openidm.query("managed/"+moType, params, ["members"]);
            stats.total += result.resultCount;
        }
        while (result.pagedResultsCookie);

        stats.date = getGeneralizedTime(new Date());
        stats.elapsed = (Date.now() - start);
        //logger.debug("Stats: countOrganizations: {}: stats: {}", moType, stats);
        return stats;
    }

    function countAssignments(moType) {
        var start = Date.now();
        var stats = {
            "type": moType,
            "total": 0,
            "elapsed": 0,
            "date": 0
        };
        var result = {
            "result": [],
            "resultCount": 0,
            "pagedResultsCookie": null,
            "totalPagedResultsPolicy": "NONE",
            "totalPagedResults": -1,
            "remainingPagedResults": -1
        };
        var params = {
            "_queryFilter": "true",
            "_pageSize": pageSize
        };
        do {
            if (result && result.pagedResultsCookie) {
                params["_pagedResultsCookie"] = result.pagedResultsCookie;
            }
            result = openidm.query("managed/"+moType, params, ["members"]);
            stats.total += result.resultCount;
        }
        while (result.pagedResultsCookie);

        stats.date = getGeneralizedTime(new Date());
        stats.elapsed = (Date.now() - start);
        //logger.debug("Stats: countAssignments: {}: stats: {}", moType, stats);
        return stats;
    }

    function countCustomObjects(managedJson, realm) {
        var stats = [];
        managedJson.objects.forEach(mo => {
            logger.debug("Stats: countCustomObjects: {}: mo: {}", realm, mo.name);
            // filter out standard objects
            if (realm != null && mo.name.startsWith(realm+"_") && mo.name != realm+"_user" && mo.name != realm+"_role" && mo.name != realm+"_organization" && mo.name != realm+"_assignment") {
                stats.push(handleCustomObjects(mo.name));
            }
            else if (realm == null && mo.name != "teammember" && !mo.name.startsWith("alpha_") && !mo.name.startsWith("bravo_")) {
                stats.push(handleCustomObjects(mo.name));
            }
        });
        logger.debug("Stats: countCustomObjects: {}: stats: {}", realm, stats);
        return stats;
    }

    function handleCustomObjects(moName) {
        var start = Date.now();
        var stats = {
            "name": moName,
            "total": 0,
            "elapsed": 0,
            "date": 0
        };
        var result = {
            "result": [],
            "resultCount": 0,
            "pagedResultsCookie": null,
            "totalPagedResultsPolicy": "NONE",
            "totalPagedResults": -1,
            "remainingPagedResults": -1
        };
        var params = {
            "_queryFilter": "true",
            "_pageSize": pageSize
        };
        do {
            if (result && result.pagedResultsCookie) {
                params["_pagedResultsCookie"] = result.pagedResultsCookie;
            }
            result = openidm.query("managed/"+moName, params, ["members"]);
            stats.total += result.resultCount;
        }
        while (result.pagedResultsCookie);

        stats.date = getGeneralizedTime(new Date());
        stats.elapsed = (Date.now() - start);
        logger.debug("Stats: handleCustomObjects: {}: stats: {}", moName, stats);
        return stats;
    }

}());