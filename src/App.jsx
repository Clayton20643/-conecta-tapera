import { useMemo, useState } from 'react';
import { ArrowRight, Bell, BriefcaseBusiness, Building2, CalendarDays, Heart, MapPin, Menu, Newspaper, Search, ShieldCheck, Store, Users, Wrench, X, Sparkles } from 'lucide-react';

const categories = [
  { name: 'Comércios', icon: Store }, { name: 'Serviços', icon: Wrench },
  { name: 'Empregos', icon: BriefcaseBusiness }, { name: 'Eventos', icon: CalendarDays },
  { name: 'Notícias', icon: Newspaper }, { name: 'Comunidade', icon: Users }
];
const places = [
  { name: 'Mercadinho Central', type: 'Mercado e mercearia', category: 'Comércios', location: 'Centro • São José da Tapera', initials: 'MC', tone: 'green' },
  { name: 'Studio Beleza & Cia', type: 'Beleza e estética', category: 'Serviços', location: 'Centro • São José da Tapera', initials: 'BC', tone: 'pink' },
  { name: 'Oficina do João', type: 'Mecânica automotiva', category: 'Serviços', location: 'Bairro Dez • São José da Tapera', initials: 'OJ', tone: 'blue' },
  { name: 'Papelaria Criativa', type: 'Papelaria e presentes', category: 'Comércios', location: 'Centro • São José da Tapera', initials: 'PC', tone: 'yellow' }
];

