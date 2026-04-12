const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('./src');
let changedFiles = [];

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    let original = content;
    
    // Pattern 1: $${var} -> ₹${var}
    content = content.replace(/\$\$\{/g, '₹${');
    
    // Pattern 2: >${var} -> >₹{var} (Wait, they used >${var} in CarDetail)
    content = content.replace(/>\$\{/g, '>₹{');
    
    // Pattern 3: >$50 or >$ -> >₹
    content = content.replace(/>\s*\$/g, '>₹');

    // Pattern 4: HiCurrencyDollar -> HiCurrencyRupee
    content = content.replace(/HiCurrencyDollar/g, 'HiCurrencyRupee');

    // Pattern 5: (/day) literal prices with dollar like `$${car.pricePerDay}`
    // already handled by Pattern 1. But what if it's text like `Total: $100`?
    content = content.replace(/:\s*\$/g, ': ₹');

    // Pattern 6: literal string '$' -> '₹'
    content = content.replace(/'\$'/g, "'₹'");
    content = content.replace(/"\$"/g, '"₹"');

    // Pattern 7: className literal string interpolation inside tags like <td ...>${c.totalAmount}</td>
    content = content.replace(/\}</g, '}<'); // noop
    // To catch >${ something }
    content = content.replace(/>\s*\$\s*\{/g, '>₹{');
    
    // Pattern 8: `Amount: $${`
    content = content.replace(/Amount:\s*\$\$\{/g, 'Amount: ₹${');

    // Pattern 9: `\$` in template literals without `{` but with numbers? E.g. `$20`
    // content = content.replace(/\$(\d+)/g, '₹$1'); // Be careful, $1 is a backreference in replace!
    // We can do an exact map.
    content = content.replace(/\$([0-9])/g, '₹$1');

    if (content !== original) {
        fs.writeFileSync(f, content, 'utf8');
        changedFiles.push(f);
    }
});

console.log('Modified ' + changedFiles.length + ' files:');
console.log(changedFiles.join('\n'));
