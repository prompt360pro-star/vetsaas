const fs = require('fs');
const path = require('path');

function fixEntities(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixEntities(fullPath);
    } else if (file.endsWith('.entity.ts') || file.endsWith('.dto.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');

      const lines = content.split('\n');
      const newLines = lines.map(line => {
        // Only target lines inside classes that define a property without an initializer
        // Examples:
        // id: string;
        // @Column()
        // name: string;

        // Skip lines that have !, =, ?, or are getters/setters/methods
        if (line.includes('!') || line.includes('=') || line.includes('?') || line.includes('(') || line.includes('{') || line.includes('}')) {
          return line;
        }

        // Match typical property declaration: optional whitespace, optional visibility/readonly, property name, colon, type
        // Group 1: Leading whitespace + optional modifiers (public/private/protected/readonly)
        // Group 2: Property name
        // Group 3: The rest starting from the colon
        const match = line.match(/^(\s+(?:(?:public|private|protected)\s+)?(?:readonly\s+)?)((?![0-9])[a-zA-Z0-9_]+)\s*(:.*)$/);

        if (match) {
          // exclude decorators or keywords like return, case, etc
          if (!match[2].match(/^(return|case|throw|break|continue)$/) && !line.trim().startsWith('@')) {
             return `${match[1]}${match[2]}!${match[3]}`;
          }
        }
        return line;
      });
      fs.writeFileSync(fullPath, newLines.join('\n'));
    }
  }
}

fixEntities('./packages/api/src');
