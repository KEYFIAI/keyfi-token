# How to contribute to this project

## Development Process

All development should follow the [standard git-flow](http://nvie.com/posts/a-successful-git-branching-model/) process, modified to allow for code-reviews.

For reference on git-flow commands, check out this [cheat sheet](http://danielkummer.github.io/git-flow-cheatsheet/).

### Setup

1. if not done already, [install git flow](https://github.com/nvie/gitflow/wiki/Installation).
2. fork this repo into your personal GitHub account
3. clone your fork to your local development machine
4. set this repo as the `upstream` repo `git remote add upstream <insert the upstream url>`
5. disallow direct pushing to upstream `git remote set-url --push upstream no_push`
6. create a local `master` branch `git checkout -b master` and test it via `git pull upstream master`
7. run `git flow init -d`

#### Optional Git Setup

Set up `git` to always `rebase` rather than merge.

```sh
git config --global branch.autosetuprebase always
```

Make sure `git` knows you are using your correct email.

```sh
git config user.email "username@domain.suffix"
```

### Working on new features

1. Create a "feature branch" for the change you wish to make via `git flow feature start {feature_name}`. See below for how to name features.
2. Now work on your changes locally until you are happy the issue is resolved. See below for how to name commit messages.
3. `git flow feature publish {feature_name}` will push it back up to your fork on GitHub.
4. Use `git flow feature pull {remote_name} {feature_name}` to bring in any other changes, If other people have also merged changes in, and you can't merge your PR automatically you'll need to `rebase` their changes into your changes and then `--force` push the resulting changes using standard `git` commands.
5. Use GitHub to raise a Pull Request. Add labels as appropriate, and set one or more reviewers if necessary. Then share the PR link in the proper channels to request for reviews.
6. Respond to any comments as appropriate, making changes and `git push` ing further changes as appropriate.
7. When all comments are dealt and the PR finally gets a :+1: from the reviewers then merge the PR. _Note this scheme does not use the `git flow feature finish`_ option as that merges into develop automatically without the option for review. [see this stackexchange for more on that](http://programmers.stackexchange.com/questions/187723/code-review-with-git-flow-and-github). The corresponding feature branch can now be deleted on the forked repository (github provides an option to do so).
8. In your command-line `git checkout develop` then `git pull upstream develop` to get the latest code and `git branch -D feature/{branchname}` to delete the old feature branch.

#### Hotfixes and Support branches

It's basically the same process but use the word `hotfix` or `support` instead of `feature`.  `git flow` knows what to do. Just keep in mind that any changes are going to happen to your fork, and not the upstream repo. If you need to merge a `hotfix` into upstream master you may only do it va a reviewed pull request.

### Releasing to production

1. `git flow release start {tag.number}` (using semantic versioning)
2. commit any changes to version info in `package.json` then `git flow release publish {tag.number}`
3. `git flow release finish {tag.number}` merges the release into `master` of your fork, tags it, merges that back into `develop` on your fork and removes the release branch.
4. Now go back to GitHub and raise a Pull Request to merge the upstream master from your fork's `master` branch. When that goes through you are done.
5. In your command-line go back and clean up any outstanding branches and `git pull upstream` your local `master` and `develop` branches to ensure everything on your local machine is up to date with everyone's changes.

Note you should **never** push changes directly to the upstream project, *only to your own fork*.

**Changes may only be introduced into the upstream project via a properly reviewed pull request.**

## Naming things

There are various systems, including GitHub itself, which will pick up the issue numbers from commit messages and pull requests and automatically associate them with the issues. It is therefore desirable to use a formal naming scheme for features, commit messages and pull requests.

### Features

Features must be named per the following pattern `#{issue number}/{some_descriptive-text}` — so for example, if you are working on issue `ABC-1` with the title "do the thing", call your feature `ABC-1/do_the-thing`. Obviously use your common sense to avoid making the feature names too long.

Note this will creating a feature via `git flow` will create a branch called `feature/{issue number}/{some_descriptive-text}`.

### Commit Messages

When commiting something use the `-m` flag to add a short commit message of the format `{issue number} summary of what you changed`.  So for example if you are working on issue `ABC-1` and you added a method to the `aardvark_controller` you might use the following commit message `"ABC-1 added anteater method to aardvark controller"`

Commit messages ought to be in the past tense.

In general try to group file changes wherever appropriate, so if your controller change also involved updating something in a helper file, the one commit message can happily encompas the changes to both files. The message ought to reflect the main aim of the change.

### Pull Requests

Pull requests must be named as follows `[issue type, issue number] high level description of change`.  The following Issue Types are recognised

* `Bug Fix` - the change fixes a bug
* `Feature` - the change adds a new feature (the usual issue type)
* `Documentation` — The change is a documentation only change

Other categories might be defined according to each project specific needs.

Example:  

`[Feature, ABC-1] added important method to main contract.`

### Unit tests

All PRs including changes in code should address the related functionalities through proper unit testing. Ideally, code coverage should be kept at 100%.
