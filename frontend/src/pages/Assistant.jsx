// ASSISTANT.JSX - Assistant IA intelligent
// Analyse les donnees en temps reel et repond aux questions
// Fonctionne sans API externe - analyse directe des donnees MongoDB
import React, { useState, useRef, useEffect } from 'react';
import { getVentes, getClients, getProduits, getCommerciaux, getEvenements } from '../api';
import axios from 'axios';
const suggestions = ['Quel est mon produit le plus vendu ?','Analyse mes ventes du mois','Qui sont mes meilleurs clients ?','Quelles sont mes previsions ?','Comment augmenter mon CA ?'];
export default function Assistant() {
  const [messages, setMessages] = useState([{role:'assistant',content:'Bonjour ! 👋 Je suis votre assistant IA GestPro. Je peux analyser vos donnees de ventes, clients, produits et evenements au Togo. Comment puis-je vous aider ?'}]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:'smooth'});},[messages]);
  const sendMessage = async (msg) => {
    const text = msg || input;
    if(!text.trim()||loading) return;
    setMessages(m=>[...m,{role:'user',content:text}]);
    setInput('');
    setLoading(true);
    try {
      const [v,c,p,com,e] = await Promise.all([getVentes(),getClients(),getProduits(),getCommerciaux(),getEvenements()]);
      const totalCA = v.data.reduce((s,x)=>s+(x.quantite*x.prixUnitaire),0);
      const topProduit = Object.entries(v.data.reduce((acc,x)=>{ const nom=x.produit?.nom||'Inconnu'; acc[nom]=(acc[nom]||0)+x.quantite; return acc; },{})).sort((a,b)=>b[1]-a[1])[0];
      const context = 'Tu es un assistant IA expert pour GestPro, une plateforme de gestion au Togo. Donnees actuelles: '+
        'Ventes: '+v.data.length+' transactions, CA total: '+Math.round(totalCA).toLocaleString('fr')+' FCFA, '+
        'Clients: '+c.data.length+' (dont '+c.data.filter(x=>x.segment==='professionnel').length+' professionnels), '+
        'Produits: '+p.data.length+', Commerciaux: '+com.data.length+', Evenements: '+e.data.length+'. '+
        (topProduit ? 'Produit le plus vendu: '+topProduit[0]+' ('+topProduit[1]+' unites). ' : '')+
        'Reponds en francais, de facon claire et professionnelle. Donne des conseils concrets adaptes au marche togolais.';
      const res = await axios.post('http://localhost:5000/api/ia/chat',{ message: text, context });
      setMessages(m=>[...m,{role:'assistant',content:res.data.reply}]);
    } catch(err) {
      setMessages(m=>[...m,{role:'assistant',content:'⚠️ Erreur: '+err.message}]);
    }
    setLoading(false);
  };
  return (
    <div style={{display:'flex',flexDirection:'column',height:'100vh',background:'#f8fafc'}}>
      <div style={{background:'linear-gradient(135deg,#1e1b4b,#312e81)',padding:'1.5rem 2rem',color:'white'}}>
        <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
          <div style={{width:'48px',height:'48px',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem'}}>🤖</div>
          <div><h1 style={{fontSize:'1.3rem',fontWeight:'700'}}>Assistant IA GestPro</h1><p style={{color:'#a5b4fc',fontSize:'0.85rem'}}>Powered by Claude AI - Analyse de vos donnees en temps reel</p></div>
        </div>
      </div>
      <div style={{padding:'1rem 2rem',background:'white',borderBottom:'1px solid #e5e7eb',display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
        {suggestions.map((s,i)=>(
          <button key={i} onClick={()=>sendMessage(s)} style={{padding:'0.4rem 0.9rem',background:'#f3f4f6',border:'1px solid #e5e7eb',borderRadius:'2rem',fontSize:'0.8rem',color:'#4b5563',cursor:'pointer'}}>
            {s}
          </button>
        ))}
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'1.5rem 2rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
        {messages.map((m,i)=>(
          <div key={i} style={{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start',animation:'fadeInUp 0.3s ease both'}}>
            {m.role==='assistant'&&<div style={{width:'36px',height:'36px',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem',marginRight:'0.5rem',flexShrink:0}}>🤖</div>}
            <div style={{maxWidth:'70%',padding:'0.9rem 1.2rem',borderRadius:m.role==='user'?'1.2rem 1.2rem 0.3rem 1.2rem':'1.2rem 1.2rem 1.2rem 0.3rem',background:m.role==='user'?'linear-gradient(135deg,#6366f1,#8b5cf6)':'white',color:m.role==='user'?'white':'#1e1b4b',fontSize:'0.9rem',lineHeight:'1.7',boxShadow:'0 2px 10px rgba(0,0,0,0.08)',whiteSpace:'pre-wrap'}}>{m.content}</div>
          </div>
        ))}
        {loading&&(
          <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
            <div style={{width:'36px',height:'36px',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>🤖</div>
            <div style={{padding:'0.9rem 1.2rem',background:'white',borderRadius:'1.2rem',boxShadow:'0 2px 10px rgba(0,0,0,0.08)',display:'flex',gap:'0.3rem',alignItems:'center'}}>
              <div style={{width:'8px',height:'8px',background:'#6366f1',borderRadius:'50%',animation:'pulse 1s ease 0s infinite'}}></div>
              <div style={{width:'8px',height:'8px',background:'#6366f1',borderRadius:'50%',animation:'pulse 1s ease 0.2s infinite'}}></div>
              <div style={{width:'8px',height:'8px',background:'#6366f1',borderRadius:'50%',animation:'pulse 1s ease 0.4s infinite'}}></div>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>
      <div style={{padding:'1rem 2rem',background:'white',borderTop:'1px solid #e5e7eb',display:'flex',gap:'0.75rem'}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMessage()} placeholder='Posez votre question sur vos donnees...' style={{flex:1,padding:'0.9rem 1.2rem',borderRadius:'0.75rem',border:'2px solid #e5e7eb',fontSize:'0.9rem',fontFamily:'inherit'}} />
        <button onClick={()=>sendMessage()} disabled={loading} style={{padding:'0.9rem 1.5rem',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'white',border:'none',borderRadius:'0.75rem',cursor:'pointer',fontWeight:'600',fontSize:'0.9rem',boxShadow:'0 4px 15px rgba(99,102,241,0.4)'}}>Envoyer ✨</button>
      </div>
    </div>
  );
}