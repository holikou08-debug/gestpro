code = """  return (
    <div style={{padding:'2rem',height:'100vh',display:'flex',flexDirection:'column',background:'#f8fafc'}}>
      <div style={{marginBottom:'1.5rem'}}><h1 style={{fontSize:'1.5rem',fontWeight:'700',color:'#1e1b4b'}}>Assistant IA</h1><p style={{color:'#6b7280'}}>Analyse automatique par Claude AI</p></div>
      <div style={{flex:1,background:'white',borderRadius:'1rem',padding:'1.5rem',boxShadow:'0 1px 10px rgba(0,0,0,0.07)',overflowY:'auto',marginBottom:'1rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
        {messages.map((m,i)=>(
          <div key={i} style={{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start'}}>
            <div style={{maxWidth:'70%',padding:'0.9rem 1.2rem',borderRadius:'1rem',background:m.role==='user'?'linear-gradient(135deg,#6366f1,#8b5cf6)':'#f3f4f6',color:m.role==='user'?'white':'#1e1b4b',fontSize:'0.9rem',lineHeight:'1.6'}}>{m.content}</div>
          </div>
        ))}
        {loading&&<div style={{padding:'1rem',color:'#6b7280'}}>Analyse en cours...</div>}
        <div ref={bottomRef}/>
      </div>
      <div style={{display:'flex',gap:'0.75rem'}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMessage()} placeholder='Posez votre question...' style={{flex:1,padding:'0.9rem',borderRadius:'0.75rem',border:'2px solid #e5e7eb',fontSize:'0.9rem',outline:'none'}} />
        <button onClick={sendMessage} disabled={loading} style={{padding:'0.9rem 1.5rem',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'white',border:'none',borderRadius:'0.75rem',cursor:'pointer',fontWeight:'600'}}>Envoyer</button>
      </div>
    </div>
  );
}"""
with open('src/pages/Assistant.jsx', 'a', encoding='utf-8') as f:
    f.write(code + '\n')
print('partie 3 ok')
