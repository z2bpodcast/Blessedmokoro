var fs = require('fs');
var c = fs.readFileSync('public/book_landing.html', 'utf8');

// 1. Get password value alongside name/email/phone
c = c.replace(
  "var phone=document.getElementById('reg-phone').value.trim();",
  "var phone=document.getElementById('reg-phone').value.trim();\n  var password=document.getElementById('reg-password').value.trim();"
);

// 2. Validate password
c = c.replace(
  "if(!name||!email||!phone){errEl.textContent='Please fill in all fields.';errEl.style.display='block';return;}",
  "if(!name||!email||!phone||!password){errEl.textContent='Please fill in all fields.';errEl.style.display='block';return;}\n  if(password.length<6){errEl.textContent='Password must be at least 6 characters.';errEl.style.display='block';return;}"
);

// 3. Send password to API
c = c.replace(
  "body:JSON.stringify({fullName:name,email:email,phone:phone,pkg:pkg,ref:ref})",
  "body:JSON.stringify({fullName:name,email:email,phone:phone,password:password,pkg:pkg,ref:ref})"
);

fs.writeFileSync('public/book_landing.html', c);
console.log('Done');
