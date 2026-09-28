'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Upload, RotateCcw, ChevronLeft, ChevronRight, X,
  FileText, CheckCircle2, Send, Loader2, LogIn, Copy, ExternalLink} from 'lucide-react';
import Breadcrumb from '@/components/ui/Breadcrumb';
import toast from 'react-hot-toast';
import styles from './instant-quote.module.css';

// ─── CONFIG ────────────────────────────────────────────────────────────────
const CONFIG = {
  pricing: { lowMultiplier: 3, highMultiplier: 5, minimumJobFee: 1000, setupFee: 0 }, // INR
  materials: {
    pla:   { label: 'PLA',   density: 1.24, pricePerKg: 2075 },
    petg:  { label: 'PETG',  density: 1.27, pricePerKg: 2490 },
    abs:   { label: 'ABS',   density: 1.04, pricePerKg: 2324 },
    asa:   { label: 'ASA',   density: 1.07, pricePerKg: 2905 },
    tpu:   { label: 'TPU',   density: 1.21, pricePerKg: 3320 },
    nylon: { label: 'Nylon', density: 1.15, pricePerKg: 3735 },
    pc:    { label: 'PC',    density: 1.20, pricePerKg: 3486 },
    resin: { label: 'Resin', density: 1.18, pricePerKg: 4980 }} as Record<string, { label: string; density: number; pricePerKg: number }>,
  buildStyles: {
    thin:     { label: 'Thin Wall / Shell', shellMm: 1.2, coreFill: 0.05, note: 'Best for shell-heavy or hollow parts. Still approximate.' },
    standard: { label: 'Standard',          shellMm: 1.6, coreFill: 0.15, note: 'Typical general-use estimate.' },
    strong:   { label: 'Strong',            shellMm: 2.0, coreFill: 0.30, note: 'Heavier shell and fuller interior.' },
    solid:    { label: 'Solid',             shellMm: 0,   coreFill: 1.0,  note: 'Most predictable estimate.' }} as Record<string, { label: string; shellMm: number; coreFill: number; note: string }>,
  defaultMaterialKey:   'pla',
  defaultBuildStyleKey: 'standard'};

interface Part { file: File; geometry: any; units: 'mm' | 'in'; autoUnitReason: string; }

// ─── MATH ──────────────────────────────────────────────────────────────────
function signedTetraVol(ax:number,ay:number,az:number,bx:number,by:number,bz:number,cx:number,cy:number,cz:number){
  return (ax*(by*cz-bz*cy)-ay*(bx*cz-bz*cx)+az*(bx*cy-by*cx))/6;
}
function computeVolume(pos: Float32Array){
  let v=0; for(let i=0;i<pos.length;i+=9) v+=signedTetraVol(pos[i],pos[i+1],pos[i+2],pos[i+3],pos[i+4],pos[i+5],pos[i+6],pos[i+7],pos[i+8]);
  return Math.abs(v);
}
function computeArea(pos: Float32Array){
  let a=0;
  for(let i=0;i<pos.length;i+=9){
    const[ax,ay,az,bx,by,bz,cx,cy,cz]=[pos[i],pos[i+1],pos[i+2],pos[i+3],pos[i+4],pos[i+5],pos[i+6],pos[i+7],pos[i+8]];
    const[abx,aby,abz,acx,acy,acz]=[bx-ax,by-ay,bz-az,cx-ax,cy-ay,cz-az];
    a+=0.5*Math.sqrt((aby*acz-abz*acy)**2+(abz*acx-abx*acz)**2+(abx*acy-aby*acx)**2);
  }
  return a;
}
function inferUnits(geo:any):{units:'mm'|'in';reason:string}{
  geo.computeBoundingBox();
  const s = {
    x: geo.boundingBox.max.x - geo.boundingBox.min.x,
    y: geo.boundingBox.max.y - geo.boundingBox.min.y,
    z: geo.boundingBox.max.z - geo.boundingBox.min.z};
  const mx=Math.max(Math.abs(s.x),Math.abs(s.y),Math.abs(s.z));
  const mn=Math.min(Math.abs(s.x),Math.abs(s.y),Math.abs(s.z));
  if(mx<=24) return {units:'in',reason:'Very small raw dimensions — likely inches.'};
  if(mx<=40&&mn<=3) return {units:'in',reason:'Thin part suggesting inch-based STL.'};
  return {units:'mm',reason:'Typical metric-sized part.'};
}
function fmt(v:number,d=2){return Number(v).toLocaleString('en-IN',{minimumFractionDigits:d,maximumFractionDigits:d});}
function fmtINR(v:number){return '₹'+Math.round(v).toLocaleString('en-IN');}
function fmtRange(lo:number,hi:number){return `${fmtINR(Math.max(0,lo))} – ${fmtINR(Math.max(lo,hi))}`;}

