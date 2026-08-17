import sys

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the start of the blog tab
    start_str = "{activeTab === 'blog' && ("
    start_idx = content.find(start_str)
    
    if start_idx == -1:
        print('Could not find blog tab in', file_path)
        return

    # Replace imports depending on the file
    if 'CoachView' in file_path:
      content = content.replace(
        "import { HabitTemplate, HabitColor, User, BlogPost, ReactionType } from '../types';", 
        "import { HabitTemplate, HabitColor, User } from '../types';\nimport { BlogView } from './blog/BlogView';"
      )
    else:
      # App.tsx
      content = content.replace(
        "import { BlogPost, Habit, HabitColor, User, HabitTemplate, ReactionType } from './types';", 
        "import { Habit, HabitColor, User, HabitTemplate } from './types';\nimport { BlogView } from './components/blog/BlogView';"
      )
      # Also need to remove useBlogPosts from App.tsx rendering... wait! App.tsx also has `{activeTab === 'blog' && (`
    
    # Recalculate start_idx since imports changed length
    start_idx = content.find(start_str)

    brace_count = 1
    idx = start_idx + 1 # start at the '{'
    
    while idx < len(content) and brace_count > 0:
        if content[idx] == '{':
            brace_count += 1
        elif content[idx] == '}':
            brace_count -= 1
        idx += 1
        
    end_idx = idx

    replacement = """{activeTab === 'blog' && (
              <motion.div
                key="blog"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <BlogView currentUser={currentUser || user} />
              </motion.div>
            )}"""
            
    # For App.tsx it's `currentUser`, for CoachView it's `user`. So we can just put `currentUser={user ? user : currentUser}`.
    # Actually, CoachView has `user`, App.tsx has `currentUser`.
    if 'CoachView' in file_path:
      replacement = replacement.replace('currentUser || user', 'user')
    else:
      replacement = replacement.replace('currentUser || user', 'currentUser')

    new_content = content[:start_idx] + replacement + content[end_idx:]
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('Done replacing BlogView in', file_path)

process_file('src/components/CoachView.tsx')
process_file('src/App.tsx')
