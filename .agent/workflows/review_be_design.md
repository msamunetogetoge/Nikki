---
description: Review a backend API design document against the standard template.
---

1.  Identify the target design document.
    - If the user provided a file path, use it.
    - If not, use the currently active file.
2.  Read the content of the target design document.
3.  Read the content of the template: `docs/templates/be_api_design.md`.
4.  Read the system prompt: `.agent/prompts/review_be_design.md`.
5.  Send the following message to the LLM (using the system prompt):
    "Please review the following Backend API Design document based on the provided template and system prompt.

    **Template**:
    {{content of docs/templates/be_api_design.md}}

    **Design Document**:
    {{content of target file}}
    "
6.  Save the review output to a file.
    - Path: `docs/dev/review/[filename]_review.md` (where [filename] is the basename of the design document).
    - Ensure the directory `docs/dev/review` exists.