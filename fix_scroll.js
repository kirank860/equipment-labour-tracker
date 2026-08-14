const fs = require('fs');

const files = [
  'app/(admin)/labour.tsx',
  'app/(admin)/equipment.tsx',
  'app/(admin)/materials.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Replace outer View
  content = content.replace(
    /<View className={`flex-1 bg-slate-50 \$\{isMobile \? 'p-4' : 'p-8'\}`}>/g,
    `<View className="flex-1 bg-slate-50">\n      <ScrollView className="flex-1" contentContainerStyle={{ padding: isMobile ? 16 : 32, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>`
  );

  // Remove flex-1 from table wrappers
  content = content.replace(
    /<View className="flex-1 bg-transparent overflow-hidden">/g,
    `<View className="bg-transparent overflow-hidden">`
  );
  content = content.replace(
    /<View className={`flex-1 \$\{isMobile \? '' : 'bg-white rounded-2xl shadow-sm border border-slate-200'\} pb-4`}>/g,
    `<View className={\`\${isMobile ? '' : 'bg-white rounded-2xl shadow-sm border border-slate-200'} pb-4\`}>`
  );

  // Change inner ScrollView to View
  content = content.replace(
    /<ScrollView className="flex-1">/g,
    `<View className="flex-col">`
  );

  // Close outer ScrollView and change inner closing tag
  content = content.replace(
    /<\/ScrollView>\n          \)}\n        <\/View>\n      <\/View>\n\n      \{\/\* Details Modal \*\/\}/g,
    `</View>\n          )}\n        </View>\n      </View>\n      </ScrollView>\n\n      {/* Details Modal */}`
  );

  fs.writeFileSync(file, content);
}
console.log("Done");
