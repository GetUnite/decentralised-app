# Alluo webapp

### Welcome to Alluo

👍🎉 First and foremost, thank you for taking the time to contribute 🎉👍

The following is a set of guidelines for contributing to the Alluo ecosystem, which is hosted in our GitHub organization. 

These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

Alluo Webapp lets users buy, lock and see info about the $ALLUO tokens.

#### Table Of Contents

1. [Code of Conduct](#code-of-conduct)
2. [What should I know before I get started?](#what-should-i-know-before-i-get-started)
2.1 [Alluo and Packages](#alluo-and-packages)
2.2 [Alluo Design Decisions](#design-decisions)
3. [How Can I Contribute?](#how-can-i-contribute)
  3.1 [Reporting Bugs](#reporting-bugs)
  3.2 [Suggesting Enhancements](#suggesting-enhancements)
  3.3 [Your First Code Contribution](#your-first-code-contribution)
  3.4 [Pull Requests](#pull-requests)
4. [Styleguides](#styleguides)
  4.1 [TypeScript Styleguide](#typescript-styleguide)
  4.2 [Documentation Styleguide](#documentation-styleguide)
5. [Important Resources](#important-resources)
  5.1 [Links and Docs](#links-and-docs)

## Code of Conduct

In the interest of fostering an open and welcoming environment, we as contributors and maintainers pledge to making participation in our project and our community a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

The core team of Alluo reserves the right and responsibility to remove, edit, or reject comments, commits, code, wiki edits, issues, and other contributions that are not aligned to this Code of Conduct, or to ban temporarily or permanently any contributor for other behaviors that they deem inappropriate, threatening, offensive, or harmful.

## What should I know before I get started?

### Alluo and Packages

Alluo uses `Ternary Design System` as a folder structure guideline. [Folder organization guide.](https://nagibaba.medium.com/ultimate-ternary-folder-structure-for-large-react-applications-9bb6882d4372) This keeps the entry point of the application neat and small try to maintain our folder structure when contributing to ensure everything stays organized.

### Main technologies.

 - **Typescript:**  All files are written in typescript to ensure type safety.
 - **Yarn:**  To avoid bugs please remember to always use yarn, using NPM will cause build errors.
 - **Grommet UI:**  UI features should be built with Grommet. more here: [Grommet UI library](https://v2.grommet.io/components)
 - **Styled-components:**  Complex UI features that cannot be done with Grommet should be styled with this library: [Read the docs](https://styled-components.com/)
 - **Recoil:**  For state management, similar to Redux: [Read the docs](https://austinvollman.medium.com/recoil-js-761c582cb94e)
 - **Recoil persist:**  Same as above
 - **Web3 JS:**  This is how we interact with the blockchain APIs: [Read the docs](https://docs.web3js.org/api)
 - **React Router DOM V6:**   This handle our routing in the application:  [Read the docs](https://blog.logrocket.com/react-router-v6/)

### Design Decisions

We have a standard for our application design, the color scheme and general formating will be stored within the theme.ts file in [themes.ts](https://github.com/GetAlluo/webapp/blob/master/src/app/modernUI/theme.ts). Please ensure new additions to the UI use the colors and styles declared in this folder.  We have a dark and light mode, the state for that will be in the atoms.ts folder linked below.

## How Can I Contribute?

### Reporting Bugs

This section guides you through submitting a bug report for Alluo. Following these guidelines helps maintainers and the community understand your report :pencil:, reproduce the behavior :computer: :computer:, and find related reports :mag_right:.

Before creating bug reports, please include as many details as possible and check to see if someone else has already reported the bug. Fill out [the required template]([https://github.com/atom/.github/blob/master/.github/ISSUE_TEMPLATE/bug_report.md](https://github.com/GetAlluo/webapp/blob/master/.github/ISSUE_TEMPLATE/bug_report.md)), the information it asks for helps us resolve issues faster.

> **Note:** If you find a **Closed** issue that seems like it is the same thing that you're experiencing, open a new issue and include a link to the original issue in the body of your new one.

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion for Alluo, including completely new features and minor improvements to existing functionality. Following these guidelines helps maintainers and the community understand your suggestion :pencil: and find related suggestions :mag_right:.

Before creating enhancement suggestions, please check our [dework and roadmap](https://app.dework.xyz/alluo/) as you might find out that you don't need to create one. When you are creating an enhancement suggestion, please be descriptive and fill in [the template](https://github.com/GetAlluo/webapp/blob/master/.github/ISSUE_TEMPLATE/feature_request.md), including the steps that you imagine you would take if the feature you're requesting existed.

> **Note:** It takes time to get through the feature request backlog, you can stay updated in our [discord community](https://discord.gg/sbn3et6rk3)

### Your First Code Contribution

Please notify the team that you will be contributing and what you will be doing to avoid development conflicts.

#### Local development

Alluo Core and all packages can be developed locally. For instructions on how to do this, see the following sections in the [Get started with Alluo locally](https://github.com/GetAlluo/webapp#readme) If you have any trouble drop in the [Discord server](https://discord.gg/sbn3et6rk3) and let the core team know what errors you get so we can help you resolve it quickly.

### Pull Requests

The process described here has several goals:

- Maintain Alluo's quality
- Fix problems that are important to users
- Engage the community in working toward the best possible Alluo
- Enable a sustainable system for Alluo's maintainers to review contributions

Please follow these steps to have your contribution considered by the maintainers:

1. Create a branch with a title relevant to your contribution for example **'feature/dark-mode'** this will help avoid regressions. If your code is related to a Dework task please make sure to follow the Dework branch naming convention {username}/{dework taks number}/{dework task title}
2. Follow the [styleguides](#styleguides)
3. After you submit your pull request, verify that all checks are passing <details><summary>What if the status checks are failing?</summary>If a status check is failing, and you believe that the failure is unrelated to your change, please leave a comment on the pull request explaining why you believe the failure is unrelated. A maintainer will re-run the status check for you. If we conclude that the failure was a false positive, then we will open an issue to track that problem with our status check suite.</details>
4. Allow the core team time to test and review changes.

While the prerequisites above must be satisfied prior to having your pull request reviewed, the reviewer(s) may ask you to complete additional design work, tests, or other changes before your pull request can be ultimately accepted.

## Styleguides

### TypeScript Styleguide

* Prefer the object spread operator (`{...anotherObj}`) to `Object.assign()`
* Inline `export`s with expressions whenever possible
  ```js
  // Use this:
  export default class ClassName {

  }

  // Instead of:
  class ClassName {

  }
  export default ClassName
  ```
* We prefer single tab (2 spaces) for indentation.
* If possible avoid using inline styles, use Grommet UI whenever possible and styled components for more complex UI changes.
* Keep it DRY, avoid repetitive code, and if a function is complex leave comments to help the next contributor.
* All state should be managed in [Atom.ts](https://github.com/GetAlluo/webapp/blob/master/src/app/common/state/atoms.ts)
* All Web3 logic should be managed in [web3Client.ts](https://github.com/GetAlluo/webapp/blob/master/src/app/common/functions/web3Client.ts)
* All Hooks should be managed be in the [Hooks folder](https://github.com/GetAlluo/webapp/tree/master/src/app/common/hooks) or in the [State Shortcuts folder](https://github.com/GetAlluo/webapp/tree/master/src/app/common/state/shortcuts)

### Documentation Styleguide

* Use [Markdown](https://daringfireball.net/projects/markdown).
* Write comments and documentation in clear, concise English.
* Link references if needed.

### Important Resources

Alluo has a Github organization for version control, a Dework for listing bounties, a Medium account for documentation, and a discord for our community. Please consider joining us on any of these platforms to connect with our community.

#### Links and Docs

- [Alluo Landing Page](https://www.alluo.finance/)
- [Alluo Mobile App](https://www.alluo.com/)
- [Alluo Webapp](https://app.alluo.finance/)
- [Documentation and Blog](https://medium.com/@xec)
- [Discord Community](https://discord.gg/sbn3et6rk3)
- [Alluo Twitter](https://twitter.com/alluoapp)
- [Community Voting](https://snapshot.org/#/alluo.eth)
- [Bounties Program on Dework](https://app.dework.xyz/alluo)

### Thank you

We hope to build the future of the Web together.
