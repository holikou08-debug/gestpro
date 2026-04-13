f=open('src/App.jsx','r',encoding='utf-8')
c=f.read()
f.close()

# Supprimer l'onglet evenements du menu
lines = c.split('\n')
new_lines = [l for l in lines if 'evenements' not in l.lower() or 'import' in l.lower()]
c = '\n'.join(new_lines)

f=open('src/App.jsx','w',encoding='utf-8')
f.write(c)
f.close()
print('Evenements supprime!')