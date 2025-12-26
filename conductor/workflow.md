# Project Workflow

## Guiding Principles

1. **The Plan is the Source of Truth:** All work must be tracked in `plan.md`
2. **The Tech Stack is Deliberate:** Changes to the tech stack must be documented in `tech-stack.md` *before* implementation
3. **Linting and Static Analysis:** Enforce strict linting and type checking to ensure code quality and consistency.
4. **User Experience First:** Every decision should prioritize user experience
5. **Non-Interactive & CI-Aware:** Prefer non-interactive commands. Use `CI=true` for watch-mode tools (linters) to ensure single execution.

## Task Workflow

All tasks follow a strict lifecycle:

### Standard Task Workflow

1. **Select Task:** Choose the next available task from `plan.md` in sequential order

2. **Mark In Progress:** Before beginning work, edit `plan.md` and change the task from `[ ]` to `[~]`

3. **Implement Feature/Fix:**
   - Write the application code necessary to complete the task.
   - Adhere to the project's code style guides and architecture.

4. **Verify Implementation:**
   - Run linting and type checking commands (e.g., `npm run lint`, `tsc`).
   - Manually verify the functionality as needed.

5. **Document Deviations:** If implementation differs from tech stack:
   - **STOP** implementation
   - Update `tech-stack.md` with new design
   - Add dated note explaining the change
   - Resume implementation

6. **Commit Code Changes with Task Summary:**
   - Stage all code changes related to the task.
   - Propose a clear, concise commit message that includes a detailed summary.
   - **Structure:**
     ```
     <type>(<scope>): <description>

     Summary of changes:
     - [List of major changes]
     - [Files created/modified]
     - [The core "why" for the change]
     ```
   - Perform the commit.

7. **Get and Record Task Commit SHA:**
    - **Step 7.1: Update Plan:** Read `plan.md`, find the line for the completed task, update its status from `[~]` to `[x]`, and append the first 7 characters of the *just-completed commit's* commit hash.
    - **Step 7.2: Write Plan:** Write the updated content back to `plan.md`.

8. **Commit Plan Update:**
    - **Action:** Stage the modified `plan.md` file.
    - **Action:** Commit this change with a descriptive message (e.g., `conductor(plan): Mark task 'Create user model' as complete`).

### Phase Completion Verification and Checkpointing Protocol

**Trigger:** This protocol is executed immediately after a task is completed that also concludes a phase in `plan.md`.

1.  **Announce Protocol Start:** Inform the user that the phase is complete and the verification and checkpointing protocol has begun.

2.  **Verify Code Quality for Phase Changes:**
    -   **Step 2.1: Determine Phase Scope:** To identify the files changed in this phase, you must first find the starting point. Read `plan.md` to find the Git commit SHA of the *previous* phase's checkpoint. If no previous checkpoint exists, the scope is all changes since the first commit.
    -   **Step 2.2: List Changed Files:** Execute `git diff --name-only <previous_checkpoint_sha> HEAD` to get a precise list of all files modified during this phase.
    -   **Step 2.3: Run Linting and Type Checking:** Execute the project's linting and type checking commands to ensure no regressions in code quality.

