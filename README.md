# Hugo Website with Hextra Theme

This repository hosts a Hugo website using the Hextra theme.

## Features

### Automated External Documentation Fetching

This site is configured with a GitHub Actions workflow to automatically fetch documentation from other repositories and integrate it into the `content/docs/` section of this website. This allows for a centralized documentation portal built from distributed sources.

**Workflow File:** `.github/workflows/fetch-docs.yml`

#### How it Works

The workflow performs the following steps:

1.  **Triggers**:
    *   Runs on a daily schedule (`cron: '0 0 * * *'`).
    *   Runs on pushes to the `main` branch of this repository.
    *   Can be manually triggered via the GitHub Actions UI (`workflow_dispatch`).

2.  **Checkout**:
    *   Checks out this website repository into a `website/` subdirectory in the GitHub Actions runner.

3.  **Configuration**:
    *   Reads a list of external documentation sources from the `.github/external-docs-config.json` file.

4.  **Processing Each Source**:
    *   For each entry in the configuration file:
        *   Cleans any previous version of that source's documentation from `website/content/docs/`.
        *   Uses `git clone --sparse` to efficiently check out only the specified documentation folder from the remote repository. This is done into a temporary directory.
        *   Copies the fetched documentation files into the appropriate subfolder under `website/content/docs/` using `rsync --delete` (which ensures stale files are removed).
        *   If an `_index.md` (or `index.md`) is not present in the root of the fetched documentation for a source, a basic one is generated to ensure Hugo recognizes it as a section. This generated `_index.md` will have `type: "docs"` in its front matter, which is suitable for the Hextra theme.

5.  **Commit and Push**:
    *   If any changes are detected within `website/content/docs/`, the workflow commits these changes using a dedicated Git user ("GitHub Actions Doc Fetcher").
    *   The changes are then pushed back to the `main` branch of this repository.

6.  **Cleanup**:
    *   Removes the temporary directory used for checking out external repositories.

#### Configuration Steps

To add or modify the external documentation sources, follow these steps:

1.  **Personal Access Token (PAT)**:
    *   Ensure a GitHub Personal Access Token (PAT) is available and configured as a secret in this repository.
    *   Go to your repository's `Settings > Secrets and variables > Actions`.
    *   Create a new repository secret named `GH_PAT_FOR_DOCS_FETCH`.
    *   The PAT must have the `repo` scope. This is necessary for:
        *   Cloning other repositories (especially if they are private).
        *   Pushing the aggregated documentation back to this (the website) repository.
    *   It's recommended to use a PAT from a dedicated machine user or a user whose contributions you want associated with these automated updates.

2.  **Edit Configuration File**:
    *   Open the `.github/external-docs-config.json` file in this repository.
    *   This file is a JSON array of objects, where each object defines one external documentation source.
    *   To add a new source, add a new JSON object to the array:
        ```json
        {
          "name": "My Awesome Project Docs",
          "repo": "your-github-username-or-org/my-awesome-project",
          "source_path": "docs/latest",
          "target_subfolder": "my-awesome-project"
        }
        ```
    *   **Field Explanations**:
        *   `"name"`: (String) A human-readable name for the documentation source. This will be used as the title in the auto-generated `_index.md` if the source doesn't provide its own.
        *   `"repo"`: (String) The GitHub repository slug in the format `owner/repository-name` from which to fetch the documentation.
        *   `"source_path"`: (String) The specific path/folder *within the external repository* that contains the Markdown documentation files you want to include (e.g., `docs`, `guides/content`, `api-docs`).
        *   `"target_subfolder"`: (String) The name of the subfolder that will be created under `content/docs/` in *this* website repository. The fetched documentation will be placed here (e.g., `my-awesome-project`, `api-reference-v1`). This path should be unique for each source.

3.  **Commit Changes**:
    *   Commit and push your changes to `external-docs-config.json` to the `main` branch.
    *   The workflow will automatically trigger on this push and attempt to fetch the newly configured documentation.

#### Manual Trigger

You can manually trigger the workflow:
1.  Go to the "Actions" tab of your repository.
2.  Select the "Fetch External Documentation" workflow from the list.
3.  Click the "Run workflow" dropdown.
4.  You can choose the branch (typically `main`) and click "Run workflow".

#### Hugo and Hextra Theme

This website uses Hugo as the static site generator and the Hextra theme. The fetched documentation should be standard Markdown. The Hextra theme will handle rendering it. Ensure that the `_index.md` files (either fetched or auto-generated) for each documentation section are configured appropriately if you need specific Hextra features like sidebar icons, custom ordering (weights), etc. The auto-generated `_index.md` includes `type: "docs"` which is standard for Hextra documentation sections.

---

*This README and the automated documentation fetching workflow were set up by Jules, your AI software engineering assistant.*
