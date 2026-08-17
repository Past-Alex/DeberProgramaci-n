const fs = require('fs');

const file = 'src/components/CoachView.tsx';
let content = fs.readFileSync(file, 'utf8');

const lines = content.split('\n');

// Replace imports
content = content.replace(
  "import { HabitTemplate, HabitColor, User, BlogPost, ReactionType } from '../types';", 
  "import { HabitTemplate, HabitColor, User } from '../types';\nimport { BlogView } from './blog/BlogView';"
);

const lines2 = content.split('\n');

// Find start and end indices
let startIndex = -1;
let endIndex = -1;

for (let i = 0; i < lines2.length; i++) {
  if (lines2[i].includes("{activeTab === 'blog' && (")) {
    startIndex = i;
    break;
  }
}

for (let i = startIndex; i < lines2.length; i++) {
  if (lines2[i].includes("{/* Delete Template Modal */}")) {
    endIndex = i;
    break;
  }
}

if (startIndex !== -1 && endIndex !== -1) {
  const newLines = [
    ...lines2.slice(0, startIndex),
    "            {activeTab === 'blog' && (",
    "              <motion.div",
    "                key=\"blog\"",
    "                initial={{ opacity: 0, y: 10 }}",
    "                animate={{ opacity: 1, y: 0 }}",
    "                exit={{ opacity: 0, y: -10 }}",
    "              >",
    "                <BlogView currentUser={user} />",
    "              </motion.div>",
    "            )}",
    ...lines2.slice(endIndex)
  ];
  
  // also we must remove the unused imports and state variables if possible.
  // We'll leave them for now and let eslint or typescript show errors.
  
  fs.writeFileSync(file, newLines.join('\n'));
  console.log("Successfully replaced CoachView.tsx!");
} else {
  console.log("Not found boundaries", startIndex, endIndex);
}
