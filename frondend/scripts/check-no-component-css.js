/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const appRoot = path.resolve(__dirname, '..', 'src', 'app');
const forbiddenSuffixes = ['.component.css', '.component.scss'];

const allowlist = new Set([
  // Legacy component styles kept until each feature is migrated to Tailwind.
  'shared/layout/app-shell/app-shell.component.css',
  'shared/forms/task-fields/task-fields.component.css',
  'shared/ui/stakeholder-select/stakeholder-select.component.css',
  'shared/ui/toast/toast-host.component.css',
  'shared/ui/confirm-dialog/confirm-dialog.component.css',
  'features/cases/case-tasks/case-tasks.component.css',
  'features/timeline/components/timeline-list/timeline-list.component.css',
  'features/cases/case-detail/case-detail.component.css',
  'features/cases/cases-page/cases-page.component.css',
  'features/cases/case-meetings/case-meetings.component.css',
  'features/cases/components/case-create-dialog/case-create-dialog.component.css',
  'features/cases/case-timeline/case-timeline.component.css',
  'features/stakeholders/components/stakeholder-form/stakeholder-form.component.css',
  'features/stakeholders/components/stakeholder-list/stakeholder-list.component.css',
  'features/case-detail/components/stakeholder-list/stakeholder-list.component.css'
]);

if (!fs.existsSync(appRoot)) {
  console.error(`Expected app root not found: ${appRoot}`);
  process.exit(1);
}

const violations = [];

const walk = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }
    if (!entry.isFile()) {
      continue;
    }
    if (!forbiddenSuffixes.some((suffix) => fullPath.endsWith(suffix))) {
      continue;
    }
    const relativePath = path.relative(appRoot, fullPath).split(path.sep).join('/');
    if (!allowlist.has(relativePath)) {
      violations.push(relativePath);
    }
  }
};

walk(appRoot);

if (violations.length > 0) {
  console.error('New component CSS/SCSS files are not allowed:');
  for (const file of violations) {
    console.error(`- ${file}`);
  }
  console.error('Migrate styles to Tailwind or add a temporary allowlist entry.');
  process.exit(1);
}

console.log('Style guard passed: no new component CSS/SCSS files found.');