interface Stats {
  dimsDisplay:string; volumeDisplay:string; areaDisplay:string;
  volumeCc:number; areaCm2:number;
}
function getStats(geo:any, units:'mm'|'in'):Stats{
  geo.computeBoundingBox();
  const s = {
    x: geo.boundingBox.max.x - geo.boundingBox.min.x,
    y: geo.boundingBox.max.y - geo.boundingBox.min.y,
    z: geo.boundingBox.max.z - geo.boundingBox.min.z};
  const sc=units==='mm'?1/25.4:1;
  const xIn=Math.abs(s.x)*sc, yIn=Math.abs(s.y)*sc, zIn=Math.abs(s.z)*sc;
  const pos=geo.attributes.position.array as Float32Array;
  const volIn3=computeVolume(pos)*sc**3;
  const volCc=volIn3*16.387064;
  const areaIn2=computeArea(pos)*sc**2;
  const areaCm2=areaIn2*6.4516;
  const dimsDisplay=units==='mm'
    ?`${fmt(xIn*25.4,1)} × ${fmt(yIn*25.4,1)} × ${fmt(zIn*25.4,1)} mm (${fmt(xIn,2)} × ${fmt(yIn,2)} × ${fmt(zIn,2)} in)`
    :`${fmt(xIn,3)} × ${fmt(yIn,3)} × ${fmt(zIn,3)} in (${fmt(xIn*25.4,1)} × ${fmt(yIn*25.4,1)} × ${fmt(zIn*25.4,1)} mm)`;
  return {
    dimsDisplay,
    volumeDisplay:`${fmt(volIn3,3)} in³ (${fmt(volCc,2)} cc)`,
    areaDisplay:`${fmt(areaIn2,2)} in² (${fmt(areaCm2,2)} cm²)`,
    volumeCc: volCc, areaCm2: areaCm2};
}
interface Estimate { weightG:number; materialCostINR:number; lowINR:number; highINR:number; }
function estimatePart(geo:any, units:'mm'|'in', matKey:string, styleKey:string):Estimate{
  const stats=getStats(geo,units);
  const mat=CONFIG.materials[matKey], style=CONFIG.buildStyles[styleKey];
  let pVol=stats.volumeCc;
  if(styleKey!=='solid'){
    const sVol=Math.min(stats.areaCm2*(style.shellMm/10),stats.volumeCc*0.92);
    pVol=sVol+Math.max(0,stats.volumeCc-sVol)*style.coreFill;
  }
  const wG=pVol*mat.density;
  const matINR=wG*(mat.pricePerKg/1000);
  const low=Math.max(matINR*CONFIG.pricing.lowMultiplier+CONFIG.pricing.setupFee, CONFIG.pricing.minimumJobFee);
  const high=Math.max(matINR*CONFIG.pricing.highMultiplier+CONFIG.pricing.setupFee, CONFIG.pricing.minimumJobFee);
  return {weightG:wG, materialCostINR:matINR, lowINR:low, highINR:high};
}