3.  **Propose a Detailed, Actionable Manual Verification Plan:**
    -   **CRITICAL:** To generate the plan, first analyze `product.md`, `product-guidelines.md`, and `plan.md` to determine the user-facing goals of the completed phase.
    -   You **must** generate a step-by-step plan that walks the user through the verification process, including any necessary commands and specific, expected outcomes.
    -   The plan you present to the user **must** follow this format:

        **For a Frontend Change:**
        ```
        The code quality checks have passed. For manual verification, please follow these steps:

        **Manual Verification Steps:**
        1.  **Start the development server with the command:** `npm run dev`
        2.  **Open your browser to:** `http://localhost:3000`
        3.  **Confirm that you see:** The new user profile page, with the user's name and email displayed correctly.
        ```

        **For a Backend Change:**
        ```
        The code quality checks have passed. For manual verification, please follow these steps:

        **Manual Verification Steps:**
        1.  **Ensure the server is running.**
        2.  **Execute the following command in your terminal:** `curl -X POST http://localhost:8080/api/v1/users -d '{"name": "test"}'`
        3.  **Confirm that you receive:** A JSON response with a status of `201 Created`.
        ```

4.  **Await Explicit User Feedback:**
    -   After presenting the detailed plan, ask the user for confirmation: "**Does this meet your expectations? Please confirm with yes or provide feedback on what needs to be changed.**"
    -   **PAUSE** and await the user's response. Do not proceed without an explicit yes or confirmation.

5.  **Create Checkpoint Commit:**
    -   Stage all changes. If no changes occurred in this step, proceed with an empty commit.
    -   Perform the commit with a clear and concise message (e.g., `conductor(checkpoint): Checkpoint end of Phase X`) that includes the verification summary.

6.  **Get and Record Phase Checkpoint SHA:**
    -   **Step 6.1: Get Commit Hash:** Obtain the hash of the *just-created checkpoint commit* (`git log -1 --format="%H"`).
    -   **Step 6.2: Update Plan:** Read `plan.md`, find the heading for the completed phase, and append the first 7 characters of the commit hash in the format `[checkpoint: <sha>]`.
    -   **Step 6.3: Write Plan:** Write the updated content back to `plan.md`.

7. **Commit Plan Update:**
    - **Action:** Stage the modified `plan.md` file.
    - **Action:** Commit this change with a descriptive message following the format `conductor(plan): Mark phase '<PHASE NAME>' as complete`.

8.  **Announce Completion:** Inform the user that the phase is complete and the checkpoint has been created.

### Quality Gates

Before marking any task complete, verify:

- [ ] Code follows project's code style guidelines (as defined in `code_styleguides/`)
- [ ] All public functions/methods are documented (e.g., docstrings, JSDoc, GoDoc)
- [ ] Type safety is enforced (e.g., type hints, TypeScript types, Go types)
- [ ] No linting or static analysis errors (using the project's configured tools)
- [ ] Works correctly on mobile (if applicable)
- [ ] Documentation updated if needed
- [ ] No security vulnerabilities introduced

## Development Commands

**AI AGENT INSTRUCTION: This section should be adapted to the project's specific language, framework, and build tools.**

### Setup
```bash
# Example: Commands to set up the development environment (e.g., install dependencies, configure database)
# e.g., for a Node.js project: npm install
```

### Daily Development
```bash
# Example: Commands for common daily tasks (e.g., start dev server, lint, format)
# e.g., for a Node.js project: npm run dev, npm run lint
```

### Before Committing
```bash
# Example: Commands to run all pre-commit checks (e.g., format, lint, type check)
# e.g., for a Node.js project: npm run lint && npm run build
```

## Testing Requirements (NOT APPLICABLE)
*This project focuses on linting and manual verification instead of automated unit/integration tests.*

## Code Review Process

### Self-Review Checklist
Before requesting review:

1. **Functionality**
   - Feature works as specified
   - Edge cases handled
   - Error messages are user-friendly

2. **Code Quality**
   - Follows style guide
   - DRY principle applied
   - Clear variable/function names
   - Appropriate comments

3. **Security**
   - No hardcoded secrets
   - Input validation present
   - SQL injection prevented
   - XSS protection in place

4. **Performance**
   - Database queries optimized
   - Images optimized
   - Caching implemented where needed

5. **Mobile Experience**
   - Touch targets adequate (44x44px)
   - Text readable without zooming
   - Performance acceptable on mobile
   - Interactions feel native

## Commit Guidelines

### Message Format
```
<type>(<scope>): <description>

Summary of changes:
- [List of major changes]
- [Files created/modified]
- [The core "why" for the change]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `chore`: Maintenance tasks

### Examples
```bash
git commit -m "feat(auth): Add remember me functionality

Summary of changes:
- Added 'rememberMe' boolean to login form state
- Implemented persistent cookie storage for session tokens
- Modified 'auth-service.ts' to check for cookies on init
- Why: To improve user retention and convenience by avoiding frequent re-logins."
```

## Definition of Done

A task is complete when:

1. All code implemented to specification
2. Code passes all configured linting and static analysis checks
3. Documentation complete (if applicable)
4. Works beautifully on mobile (if applicable)
5. Implementation notes added to `plan.md`
6. Changes committed with proper message including summary
7. Manual verification successful

## Emergency Procedures

### Critical Bug in Production
1. Create hotfix branch from main
2. Implement minimal fix
3. Test thoroughly including mobile
4. Deploy immediately
5. Document in plan.md

### Data Loss
1. Stop all write operations
2. Restore from latest backup
3. Verify data integrity
4. Document incident
5. Update backup procedures

### Security Breach
1. Rotate all secrets immediately
2. Review access logs
3. Patch vulnerability
4. Notify affected users (if any)
5. Document and update security procedures

## Deployment Workflow

### Pre-Deployment Checklist
- [ ] No linting errors
- [ ] Type checking passes
- [ ] Mobile testing complete
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Backup created

### Deployment Steps
1. Merge feature branch to main
2. Tag release with version
3. Push to deployment service (Vercel)
4. Run database migrations
5. Verify deployment
6. Test critical paths
7. Monitor for errors

### Post-Deployment
1. Monitor analytics
2. Check error logs
3. Gather user feedback
4. Plan next iteration

## Continuous Improvement

- Review workflow weekly
- Update based on pain points
- Document lessons learned
- Optimize for user happiness
- Keep things simple and maintainable