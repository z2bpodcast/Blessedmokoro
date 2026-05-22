var fs = require('fs');
var c = fs.readFileSync('app/store/[slug]/page.tsx', 'utf8');

// Add postAudio and postVideo state after postImg
c = c.replace(
  "const [postImg,    setPostImg]    = useState('')",
  "const [postImg,    setPostImg]    = useState('')\n  const [postAudio,  setPostAudio]  = useState('')\n  const [postVideo,  setPostVideo]  = useState('')"
);

// Add audio/video to post insert
c = c.replace(
  "image_url:   postImg || null,",
  "image_url:   postImg   || null,\n      audio_url:   postAudio || null,\n      video_url:   postVideo || null,"
);

// Reset after post
c = c.replace(
  "setPostImg('')",
  "setPostImg('')\n    setPostAudio('')\n    setPostVideo('')"
);

fs.writeFileSync('app/store/[slug]/page.tsx', c);
console.log('Done');
