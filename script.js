/* eslint-disable */
const fs = require("fs");

const files = [
  "components/employees/add-employee-dialog.tsx",
  "components/recruitment/create-job-dialog.tsx",
  "components/recruitment/edit-job-dialog.tsx",
  "components/leave/leave-application-dialog.tsx",
  "components/performance/create-appraisal-dialog.tsx",
  "components/training/schedule-training-dialog.tsx",
];

files.forEach((f) => {
  try {
    let content = fs.readFileSync(f, "utf8");
    // regex to catch ' required\n', ' required ', ' required>' etc.
    content = content.replace(/\s+required(\s|\/|>)/g, "$1");
    fs.writeFileSync(f, content);
    console.log(`Processed ${f}`);
  } catch (e) {
    console.log(`Failed ${f}: ${e.message}`);
  }
});