export default function App() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todos');
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState('');
  const [favorites, setFavorites] = useState([]);
  const results = useMemo(() => places.filter(p =>
    (category === 'Todos' || p.category === category) &&
    (p.name + ' ' + p.type + ' ' + p.location).toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'))
  ), [query, category]);
  const toggleFavorite = name => setFavorites(old => old.includes(name) ? old.filter(x => x !== name) : [...old, name]);

  return <div className="app">
    <header className="topbar">
      <a className="brand" href="#"><span className="brand-mark"><i/><i/><i/></span><span><b>conecta<span>tapera</span></b><small>SUA CIDADE, MAIS PERTO.</small></span></a>
      <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">{menuOpen ? <X/> : <Menu/>}</button>
      <nav className={menuOpen ? 'nav open' : 'nav'}>{[['Explorar','#explorar'],['Categorias','#categorias'],['Comunidade','#comunidade'],['Sobre','#sobre']].map(([t,h])=><a key={t} href={h} onClick={()=>setMenuOpen(false)}>{t}</a>)}</nav>
      <div className="actions"><button className="bell" aria-label="Notificações"><Bell size={19}/></button><button className="login" onClick={()=>setModal('login')}>Entrar</button><button className="primary compact" onClick={()=>setModal('register')}>Criar conta <ArrowRight size={15}/></button></div>
    </header>

    <main>
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow"><Sparkles size={15}/> A CONEXÃO QUE A NOSSA TERRA MERECE</span>
          <h1>Sua cidade conectada.<br/><em>Sua comunidade</em> mais forte.</h1>
          <p>Encontre comércios, serviços, oportunidades e tudo o que movimenta São José da Tapera e região.</p>
          <form className="search" onSubmit={e=>{e.preventDefault();document.querySelector('#explorar')?.scrollIntoView({behavior:'smooth'});}}>
            <Search size={20}/><input value={query} onChange={e=>{setQuery(e.target.value);setCategory('Todos');}} placeholder="O que você está procurando hoje?" aria-label="Buscar"/><button className="primary">Buscar <ArrowRight size={16}/></button>
          </form>
          <div className="hero-meta"><span><MapPin size={15}/> São José da Tapera, Alagoas</span><i/> Conectando toda a região</div>
        </div>
        <div className="hero-art" aria-hidden="true"><div className="sun"/><div className="hills"/><div className="town"><i/><i/><i/></div><div className="road"/><div className="float f1"><Store size={17}/> Comércio local</div><div className="float f2"><Users size={17}/> Gente conectada</div></div>
        <div className="hero-foot"><span>FEITO PARA A NOSSA GENTE</span><i/><span>ALAGOAS · BRASIL</span></div>
      </section>

      <section className="trust">
        {[[Building2,'Negócios locais','Valorize quem é daqui'],[Users,'Comunidade unida','Mais perto de todos'],[BriefcaseBusiness,'Novas oportunidades','Trabalho e crescimento'],[ShieldCheck,'Espaço confiável','Informação com cuidado']].map(([Icon,title,desc])=><div key={title}><span><Icon size={20}/></span><p><b>{title}</b><small>{desc}</small></p></div>)}
      </section>

      <section className="section" id="categorias">
        <div className="heading"><div><label>EXPLORE A REGIÃO</label><h2>O que você precisa,<br/><em>está por aqui.</em></h2></div><a className="text-link" href="#explorar">Ver tudo <ArrowRight size={16}/></a></div>
        <div className="categories">{categories.map(({name,icon:Icon},i)=><button key={name} onClick={()=>{setCategory(name);document.querySelector('#explorar')?.scrollIntoView({behavior:'smooth'});}}><span className={'cat-icon c'+i}><Icon size={21}/></span><b>{name}</b><ArrowRight className="cat-arrow" size={16}/></button>)}</div>
      </section>

      <section className="section discover" id="explorar">
        <div className="heading"><div><label>DESCUBRA PERTO DE VOCÊ</label><h2>Conheça quem faz<br/><em>a cidade acontecer.</em></h2></div><button className="reset" onClick={()=>setCategory('Todos')}>{category==='Todos'?'Todas as categorias':category}⌄</button></div>
        <div className="filters"><button className={category==='Todos'?'active':''} onClick={()=>setCategory('Todos')}>Todos</button>{categories.slice(0,2).map(c=><button className={category===c.name?'active':''} key={c.name} onClick={()=>setCategory(c.name)}>{c.name}</button>)}</div>
        {results.length ? <div className="cards">{results.map(p=><article className="place-card" key={p.name}><div className={'cover '+p.tone}><span className="tag">Destaque local</span><button aria-label="Favoritar" className={favorites.includes(p.name)?'favorite selected':'favorite'} onClick={()=>toggleFavorite(p.name)}><Heart size={18} fill={favorites.includes(p.name)?'currentColor':'none'}/></button><b>{p.initials}</b></div><div className="place-info"><small>{p.type}</small><h3>{p.name}</h3><p><MapPin size={13}/>{p.location}</p><button className="detail" onClick={()=>setModal('login')}>Ver detalhes <ArrowRight size={15}/></button></div></article>)}</div> : <div className="empty"><Search/><b>Nenhum resultado encontrado</b><span>Tente outro termo ou escolha uma categoria diferente.</span><button onClick={()=>{setQuery('');setCategory('Todos');}}>Limpar busca</button></div>}
        <p className="demo">Prévia visual com estabelecimentos ilustrativos. Cadastros reais serão exibidos após a implantação do banco de dados e da moderação.</p>
      </section>

      <section className="community" id="comunidade"><span className="community-icon"><Users size={29}/></span><div><label>A CIDADE É FEITA POR VOCÊ</label><h2>Tem um negócio ou serviço?<br/><em>Seu lugar é aqui.</em></h2><p>Faça parte da rede que fortalece a economia e aproxima as pessoas da nossa região.</p></div><button onClick={()=>setModal('register')}>Quero participar <ArrowRight size={16}/></button></section>

      <section className="section news"><div className="heading"><div><label>FIQUE POR DENTRO</label><h2>O que acontece<br/><em>na nossa comunidade.</em></h2></div></div><div className="news-grid">{[[Newspaper,'COMUNIDADE','Fique por dentro do que acontece na sua cidade','Acompanhe comunicados, iniciativas e novidades da região em um só lugar.'],[CalendarDays,'AGENDA','Eventos e encontros da comunidade','Descubra atividades, ações sociais e eventos próximos de você.']].map(([Icon,label,title,desc])=><article key={label}><span><Icon size={22}/></span><label>{label}</label><h3>{title}</h3><p>{desc}</p><a href="#comunidade">Saiba mais <ArrowRight size={15}/></a></article>)}</div></section>
    </main>

    <footer id="sobre"><div className="footer-grid"><div><a className="brand foot-brand" href="#"><span className="brand-mark"><i/><i/><i/></span><span><b>conecta<span>tapera</span></b><small>SUA CIDADE, MAIS PERTO.</small></span></a><p>Sua cidade conectada.<br/>Sua comunidade mais forte.</p></div>{[['Explore','Comércios','Serviços','Oportunidades'],['Comunidade','Cadastre seu negócio','Divulgue um evento','Fale conosco'],['Plataforma','Sobre o projeto','Privacidade','Termos de uso']].map(([h,...links])=><div className="foot-col" key={h}><b>{h}</b>{links.map(t=><a key={t} href="#sobre">{t}</a>)}</div>)}</div><div className="copyright"><span>© 2026 Conecta Tapera. Projeto em desenvolvimento.</span><span>Feito para São José da Tapera e região ♥</span></div></footer>

    {modal && <div className="backdrop" onClick={()=>setModal('')}><div className="modal" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setModal('')} aria-label="Fechar"><X/></button><span className="brand-mark"><i/><i/><i/></span><label>CONECTA TAPERA</label><h2>{modal==='login'?'Que bom ter você de volta.':'Vamos conectar você à cidade.'}</h2><p>{modal==='login'?'A área de acesso estará disponível quando a autenticação for ativada.':'O cadastro de moradores e negócios será liberado na próxima etapa do projeto.'}</p><div className="notice"><ShieldCheck size={19}/>Esta versão é uma prévia. Nenhum dado pessoal é coletado ou armazenado.</div><button className="primary full" onClick={()=>setModal('')}>Entendi</button></div></div>}
  </div>;
}
