// Create a separate P2G fixture with an explicit neutral expression.
// This avoids resetExpression/currentExpression caching when returning to the same emotion.
import fs from 'node:fs/promises';
import path from 'node:path';
const [sourceArg,outputArg]=process.argv.slice(2);
if(!sourceArg||!outputArg)throw Error('Usage: node scripts/prepare-p2g-model.mjs <model-directory> <new-output-directory>');
const source=await fs.realpath(sourceArg),output=path.resolve(outputArg);
const relative=path.relative(source,output);
if(!relative||(!relative.startsWith('..'+path.sep)&&relative!=='..'&&!path.isAbsolute(relative)))throw Error('Output must be outside the source directory');
try{await fs.access(output);throw Error('Output already exists; choose a new directory');}catch(e){if(e.code!=='ENOENT')throw e;}
const entries=await fs.readdir(source);
const models=entries.filter(f=>f.endsWith('.model3.json'));
if(models.length!==1)throw Error('Expected exactly one top-level model3.json');
const model=JSON.parse(await fs.readFile(path.join(source,models[0]),'utf8'));
const neutralName='LabNeutral',neutralFile='expressions/lab_neutral.exp3.json';
if(model.FileReferences.Expressions?.some(e=>e.Name===neutralName||e.File===neutralFile))throw Error('Neutral expression already exists');
await fs.cp(source,output,{recursive:true,errorOnExist:true,force:false});
await fs.mkdir(path.join(output,'expressions'),{recursive:true});
await fs.writeFile(path.join(output,neutralFile),JSON.stringify({Type:'Live2D Expression',FadeInTime:0.25,FadeOutTime:0.25,Parameters:[]},null,2)+'\n');
model.FileReferences.Expressions=[...(model.FileReferences.Expressions||[]),{Name:neutralName,File:neutralFile}];
await fs.writeFile(path.join(output,models[0]),JSON.stringify(model,null,2)+'\n');
console.log(JSON.stringify({output,neutralExpression:neutralName,p2gMapping:{NEUTRAL:neutralName}}));
