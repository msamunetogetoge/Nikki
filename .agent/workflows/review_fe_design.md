---
description: Review a frontend design document against the standard template.
---

1. Read the target design document.
   - User should provide the path to the design document (e.g., `docs/design/login_screen.md`).
2. Read the design template for reference.
   - `docs/templates/fe_screen_design.md`
3. Read the review agent prompt.
   - `.agent/prompts/review_fe_design.md`
4. Generate a review using the agent prompt and the content of the design document and template.
   - The agent should act as the reviewer defined in the prompt.
   - Output the review in the specified format.
5. Save the review output to a file.
   - Path: `docs/dev/review/[filename]_review.md` (where [filename] is the basename of the design document).
   - Ensure the directory `docs/dev/review` exists.