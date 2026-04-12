const fs=require('fs'),path=require('path');
function walk(dir){
  let res=[];
  fs.readdirSync(dir).forEach(f=>{
    let file=path.join(dir,f);
    if(fs.statSync(file).isDirectory()) res=res.concat(walk(file));
    else if(file.endsWith('.jsx')||file.endsWith('.js')) res.push(file);
  });
  return res;
}
walk('./src').forEach(f=>{
  let c = fs.readFileSync(f,'utf8');
  c.split('\n').forEach((l,i)=>{
    if (l.includes('$') && !l.includes('${')) {
       // Ignore regex, mongoose logic
       if (!l.match(/\$(gte|lte|avg|match|sum|or|regex|options|in|push|pull|set)/)) {
           console.log(f + ':' + (i+1) + ' -> ' + l.trim());
       }
    }
  });
})
