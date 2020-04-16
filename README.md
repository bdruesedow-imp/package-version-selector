# package-version-selector

This is a github action to select versions of a specific github package. The version can be filtered.
The action is implemented to provide a comma seperated string of version ids for the github action [actions/delete-package-versions](https://github.com/actions/delete-package-versions).


## Usage:


Example: Select all package versions containing the string "SNAPSHOT", but keep the latest 5 versions. 
```
- name: "Select versions to delete."
  uses: virtualidentityag/package-version-selector@master
  id: version-selector
  with:
    owner: ${{ github.actor }}
    repository: ${{ github.repository }}
    github-token: ${{ secrets.github_token }}
    package: "package-name"
    filter: "SNAPSHOT"
    keep: 5

- uses: actions/delete-package-versions@v1
  with:
    package-version-ids: ${{ steps.version-selector.outputs.versionids }}
    token: ${{ secrets.github_token }}

```
