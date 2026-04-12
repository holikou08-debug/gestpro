f=open('src/App.jsx','r',encoding='utf-8')
c=f.read()
f.close()

c=c.replace("{ path:'/assistant'","{ path:'/analyse', label:'Analyse', icon:'🔍' },\n  { path:'/assistant'")
c=c.replace("<Route path='/assistant'","<Route path='/analyse' element={<Analyse/>}/>\n            <Route path='/assistant'")

f=open('src/App.jsx','w',encoding='utf-8')
f.write(c)
f.close()
print('App.jsx mis a jour!')