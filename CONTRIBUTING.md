# Contributing / Repository Governance

We've set up the team repository with the following rules, in line with
the Master Project Brief:

- One shared repo: <https://github.com/Drie-slimmies/CivicConnect>

- Nobody can push directly to the main branch, and every change must go
  through a pull request.

- A pull request needs approval from another member and cannot be
  approved by the person who made the pull request.

- A pull request needs 2 independent approving reviews before it can be
  merged (the author cannot approve their own PR), enforced by an active
  GitHub ruleset on main.

- The ruleset also requires approval of the most recent reviewable push,
  and requires all conversations to be resolved before merging.

- Force pushes to main are blocked and main cannot be deleted.

- No bypass permissions are granted on the ruleset, so these rules apply
  to every member including admins.

- The team repository moved from a personal account to the Drie-slimmies
  GitHub organisation so all three members have equal admin rights.

- A GitHub Projects board (Todo / In Progress / In Review / Done) tracks
  issues, with automated workflows moving an item to In Review when a PR
  is linked and to Done when the PR merges.

- A CI workflow (lint, typecheck, test, build, npm audit) runs on every
  pull request and push to main. A mature CI/CD pipeline is not required
  at M2, but this gives repeatable automated checks as evidence.

- If new commits are added to an open pull request, old approvals are
  cleared and it needs to be reviewed again.

- No passwords, keys or credentials are committed. We use a .env.example
  file instead of a real one.

- Every pull request follows a short template asking what changed, why,
  and how it was tested.

