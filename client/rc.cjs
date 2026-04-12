const fs=require('fs');
['./src/pages/owner/AddCar.jsx', './src/pages/owner/EditCar.jsx'].forEach(f => {
    let c = fs.readFileSync(f, 'utf8');
    c = c.replace(/\(\$\)/g, '(₹)');
    fs.writeFileSync(f, c, 'utf8');
});
