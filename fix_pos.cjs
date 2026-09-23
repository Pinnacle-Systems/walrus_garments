const fs = require('fs');
const file = 'E:/Pinnacle/Walrus/client/src/Uniform/Components/PointOfSale/POSSession.jsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/let isOfferPrice = false;\r?\n?\/\* console\.log removed \*\/\?\.\w+\([\s\S]*?, \"barcodeDetails\", barcode\)/, 'let isOfferPrice = false;\n/* console.log removed */');
fs.writeFileSync(file, content, 'utf8');
console.log('Fixed POSSession.jsx');
