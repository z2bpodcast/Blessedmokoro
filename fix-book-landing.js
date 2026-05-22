var fs = require('fs');
var c = fs.readFileSync('public/book_landing.html', 'utf8');

// Add password field after phone field
c = c.replace(
  "html += '<input id=\"reg-phone\" type=\"tel\" placeholder=\"WhatsApp Number * (+27...)\" style=\"width:100%;padding:11px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:3px;color:#f5f0e8;font-size:0.85rem;margin-bottom:12px;outline:none;\">';",
  "html += '<input id=\"reg-phone\" type=\"tel\" placeholder=\"WhatsApp Number * (+27...)\" style=\"width:100%;padding:11px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:3px;color:#f5f0e8;font-size:0.85rem;margin-bottom:8px;outline:none;\">';\n  html += '<input id=\"reg-password\" type=\"password\" placeholder=\"Create Password * (min 6 characters)\" style=\"width:100%;padding:11px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:3px;color:#f5f0e8;font-size:0.85rem;margin-bottom:12px;outline:none;\">';\n  html += '<div style=\"font-size:0.68rem;color:rgba(255,255,255,0.2);margin-bottom:10px;font-style:italic;\">You will use this password to log into your member dashboard</div>';"
);

fs.writeFileSync('public/book_landing.html', c);
console.log('Done');