// ─── COMPONENT ──────────────────────────────────────────────────────────────
export default function InstantQuotePage(){
  const {data:session}=useSession();
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const threeRef=useRef<any>(null);
  const animRef=useRef<number>(0);
  const fileInputRef=useRef<HTMLInputElement>(null);

  const [parts,setParts]=useState<Part[]>([]);
  const [currentIdx,setCurrentIdx]=useState(-1);
  const [matKey,setMatKey]=useState(CONFIG.defaultMaterialKey);
  const [styleKey,setStyleKey]=useState(CONFIG.defaultBuildStyleKey);
  const [qty,setQty]=useState(1);
  const [isDragging,setIsDragging]=useState(false);
  const [isLoading,setIsLoading]=useState(false);
  const [loadingMsg,setLoadingMsg]=useState('');
  const [statusMsg,setStatusMsg]=useState('Add STL or OBJ files to calculate dimensions, estimated weight, and instant price ranges.');
  const [copied,setCopied]=useState(false);

  // Submit state
  const [showSubmit,setShowSubmit]=useState(false);
  const [submitting,setSubmitting]=useState(false);
  const [submitSuccess,setSubmitSuccess]=useState(false);
  const [uploadingFile,setUploadingFile]=useState(false);
  const [submitForm,setSubmitForm]=useState({title:'',description:'',color:''});

  const currentPart=parts[currentIdx]??null;
  const currentStats=currentPart?getStats(currentPart.geometry,currentPart.units):null;
  const currentEst=currentPart?estimatePart(currentPart.geometry,currentPart.units,matKey,styleKey):null;
  const totalEst=parts.reduce((acc,p)=>{
    const e=estimatePart(p.geometry,p.units,matKey,styleKey);
    return {lo:acc.lo+e.lowINR, hi:acc.hi+e.highINR};
  },{lo:0,hi:0});

  // ── Three.js init ──────────────────────────────────────────────────────
  useEffect(()=>{
    if(!canvasRef.current) return;
    let alive=true;
    (async()=>{
      const THREE=await import('three');
      const {OrbitControls}=await import('three/examples/jsm/controls/OrbitControls.js' as any);
      if(!alive||!canvasRef.current) return;
      const renderer=new THREE.WebGLRenderer({canvas:canvasRef.current,antialias:true,alpha:true,preserveDrawingBuffer:true});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
      const scene=new THREE.Scene();
      scene.background=null;
      const camera=new THREE.PerspectiveCamera(45,1,0.1,50000);
      camera.position.set(180,140,180);
      const controls=new OrbitControls(camera,renderer.domElement);
      controls.enableDamping=true;
      scene.add(new THREE.HemisphereLight(0xffffff,0xdcdcdc,1.4));
      const d1=new THREE.DirectionalLight(0xffffff,1.1);d1.position.set(250,300,180);scene.add(d1);
      const d2=new THREE.DirectionalLight(0xffffff,0.5);d2.position.set(-180,120,-140);scene.add(d2);
      threeRef.current={scene,camera,renderer,controls,mesh:null};
      const resize=()=>{
        const r=canvasRef.current?.getBoundingClientRect();
        if(!r?.width||!r?.height) return;
        renderer.setSize(r.width,r.height,false);
        camera.aspect=r.width/r.height;camera.updateProjectionMatrix();
      };
      resize();window.addEventListener('resize',resize);
      const animate=()=>{animRef.current=requestAnimationFrame(animate);controls.update();renderer.render(scene,camera);};
      animate();
    })();
    return ()=>{alive=false;cancelAnimationFrame(animRef.current);};
  },[]);

  const showPart=useCallback(async(idx:number,arr:Part[])=>{
    const three=threeRef.current;
    if(!three||!arr[idx]) return;
    const THREE=await import('three');
    const{scene,camera,controls}=three;
    if(three.mesh){scene.remove(three.mesh);three.mesh.geometry?.dispose();three.mesh.material?.dispose();three.mesh=null;}
    const part=arr[idx];
    const mat=new THREE.MeshStandardMaterial({color:0xffffff,metalness:0.02,roughness:0.84});
    const m=new THREE.Mesh(part.geometry.clone(),mat);
    scene.add(m);three.mesh=m;
    const box=new THREE.Box3().setFromObject(m);
    const size=box.getSize(new THREE.Vector3());
    const center=box.getCenter(new THREE.Vector3());
    controls.target.copy(center);
    const maxDim=Math.max(size.x,size.y,size.z)||100;
    const fov=camera.fov*(Math.PI/180);
    const cz=Math.abs((maxDim/2)/Math.tan(fov/2))*1.45;
    camera.position.set(center.x+cz*.78,center.y+cz*.50,center.z+cz*.82);
    camera.near=Math.max(0.1,maxDim/1000);camera.far=Math.max(50000,cz*10);
    camera.updateProjectionMatrix();controls.update();
  },[]);

  const loadFiles = useCallback(async (fileList: FileList | File[]) => {
    try {
      const files = Array.from(fileList).filter(f => /\.(stl|obj)$/i.test(f.name));
      if (!files.length) { toast.error('Please add .stl or .obj files'); return; }
      setIsLoading(true);
      
      const { STLLoader } = await import('three/examples/jsm/loaders/STLLoader.js' as any);
      const { OBJLoader } = await import('three/examples/jsm/loaders/OBJLoader.js' as any);
      const stlLoader = new STLLoader(), objLoader = new OBJLoader();
      
      const newParts: Part[] = []; let failed = 0;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setLoadingMsg(`Loading ${file.name} (${i + 1}/${files.length}) and detecting likely units…`);
        try {
          const buf = await file.arrayBuffer();
          let geo: any;
          if (/\.obj$/i.test(file.name)) {
            const THREE = await import('three');
            const { mergeGeometries } = await import('three/examples/jsm/utils/BufferGeometryUtils.js' as any);
            const obj = objLoader.parse(new TextDecoder().decode(buf));
            const geos: any[] = [];
            obj.traverse((c: any) => { if (c.isMesh && c.geometry) geos.push(c.geometry.clone()); });
            if (!geos.length) throw new Error('Empty OBJ');
            geo = geos.length === 1 ? geos[0] : mergeGeometries(geos);
          } else {
            geo = stlLoader.parse(buf);
          }
          if (!geo?.attributes?.position) throw new Error('No geometry in file');
          geo.computeVertexNormals(); geo.center();
          const { units, reason } = inferUnits(geo);
          newParts.push({ file, geometry: geo, units, autoUnitReason: reason });
        } catch (e: any) { 
          console.error('File parsing error:', e); 
          toast.error(`Error loading ${file.name}: ${e.message || 'Unknown parsing error'}`);
          failed++; 
        }
      }
      setIsLoading(false);
      if (!newParts.length) { toast.error(`Failed to load ${failed} file(s)`); return; }
      setParts(prev => {
        const existing = new Set(prev.map(p => `${p.file.name}__${p.file.size}`));
        const fresh = newParts.filter(p => !existing.has(`${p.file.name}__${p.file.size}`));
        const dupes = newParts.length - fresh.length;
        const updated = [...prev, ...fresh].sort((a, b) => a.file.name.localeCompare(b.file.name));
        const firstNewSig = `${fresh[0]?.file.name}__${fresh[0]?.file.size}`;
        const idx = updated.findIndex(p => `${p.file.name}__${p.file.size}` === firstNewSig);
        const newIdx = idx >= 0 ? idx : 0;
        setCurrentIdx(newIdx);
        showPart(newIdx, updated);
        let msg = `Added ${fresh.length} file(s).`;
        if (dupes) msg += ` ${dupes} duplicate(s) skipped.`;
        if (failed) msg += ` ${failed} file(s) failed.`;
        setStatusMsg(msg);
        return updated;
      });
    } catch (err: any) {
      console.error(err);
      toast.error(`Error loading file parser: ${err.message}`);
      setIsLoading(false);
    }
  }, [showPart]);

  const removePart=useCallback((i:number)=>{
    setParts(prev=>{
      const u=prev.filter((_,j)=>j!==i);
      if(!u.length){
        setCurrentIdx(-1);setStatusMsg('All files removed.');
        if(threeRef.current?.mesh){const{scene,mesh}=threeRef.current;scene.remove(mesh);mesh.geometry?.dispose();mesh.material?.dispose();threeRef.current.mesh=null;}
      }else{
        const ni=Math.min(i,u.length-1);setCurrentIdx(ni);showPart(ni,u);
        setStatusMsg(`Removed. ${u.length} file(s) remaining.`);
      }
      return u;
    });
  },[showPart]);

  const copySummary=async()=>{
    const mat=CONFIG.materials[matKey],style=CONFIG.buildStyles[styleKey];
    const lines=[
      'MechArt 3D — Instant Quote Summary',
      `Material: ${mat.label} — ₹${fmt(mat.pricePerKg,2)}/kg`,
      `Build Style: ${style.label}`,
      `Quantity: ${qty}`,
      `Total Estimate: ${fmtRange(totalEst.lo*qty, totalEst.hi*qty)}`,
      '',
      ...parts.map((p,i)=>{
        const e=estimatePart(p.geometry,p.units,matKey,styleKey);
        const s=getStats(p.geometry,p.units);
        return [`Part ${i+1}: ${p.file.name}`,`  Units: ${p.units.toUpperCase()}`,`  Dimensions: ${s.dimsDisplay}`,`  Volume: ${s.volumeDisplay}`,`  Weight: ${fmt(e.weightG,1)} g`,`  Material Cost: ${fmtINR(e.materialCostINR)}`,`  Estimate: ${fmtRange(e.lowINR,e.highINR)}`].join('\n');
      }),
    ];
    await navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true); setTimeout(()=>setCopied(false),2000);
  };

  const handleSubmit=async(e:React.FormEvent)=>{
    e.preventDefault();
    if(!session){toast.error('Please log in to submit');return;}
    setSubmitting(true);
    try{
      let stlFileUrl='';
      if (parts.length > 0) {
        setUploadingFile(true);
        const uploadedUrls = [];
        for (const p of parts) {
          const fd = new FormData();
          fd.append('file', p.file);
          const up = await fetch('/api/upload', { method: 'POST', body: fd });
          if (up.ok) {
            const d = await up.json();
            if (d.url) uploadedUrls.push(d.url);
          }
        }
        stlFileUrl = uploadedUrls.join(',');
        setUploadingFile(false);
      }
      const avgEstINR=currentEst?Math.round((currentEst.lowINR+currentEst.highINR)/2):0;

      const autoNotes = parts.map((p,i)=>{
        const e = estimatePart(p.geometry, p.units, matKey, styleKey);
        const s = getStats(p.geometry, p.units);
        return `[Part ${i+1}: ${p.file.name}]\nDimensions: ${s.dimsDisplay}\nVolume: ${s.volumeDisplay}\nWeight: ${fmt(e.weightG, 1)} g\nEst. Material Cost: ₹${fmt(e.materialCostINR, 2)}`;
      }).join('\n\n');
      
      const finalDesc = (submitForm.description ? submitForm.description + '\n\n' : '') 
        + `--- Auto-Generated Details ---\nBuild Style: ${CONFIG.buildStyles[styleKey].label}\nTotal Quantity: ${qty}\n\n` + autoNotes;

      const res=await fetch('/api/custom-requests',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          title:submitForm.title||`Instant Quote — ${parts.map(p=>p.file.name).join(', ')}`,
          description:finalDesc,
          material:CONFIG.materials[matKey].label,
          color:submitForm.color||'',
          quantity:qty,
          requestType:'INSTANT_QUOTE',
          stlFileUrl,
          estimatedPrice:avgEstINR/83, // store as approx USD
        })});
      if(!res.ok){const d=await res.json();throw new Error(d.error||'Submit failed');}
      setSubmitSuccess(true);
    }catch(err:any){toast.error(err.message);}
    finally{setSubmitting(false);setUploadingFile(false);}
  };

  const hasParts=parts.length>0;

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 pt-24">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 text-center">Quote Request Submitted!</h1>
        <p className="text-slate-500 text-center max-w-md mb-8">Our team will confirm pricing and contact you within 24 hours.</p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link href="/account/custom-requests" className="px-6 py-3 bg-slate-900 dark:bg-primary-600 text-white font-bold rounded-xl hover:bg-slate-700 dark:hover:bg-primary-700 transition-colors">Track My Request</Link>
          <Link href="/" className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold hover:bg-slate-50 transition-colors">Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950" style={{ paddingTop: '80px', paddingBottom: '40px' }}>
      {/* Breadcrumb outside the main tool layout to keep tool clean */}
      <div className="max-w-[1240px] mx-auto px-[10px] pb-3">
        <Breadcrumb items={[{ label: 'Products', href: '/products' }, { label: 'Instant Quote' }]} className="text-slate-500 [&_a]:text-slate-500 [&_a:hover]:text-slate-800" />
      </div>

      <div className={styles.qtWrap}>
        <section className={styles.qtShell}>
          <div className={styles.qtTopbar}>
            <div className={styles.qtTitle}>
              <div className={styles.qtKicker}>Free FFF / FDM STL Quote Tool</div>
              <h1>Estimate FFF 3D Printing Cost Instantly</h1>
              <p>Upload one or more STL files to view them in your browser and generate a rough estimate based on material, weight, build style, and pricing range. Your files are analyzed locally in the browser and are not uploaded.</p>
            </div>
            <div className={styles.qtTopMeta}>
              <div className={styles.qtChip}>{hasParts ? (parts.length === 1 ? '1 file added' : `${parts.length} files added`) : 'No files added yet'}</div>
              <div className={styles.qtChip}>{parts.length} {parts.length === 1 ? 'part' : 'parts'}</div>
            </div>
          </div>

          <div className={styles.qtGrid}>
            <section className={styles.qtPanel}>
              <div className={styles.qtPanelHead}>
                <div>
                  <h2>STL Viewer</h2>
                  <p>Add one or more STL files and click any part to preview it.</p>
                </div>
              </div>
              <div className={styles.qtPanelBody}>
                <div 
                  className={`${styles.qtUpload} ${isDragging ? styles.isDragover : ''}`}
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={e => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files.length) loadFiles(e.dataTransfer.files); }}
                  onClick={() => !isLoading && fileInputRef.current?.click()}
                  role="button" 
                  tabIndex={0}
                >
                  <strong>Drag and drop STL files here</strong>
                  <span>Add one STL or multiple STL files at any time</span>
                  <div className={styles.qtUploadActions} onClick={e => e.stopPropagation()}>
                    <button type="button" className={styles.qtBtn} id="chooseFilesBtn" disabled={isLoading} onClick={() => fileInputRef.current?.click()}>
                      {isLoading ? 'Loading…' : 'Add STL Files'}
                    </button>
                    {hasParts && (
                      <button type="button" className={`${styles.qtBtn} ${styles.qtBtnSecondary}`} id="clearAllBtn" disabled={isLoading} onClick={() => {
                        setParts([]); setCurrentIdx(-1); setStatusMsg('All STL files cleared.');
                        if (threeRef.current?.mesh) {
                          const { scene, mesh } = threeRef.current;
                          scene.remove(mesh); mesh.geometry?.dispose(); mesh.material?.dispose(); threeRef.current.mesh = null;
                        }
                      }}>
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className={styles.qtUploadHelp}>Accepted: .stl | Auto-detects likely units on load | Recommended under 50 MB each</div>
                  <div className={`${styles.qtLoadingBar} ${isLoading ? styles.isActive : ''}`} id="uploadLoadingBar" aria-hidden="true"><span></span></div>
                </div>

                <input ref={fileInputRef} id="stlFiles" type="file" accept=".stl,.obj" multiple className={styles.qtFileInput} onChange={e => { if (e.target.files?.length) { loadFiles(e.target.files); e.target.value = ''; } }} />

                <div className={styles.qtToolbar}>
                  <div className={styles.qtMiniText} id="statusMsg">{statusMsg}</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" className={styles.qtMiniBtn} id="prevPartBtn" disabled={currentIdx <= 0} onClick={() => { setCurrentIdx(currentIdx - 1); showPart(currentIdx - 1, parts); }}>Prev</button>
                    <button type="button" className={styles.qtMiniBtn} id="nextPartBtn" disabled={currentIdx >= parts.length - 1} onClick={() => { setCurrentIdx(currentIdx + 1); showPart(currentIdx + 1, parts); }}>Next</button>
                    <button type="button" className={styles.qtMiniBtn} id="resetViewBtn" onClick={() => { if (threeRef.current?.mesh) showPart(currentIdx, parts); }}>Reset</button>
                    <button type="button" className={styles.qtRemoveBtn} id="removeCurrentBtn" disabled={currentIdx < 0} onClick={() => { if (currentIdx >= 0) removePart(currentIdx); }}>Remove</button>
                  </div>
                </div>

                <div className={styles.qtViewerShell}>
                  <div className={styles.qtViewerTop}>
                    <div style={{ fontSize: '12px', fontWeight: 900 }} id="fileName">
                      {currentPart ? `Part ${currentIdx + 1} of ${parts.length} — ${currentPart.file.name}` : 'No STL loaded yet'}
                    </div>
                    <div className={styles.qtMiniText}>Click a part below to preview it</div>
                  </div>

                  <canvas ref={canvasRef} id="viewerCanvas" className={styles.qtViewer} style={{ height: 300, display: 'block' }}></canvas>

                  {!hasParts && !isLoading && (
                    <div className={`${styles.qtViewerLoading} ${styles.isActive}`} id="viewerLoading" style={{ background: 'transparent' }}>
                      <div className={styles.qtViewerLoadingBox} style={{ background: 'transparent', border: 'none' }}>
                        <div style={{ fontWeight: 900, fontSize: '13px'}}>Upload a file to see 3D preview</div>
                      </div>
                    </div>
                  )}

                  <div className={`${styles.qtViewerLoading} ${isLoading ? styles.isActive : ''}`} id="viewerLoading">
                    <div className={styles.qtViewerLoadingBox}>
                      <div className={styles.qtSpinner}></div>
                      <div>
                        <div style={{ fontWeight: 900, fontSize: '13px' }}>Loading STL file...</div>
                        <div style={{ marginTop: '4px', fontSize: '11px'}} id="viewerLoadingText">{loadingMsg}</div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.qtViewerNote}>
                    STL analysis happens entirely in your browser. Unit detection is automatic on load, and you can still adjust the current part if needed.
                  </div>
                </div>

                <div className={styles.qtParts}>
                  <div className={styles.qtPartsHead}>Added Parts</div>
                  <div className={styles.qtPartList} id="partsList">
                    {!hasParts ? (
                      <div className={styles.qtPartRow}>
                        <div className={styles.qtPartNum}>—</div>
                        <div className={styles.qtPartMain}>
                          <div className={styles.qtPartName}>No parts loaded yet</div>
                          <div className={styles.qtPartSub}>Add STL files and they will stay listed here.</div>
                        </div>
                        <div className={styles.qtPartPrice}>—</div>
                      </div>
                    ) : parts.map((part, i) => {
                      const e = estimatePart(part.geometry, part.units, matKey, styleKey);
                      const s = getStats(part.geometry, part.units);
                      const active = i === currentIdx;
                      return (
                        <div key={i} className={`${styles.qtPartRow} ${active ? styles.isActive : ''}`} onClick={() => { setCurrentIdx(i); showPart(i, parts); }}>
                          <div className={styles.qtPartNum}>{i + 1}</div>
                          <div className={styles.qtPartMain}>
                            <div className={styles.qtPartName}>
                              {part.file.name}
                              <span className={styles.qtUnitBadge}>{part.units.toUpperCase()}</span>
                            </div>
                            <div className={styles.qtPartSub}>{s.dimsDisplay}</div>
                          </div>
                          <div className={styles.qtPartMeta}>
                            Material: {CONFIG.materials[matKey].label}<br />
                            Build style: {CONFIG.buildStyles[styleKey].label}<br />
                            Weight: {fmt(e.weightG, 1)} g
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                            <div className={styles.qtPartPrice}>
                              {fmtRange(e.lowINR, e.highINR)}
                              <small>Approximate estimate</small>
                            </div>
                            <button type="button" className={styles.qtRemoveBtn} onClick={ev => { ev.stopPropagation(); removePart(i); }}>
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            <section className={styles.qtPanel}>
              <div className={styles.qtPanelHead}>
                <div>
                  <h2>Estimate</h2>
                  <p>The large estimate below is for the currently viewed part. Full job totals stay visible too.</p>
                </div>
              </div>
              <div className={styles.qtPanelBody}>
                <div className={styles.qtControlsGrid}>
                  <div className={styles.qtField}>
                    <label htmlFor="selectedPartUnits">Current Part Units</label>
                    <select id="selectedPartUnits" disabled={!currentPart} value={currentPart?.units ?? 'mm'} onChange={e => setParts(prev => prev.map((p, j) => j === currentIdx ? { ...p, units: e.target.value as 'mm' | 'in' } : p))}>
                      <option value="mm">Millimeters</option>
                      <option value="in">Inches</option>
                    </select>
                    <small>This applies only to the STL you are currently viewing.</small>
                  </div>

                  <div className={styles.qtField}>
                    <label htmlFor="materialSelect">Material</label>
                    <select id="materialSelect" value={matKey} onChange={e => setMatKey(e.target.value)}>
                      {Object.entries(CONFIG.materials).map(([k, v]) => (<option key={k} value={k}>{v.label}</option>))}
                    </select>
                    <small>Material density is used to estimate weight.</small>
                  </div>

                  <div className={styles.qtField}>
                    <label htmlFor="buildStyleSelect">Build Style</label>
                    <select id="buildStyleSelect" value={styleKey} onChange={e => setStyleKey(e.target.value)}>
                      {Object.entries(CONFIG.buildStyles).map(([k, v]) => (<option key={k} value={k}>{v.label}</option>))}
                    </select>
                    <small>Anything other than solid is a rough estimate.</small>
                  </div>

                  <div className={styles.qtField}>
                    <label htmlFor="qtyInput">Quantity</label>
                    <input id="qtyInput" type="number" min={1} value={qty} onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))} />
                    <small>Quantity applies to the full uploaded job.</small>
                  </div>
                </div>

                <div className={styles.qtStats}>
                  <div className={styles.qtStat}><div className={styles.k}>Current Part Dimensions</div><div className={styles.v} id="dimsValue">{currentStats?.dimsDisplay ?? '—'}</div></div>
                  <div className={styles.qtStat}><div className={styles.k}>Current STL Volume</div><div className={styles.v} id="currentVolumeValue">{currentStats?.volumeDisplay ?? '—'}</div></div>
                  <div className={styles.qtStat}><div className={styles.k}>Current Part Area</div><div className={styles.v} id="surfaceAreaValue">{currentStats?.areaDisplay ?? '—'}</div></div>
                  <div className={styles.qtStat}><div className={styles.k}>Estimated Weight</div><div className={styles.v} id="weightValue">{currentEst ? `${fmt(currentEst.weightG, 1)} g` : '—'}</div></div>
                  <div className={styles.qtStat}><div className={styles.k}>Estimated Material Cost</div><div className={styles.v} id="materialCostValue">{currentEst ? fmtINR(currentEst.materialCostINR) : '—'}</div></div>
                  <div className={styles.qtStat}><div className={styles.k}>Job Estimate Range</div><div className={styles.v} id="jobSubtotalValue">{hasParts ? fmtRange(totalEst.lo * qty, totalEst.hi * qty) : '—'}</div></div>
                </div>

                <div className={styles.qtEstimate}>
                  <div className={styles.qtEstimateTop}>
                    <div>
                      <div className={styles.qtLabel}>Current Part Estimate Range</div>
                      <div className={styles.qtPrice} id="priceRange">{currentEst ? fmtRange(currentEst.lowINR, currentEst.highINR) : '₹0 – ₹0'}</div>
                      <div className={styles.qtPriceSub} id="priceSub">
                        {currentEst
                          ? `${CONFIG.materials[matKey].label} • ${CONFIG.buildStyles[styleKey].label} • ₹${fmt(CONFIG.materials[matKey].pricePerKg, 0)}/kg`
                          : 'Add STL files to generate an estimate range for the currently viewed part.'}
                      </div>
                    </div>
                    <div className={styles.qtPriceMeta} id="priceMeta">
                      Current part: {currentEst ? fmtRange(currentEst.lowINR, currentEst.highINR) : '₹0 – ₹0'}<br />
                      Full job: {hasParts ? fmtRange(totalEst.lo * qty, totalEst.hi * qty) : '₹0 – ₹0'}<br />
                      Quantity: {qty}
                    </div>
                  </div>
                </div>

                <div className={styles.qtBtnRow}>
                  <button type="button" className={`${styles.qtBtn} ${styles.qtBtnSecondary}`} id="copySummaryBtn" disabled={!hasParts} onClick={copySummary}>
                    {copied ? 'Copied!' : 'Copy Estimate'}
                  </button>
                  <button type="button" className={styles.qtBtn} id="finalQuoteBtn" disabled={!hasParts} onClick={() => setShowSubmit(!showSubmit)}>
                    {showSubmit ? 'Hide Form' : 'Request Final Quote'}
                  </button>
                </div>

                <div className={styles.qtNote} id="estimateNote">
                  {CONFIG.buildStyles[styleKey].note} Final numbers will vary with shell count, top and bottom layers, supports, and slicer settings. Use this tool for a rough range, not slicer-accurate quoting.
                </div>

                {showSubmit && (
                  <div style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '16px', padding: '12px', marginTop: '10px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 900, marginBottom: '2px'}}>Request Final Quote</h3>
                    <p style={{ fontSize: '11px', marginBottom: '12px' }}>Your file &amp; browser estimate will be sent for confirmation.</p>
                    {!session ? (
                      <div style={{ textAlign: 'center', padding: '16px 0' }}>
                        <p style={{ fontSize: '12px', marginBottom: '10px' }}>Log in to submit a quote request.</p>
                        <Link href="/auth/login?callbackUrl=/instant-quote" className={styles.qtBtn} style={{ textDecoration: 'none', display: 'inline-block' }}>Log In to Submit</Link>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div className={styles.qtField}>
                          <label style={{ fontSize: '10px', textTransform: 'uppercase'}}>Project Name</label>
                          <input type="text" value={submitForm.title} onChange={e => setSubmitForm(p => ({ ...p, title: e.target.value }))} placeholder="Auto-filled from file name" />
                        </div>
                        <div className={styles.qtField}>
                          <label style={{ fontSize: '10px', textTransform: 'uppercase'}}>Notes for Team</label>
                          <textarea rows={2} value={submitForm.description} onChange={e => setSubmitForm(p => ({ ...p, description: e.target.value }))} placeholder="Orientation, surface finish, deadline…" style={{ resize: 'none' }} />
                        </div>
                        <div className={styles.qtField}>
                          <label style={{ fontSize: '10px', textTransform: 'uppercase'}}>Color Preference</label>
                          <input type="text" value={submitForm.color} onChange={e => setSubmitForm(p => ({ ...p, color: e.target.value }))} placeholder="Any / Matte Black / White" />
                        </div>
                        {currentEst && (
                          <div style={{ padding: '8px 10px', borderRadius: '12px', fontSize: '11px'}}>
                            <strong>Estimate attached:</strong> {fmtRange(totalEst.lo * qty, totalEst.hi * qty)} · {parts.length} part(s) × qty {qty}
                          </div>
                        )}
                        <button type="submit" disabled={submitting || uploadingFile} className={styles.qtBtn} style={{ width: '100%', marginTop: '4px' }}>
                          {submitting || uploadingFile ? (uploadingFile ? 'Uploading…' : 'Submitting…') : 'Submit Quote Request'}
                        </button>
                        <p style={{ fontSize: '10px', textAlign: 'center', marginTop: '4px' }}>File uploaded securely. We confirm pricing within 24 hours.</p>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Footer */}
          <p className="text-center text-[11px] text-slate-400 pb-1">
            Estimates are approximate. Use this tool for a rough range, not slicer-accurate quoting.{' '}
            <Link href="/contact" className="text-slate-700 dark:text-slate-300 font-bold hover:underline">Contact us</Link> for a precise quote.
          </p>
        </section>
      </div>
    </div>
  );
}
