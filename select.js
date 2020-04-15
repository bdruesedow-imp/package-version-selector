const core = require('@actions/core');
const github = require('@actions/github');
require('isomorphic-fetch');

try {

    const owner = core.getInput('owner');
    const repositoryName = core.getInput('repository').split("/").slice(-1);
    const packageName = core.getInput('package');
    const filterString = core.getInput('filter');
    const keep = core.getInput('keep');
    const token = core.getInput('github-token');

    function filterVersions(json) {

        try {
            // filter for package in repository
            let packages = json.data.repository.packages.edges.filter(element => {
                return element.node.name === packageName;
            });

            // filter for specific version names containing in package versions
            let versions = packages[0].node.versions.edges.filter(element => {
                return element.node.version.indexOf(filterString) > -1;
            });


            console.log("\nMatching versions for \"" + filterString + "\":");

            // collect ids from filtered versions
            let versionIds = versions.map(element => {
                console.log(element.node.version);
                return element.node.id;
            });


            // calculate number of versions that can be selected
            let sliceNumber = versionIds.length - keep;

            console.log("\nKeep latest " + keep + " versions...");
            console.log("Select the oldest " + sliceNumber + " versions...");

            if ( sliceNumber > 0 ) {
                // select the oldest versions
                let selectedIds = versionIds.slice(0, sliceNumber);
                // return the selected versions as comma separated string
                return selectedIds.join();
            }

            // return empty string if no versions are selected
            return "";

        } catch(e) {
            console.log(e);
            return process.exit(-1);
        }
    }

    fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.packages-preview+json',
                'authorization': `token ${token}`,
            },
            body: JSON.stringify({
                query: `{
                  repository(owner: "${owner}", name: "${repositoryName}") {
                    packages(first: 1, names: ["${packageName}"]) {
                      edges {
                        node {
                          name
                          versions(last: 100, orderBy: {field: CREATED_AT, direction: ASC}) {
                            edges {
                              node {
                                id
                                version
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }`
            }),
    })
    .then(res => res.json())
    .then(resJson => filterVersions(resJson))
    .then(versionIds => core.setOutput("versionids", versionIds));

} catch (error) {
    core.setFailed(error.message);
}
