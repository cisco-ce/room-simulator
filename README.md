# UI Extensions Room Simulator

Web based simulator for testing and demoing UI extenions and external sources.

## Deployment

The simulator is currently hosted on Github pages (https://cisco-ce.github.io/room-simulator/). Github pages can't
build the project, so you need to build the binaries then push them:

- Commit your changes in main
- git checkout gh-pages
- git rebase master
- npm run build
- git commit .
- git push

Github pages should now be updated after a few minutes.

Then checkout master again

